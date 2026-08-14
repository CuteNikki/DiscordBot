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
    if (!interaction.isSelectMenu()) return;

    /**
     * Finding the select menu
     */
    let selectMenu = client.selectMenus.get(interaction.customId);

    if (!selectMenu) {
      selectMenu = client.selectMenus.find((s) => s.options.includeCustomId && interaction.customId.includes(s.options.customId));
    }

    if (!selectMenu) {
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

    if (selectMenu.options.isDevelopment && KEYS.DISCORD_DEV_OWNER_ID !== interaction.user.id) {
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

    if (interaction.inCachedGuild() && selectMenu.options.userPermissions) {
      const missingPermissions = interaction.member.permissions.missing(selectMenu.options.userPermissions);
      if (missingPermissions?.length) {
        await interaction
          .reply({
            components: [
              new ContainerBuilder()
                .setAccentColor(Colors.Red)
                .addTextDisplayComponents(
                  new TextDisplayBuilder().setContent(
                    t('interactions.permissions-user-missing', { lng, permissions: missingPermissions.join(', ') }),
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
     * Handling cooldowns
     */

    const cooldowns = client.cooldowns;
    const menuPrefix = 'smn_';
    const customId = menuPrefix + selectMenu.options.customId;
    if (!cooldowns.has(customId)) {
      cooldowns.set(customId, new Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(customId)!;
    const defaultCooldown = 3_000;
    const cooldownAmount = selectMenu.options.cooldown ?? defaultCooldown;

    if (timestamps.has(interaction.user.id)) {
      const expirationTime = timestamps.get(interaction.user.id)! + cooldownAmount;

      if (now < expirationTime) {
        const expiredTimestamp = Math.round(expirationTime / 1_000);
        return interaction
          .reply({
            components: [
              new ContainerBuilder().setAccentColor(Colors.Red).addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                  t('interactions.cooldown', {
                    lng,
                    id: selectMenu.options.customId,
                    timestamp: time(expiredTimestamp, TimestampStyles.RelativeTime),
                  }),
                ),
              ),
            ],
            flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2],
          })
          .catch((err) => logger.error({ err }, 'Error while replying to interaction'));
      }
    }

    timestamps.set(interaction.user.id, now);
    setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

    /**
     * Handling bot permissions
     */

    if (interaction.inCachedGuild() && selectMenu.options.botPermissions) {
      const missingPermissions = interaction.guild.members.me?.permissions.missing(selectMenu.options.botPermissions);
      if (missingPermissions?.length) {
        return interaction
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
     * Executing the select menu
     */

    try {
      await selectMenu.options.execute(interaction);
    } catch (error) {
      logger.error({ err: error }, 'Error while executing select menu');

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
          .catch((err) => logger.error({ err }, 'Error while replying to interaction'));
      } else if (!interaction.replied && !interaction.deferred) {
        await interaction
          .reply({
            content: '',
            components: [
              new ContainerBuilder()
                .setAccentColor(Colors.Red)
                .addTextDisplayComponents(new TextDisplayBuilder().setContent(t('interactions.error', { lng }))),
            ],
            files: [],
            embeds: [],
            flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2],
          })
          .catch((err) => logger.error({ err }, 'Error while replying to interaction'));
      }
    }
  },
});
