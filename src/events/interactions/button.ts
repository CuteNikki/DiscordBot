import { Collection, Colors, ContainerBuilder, Events, MessageFlags, TextDisplayBuilder, time, TimestampStyles } from 'discord.js';
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
  async execute(client, interaction) {
    if (!interaction.isButton()) return;

    /**
     * Finding the button
     */

    let button = client.buttons.get(interaction.customId);

    if (!button) {
      button = client.buttons.find((b) => b.options.includeCustomId && interaction.customId.includes(b.options.customId));
    }

    if (!button) {
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
        .catch((err) => logger.error({ err }, 'Error while replying to interaction'));
      return;
    }

    /**
     * Handling isDevelopment
     */

    if (button.options.isDevelopment && KEYS.DISCORD_DEV_OWNER_ID !== interaction.user.id) {
      await interaction
        .reply({
          components: [
            new ContainerBuilder()
              .setAccentColor(Colors.Red)
              .addTextDisplayComponents(new TextDisplayBuilder().setContent(t('interactions.development-only', { lng }))),
          ],
          flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2],
        })
        .catch((err) => logger.error({ err }, 'Error while replying to interaction'));
      return;
    }

    /**
     * Handling user permissions
     */

    if (interaction.inCachedGuild() && button.options.userPermissions) {
      const missingPermissions = interaction.member.permissions.missing(button.options.userPermissions);

      if (missingPermissions?.length) {
        return interaction
          .reply({
            components: [
              new ContainerBuilder().setAccentColor(Colors.Red).addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                  t('interactions.permissions-user-missing', {
                    lng,
                    permissions: missingPermissions.map((p) => `\`${t(`permissions.${p}`, { lng })}\``).join(', '),
                  }),
                ),
              ),
            ],
            flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2],
          })
          .catch((err) => logger.error({ err }, 'Error while replying to interaction'));
      }
    }

    /**
     * Handling cooldowns
     */

    const cooldowns = client.cooldowns;
    // Prefix: buttons and commands can have the same name/customId
    const buttonPrefix = 'btn_';
    const customId = buttonPrefix + button.options.customId;
    if (!cooldowns.has(customId)) {
      cooldowns.set(customId, new Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(customId)!;
    const defaultCooldown = 3_000;
    const cooldownAmount = button.options.cooldown ?? defaultCooldown;

    if (timestamps.has(interaction.user.id)) {
      const expirationTime = timestamps.get(interaction.user.id)! + cooldownAmount;

      if (now <= expirationTime) {
        const expiredTimestamp = Math.round(expirationTime / 1_000);
        return interaction.reply({
          components: [
            new ContainerBuilder().setAccentColor(Colors.Red).addTextDisplayComponents(
              new TextDisplayBuilder().setContent(
                t('interactions.cooldown', {
                  lng,
                  id: button.options.customId,
                  timestamp: time(expiredTimestamp, TimestampStyles.RelativeTime),
                }),
              ),
            ),
          ],
          flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2],
        });
      }
    }

    timestamps.set(interaction.user.id, now);
    setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

    /**
     * Handling bot permissions
     */

    if (interaction.inCachedGuild() && button.options.botPermissions) {
      const missingPermissions = interaction.guild.members.me?.permissions.missing(button.options.botPermissions);

      if (missingPermissions?.length) {
        await interaction
          .reply({
            components: [
              new ContainerBuilder().setAccentColor(Colors.Red).addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                  t('interactions.permissions-bot-missing', {
                    lng,
                    permissions: missingPermissions.map((p) => `\`${t(`permissions.${p}`, { lng })}\``).join(', '),
                  }),
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
     * Executing the button
     */

    try {
      await button.options.execute(interaction);
    } catch (error) {
      logger.error({ err: error }, 'Error while executing button');

      if (interaction.replied || interaction.deferred) {
        await interaction
          .editReply({
            content: '',
            components: [
              new ContainerBuilder()
                .setAccentColor(Colors.Red)
                .addTextDisplayComponents(new TextDisplayBuilder().setContent(t('interactions.error', { lng }))),
            ],
            files: [],
            embeds: [],
          })
          .catch((err) => logger.error({ err }, 'Error while editing reply to interaction'));
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
          .catch((err) => logger.error({ err }, 'Error while replying to interaction'));
      }
    }
  },
});
