import type { Infraction } from '@prisma/client';
import { MessageFlags } from 'discord.js';
import { t } from 'i18next';

import type { ExtendedClient } from 'classes/base/client';
import { SelectMenu } from 'classes/base/select';

import { getInfractionsByGuildId, getInfractionsByUserId, getInfractionsByUserIdAndGuildId } from 'database/infraction';

import { buildInfractionOverview } from 'utility/infraction';
import { logger } from 'utility/logger';

import { InfractionSortBy, InfractionSortOrder } from 'types/infraction';

export default new SelectMenu({
  customId: 'infractions-sort-by',
  includeCustomId: true,
  async execute(interaction) {
    const targetId = interaction.customId.split('_')[1];
    const sortOrder = parseInt(interaction.customId.split('_')[2]) as InfractionSortOrder;
    const sortBy = parseInt(interaction.values[0]) as InfractionSortBy;
    const showGuild = interaction.customId.split('_')[3] === '1';
    const showUser = interaction.customId.split('_')[4] === '1';

    const client = interaction.client as ExtendedClient;
    const itemsPerPage = 3;

    // Helper function to fetch infractions and target data
    const fetchInfractionsAndTarget = async (guildId?: string) => {
      let infractions: Infraction[] | null | void = null;
      let target: { id: string; displayName: string; imageURL: () => string | undefined } | null = null;

      if (guildId) {
        infractions = await getInfractionsByUserIdAndGuildId(targetId, guildId, sortBy, sortOrder).catch((err) =>
          logger.error({ err, guildId }, 'Failed to get infractions'),
        );
      } else {
        infractions = await getInfractionsByUserId(targetId, sortBy, sortOrder).catch((err) =>
          logger.error({ err, guildId: targetId }, 'Failed to get infractions'),
        );
      }

      const targetUser = await client.users.fetch(targetId).catch((err) => logger.error({ err, guildId }, 'Failed to fetch user'));

      if (!targetUser) return { infractions, target: null };

      target = {
        id: targetId,
        displayName: targetUser.username,
        imageURL: () => targetUser.displayAvatarURL(),
      };

      return { infractions, target };
    };

    // Guild-based handling
    if (interaction.inCachedGuild()) {
      let infractions, target;

      if (targetId === interaction.guildId) {
        // Handle guild infractions
        infractions = await getInfractionsByGuildId(targetId, sortBy, sortOrder).catch((err) =>
          logger.error({ err, guildId: targetId }, 'Failed to get infractions'),
        );
        target = {
          id: interaction.guildId,
          displayName: interaction.guild.name,
          imageURL: () => interaction.guild.iconURL() ?? undefined,
        };
      } else {
        // Handle user infractions in a guild
        ({ infractions, target } = await fetchInfractionsAndTarget(interaction.guild?.id));
      }

      if (!target) {
        await interaction.reply({
          content: t('infractions.invalid-user', { lng: interaction.locale }),
          flags: [MessageFlags.Ephemeral],
        });
        return;
      }

      if (infractions) {
        return interaction.update(
          buildInfractionOverview({
            client,
            infractions,
            itemsPerPage,
            target,
            sortBy,
            sortOrder,
            showGuild,
            showUser,
            locale: interaction.locale,
            page: 0,
          }),
        );
      }
      return;
    }

    // Handle the case where no guild is involved
    const { infractions, target } = await fetchInfractionsAndTarget();

    if (!target) {
      await interaction.reply({
        content: t('infractions.invalid-user', { lng: interaction.locale }),
        flags: [MessageFlags.Ephemeral],
      });
      return;
    }

    if (infractions) {
      return interaction.update(
        buildInfractionOverview({
          client,
          infractions,
          itemsPerPage,
          target,
          sortBy,
          sortOrder,
          showGuild,
          showUser,
          locale: interaction.locale,
          page: 0,
        }),
      );
    }
  },
});
