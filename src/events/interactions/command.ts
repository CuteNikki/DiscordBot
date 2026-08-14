import {
  Collection,
  Colors,
  ContainerBuilder,
  Events,
  MessageFlags,
  TextDisplayBuilder,
  time,
  TimestampStyles,
  type Interaction,
} from 'discord.js';
import { t } from 'i18next';

import { Event } from 'classes/base/event';

import { getBlacklist } from 'database/blacklist';
import { getGuildOrCreate } from 'database/guild';
import { getUserOrCreate } from 'database/user';

import { KEYS } from 'utility/keys';
import { logger } from 'utility/logger';

export default new Event({
  name: Events.InteractionCreate,
  once: false,
  async execute(client, interaction: Interaction) {
    if (!interaction.isCommand()) {
      return;
    }

    /**
     * Finding the command
     */

    const command = client.commands.get(interaction.commandName);
    if (!command) {
      return;
    }

    const lng = interaction.locale;

    /**
     * Handling blacklisted users
     */

    const blacklist = await getBlacklist(interaction.user.id);

    if (blacklist) {
      await interaction
        .reply({
          components: [
            new ContainerBuilder()
              .setAccentColor(Colors.Red)
              .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                  blacklist.expiresAt
                    ? t('interactions.blacklisted-timed', { lng, timestamp: time(Math.floor(blacklist.expiresAt.getTime() / 1_000)) })
                    : t('interactions.blacklisted-permanent', { lng }),
                ),
              ),
          ],
          flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2],
        })
        .catch((err) => logger.debug({ err }, 'Error while replying to interaction'));
      return;
    }

    /**
     * Handling isDevelopment
     */

    if (command.options.isDevelopment && KEYS.DISCORD_DEV_OWNER_ID !== interaction.user.id) {
      await interaction
        .reply({
          components: [
            new ContainerBuilder()
              .setAccentColor(Colors.Red)
              .addTextDisplayComponents(new TextDisplayBuilder().setContent(t('interactions.development-only', { lng }))),
          ],
          flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2],
        })
        .catch((err) => logger.debug({ err }, 'Error while replying to interaction'));
      return;
    }

    /**
     * Handling cooldowns
     */

    const cooldowns = client.cooldowns;
    const commandData = command.options.builder.toJSON();
    if (!cooldowns.has(commandData.name)) {
      cooldowns.set(commandData.name, new Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(commandData.name)!;
    const defaultCooldown = 3_000;
    const cooldownAmount = command.options.cooldown ?? defaultCooldown;

    if (timestamps.has(interaction.user.id)) {
      const expirationTime = timestamps.get(interaction.user.id)! + cooldownAmount;

      if (now <= expirationTime) {
        const expiredTimestamp = Math.round(expirationTime / 1_000);
        return interaction
          .reply({
            components: [
              new ContainerBuilder().setAccentColor(Colors.Red).addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                  t('interactions.cooldown', {
                    lng,
                    id: commandData.name,
                    timestamp: time(expiredTimestamp, TimestampStyles.RelativeTime),
                  }),
                ),
              ),
            ],
            flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2],
          })
          .catch((err) => logger.debug({ err }, 'Error while replying to interaction'));
      }
    }

    timestamps.set(interaction.user.id, now);
    setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

    /**
     * Handling bot permissions
     */

    if (interaction.inCachedGuild() && command.options.botPermissions) {
      const missingPermissions = interaction.guild.members.me?.permissions.missing(command.options.botPermissions);

      if (missingPermissions?.length) {
        await interaction
          .reply({
            components: [
              new ContainerBuilder()
                .setAccentColor(Colors.Red)
                .addTextDisplayComponents(
                  new TextDisplayBuilder().setContent(
                    t('interactions.permissions-bot-missing', { lng, permissions: missingPermissions.join(', ') }),
                  ),
                ),
            ],
            flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2],
          })
          .catch((err) => logger.error({ err }, 'Error while replying to interaction'));
        return;
      }
    }

    /**
     * Making sure user and guild exist in the database
     */

    await getUserOrCreate(interaction.user.id);
    if (interaction.inCachedGuild()) {
      await getGuildOrCreate(interaction.guild.id);
    }

    /**
     * Executing the command
     */

    try {
      await command.options.execute(interaction);
    } catch (error) {
      logger.error({ err: error }, 'Error while executing command');

      if (interaction.replied || interaction.deferred) {
        await interaction
          .followUp({
            content: '',
            components: [
              new ContainerBuilder()
                .setAccentColor(Colors.Red)
                .addTextDisplayComponents(new TextDisplayBuilder().setContent(t('interactions.error', { lng }))),
            ],
            files: [],
            embeds: [],
            flags: [MessageFlags.Ephemeral],
          })
          .catch((err) => logger.debug({ err }, 'Error while following up to interaction'));
      } else if (!interaction.replied && !interaction.deferred) {
        await interaction
          .reply({
            components: [
              new ContainerBuilder()
                .setAccentColor(Colors.Red)
                .addTextDisplayComponents(new TextDisplayBuilder().setContent(t('interactions.error', { lng }))),
            ],
            flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2],
          })
          .catch((err) => logger.debug({ err }, 'Error while replying to interaction'));
      }
    }
  },
});
