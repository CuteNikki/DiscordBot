import { MessageFlags } from 'discord.js';
import { t } from 'i18next';

import { Button } from 'classes/base/button';
import type { ExtendedClient } from 'classes/base/client';

import { getInfractionsByGuildId, getInfractionsByUserId, getInfractionsByUserIdAndGuildId } from 'database/infraction';

import { buildInfractionOverview } from 'utility/infraction';
import { logger } from 'utility/logger';

export default new Button({
  customId: 'infractions-last',
  includeCustomId: true,
  async execute(interaction) {
    const targetUserId = interaction.customId.split('_')[1];

    const client = interaction.client as ExtendedClient;
    const itemsPerPage = 3;

    // Helper function to fetch infractions and user data
    const fetchInfractionsAndTarget = async (guildId?: string) => {
      let infractions = null;
      let target = null;

      // Fetch infractions based on guild ID or just user ID
      if (guildId) {
        infractions = await getInfractionsByUserIdAndGuildId(targetUserId, guildId).catch((err) =>
          logger.error({ err, guildId }, 'Failed to get infractions'),
        );
      } else {
        infractions = await getInfractionsByUserId(targetUserId).catch((err) =>
          logger.error({ err, guildId: targetUserId }, 'Failed to get infractions'),
        );
      }

      // Fetch user data
      const targetUser = await client.users.fetch(targetUserId).catch(() => null);
      if (!targetUser) return { infractions, target: null };

      target = {
        id: targetUserId,
        displayName: targetUser.username,
        imageURL: () => targetUser.displayAvatarURL(),
      };

      return { infractions, target };
    };

    // If interaction is in a cached guild
    if (interaction.inCachedGuild()) {
      let infractions, target;

      if (targetUserId === interaction.guildId) {
        // Guild-based infractions (guild as the target)
        infractions = await getInfractionsByGuildId(targetUserId).catch((err) =>
          logger.error({ err, guildId: targetUserId }, 'Failed to get infractions'),
        );
        target = {
          id: interaction.guildId,
          displayName: interaction.guild.name,
          imageURL: () => interaction.guild.iconURL() ?? undefined,
        };
      } else {
        // User-based infractions in the guild
        ({ infractions, target } = await fetchInfractionsAndTarget(interaction.guild.id));
      }

      if (!target) {
        await interaction.reply({
          content: t('infractions.invalid-user', { lng: interaction.locale }),
          flags: [MessageFlags.Ephemeral],
        });
        return;
      }

      if (infractions) {
        return interaction.reply(
          buildInfractionOverview({
            client,
            infractions,
            target,
            itemsPerPage,
            locale: interaction.locale,
            page: Math.floor(infractions.length / itemsPerPage) - 1,
          }),
        );
      }
      return;
    }

    // If interaction is not in a cached guild, fetch infractions and user data
    const { infractions, target } = await fetchInfractionsAndTarget();

    if (!target) {
      await interaction.reply({
        content: t('infractions.invalid-user', { lng: interaction.locale }),
        flags: [MessageFlags.Ephemeral],
      });
      return;
    }

    if (infractions) {
      return interaction.reply(
        buildInfractionOverview({
          client,
          infractions,
          target,
          itemsPerPage,
          locale: interaction.locale,
          page: Math.floor(infractions.length / itemsPerPage) - 1,
        }),
      );
    }
  },
});
