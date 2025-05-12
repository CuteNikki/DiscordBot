import { MessageFlags } from 'discord.js';
import { t } from 'i18next';

import type { ExtendedClient } from 'classes/base/client';
import { Modal } from 'classes/base/modal';

import { getInfractionsByGuildId, getInfractionsByUserId, getInfractionsByUserIdAndGuildId } from 'database/infraction';

import { buildInfractionOverview } from 'utility/infraction';
import { logger } from 'utility/logger';

export default new Modal({
  customId: 'infractions-custom',
  includeCustomId: true,
  async execute(interaction) {
    await interaction.deferUpdate();

    const targetUserId = interaction.customId.split('_')[1];
    const sortOrder = parseInt(interaction.customId.split('_')[2]);
    const sortBy = parseInt(interaction.customId.split('_')[3]);
    const showGuild = interaction.customId.split('_')[4] === '1';
    const showUser = interaction.customId.split('_')[5] === '1';

    const client = interaction.client as ExtendedClient;

    // Helper function to fetch infractions and target
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

    const targetUser = await client.users.fetch(targetUserId).catch(() => null);

    if (!targetUser) {
      await interaction.followUp({
        content: 'User not found.',
        flags: [MessageFlags.Ephemeral],
      });
      return;
    }

    const page = interaction.fields.getTextInputValue('page');
    const newPageIndex = parseInt(page, 10) - 1;

    // If interaction is in a cached guild, fetch guild-specific infractions
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
        await interaction.followUp({
          content: t('infractions.invalid-user', { lng: interaction.locale }),
          flags: [MessageFlags.Ephemeral],
        });
        return;
      }

      if (!infractions) return;

      const itemsPerPage = 3;
      const totalPages = Math.ceil(infractions.length / itemsPerPage);

      if (isNaN(newPageIndex) || newPageIndex < 0 || newPageIndex >= totalPages) {
        await interaction.followUp({
          content: t('infractions.invalid-page', {
            lng: interaction.locale,
            totalPages,
          }),
          flags: [MessageFlags.Ephemeral],
        });
        return;
      }

      return interaction.editReply(
        buildInfractionOverview({
          client,
          infractions,
          target,
          itemsPerPage,
          sortBy,
          sortOrder,
          showGuild,
          showUser,
          locale: interaction.locale,
          page: newPageIndex,
        }),
      );
    }

    // If interaction is not in a cached guild, fetch infractions and user data
    const { infractions, target } = await fetchInfractionsAndTarget();

    if (!target) {
      await interaction.followUp({
        content: 'User not found.',
        flags: [MessageFlags.Ephemeral],
      });
      return;
    }

    if (!infractions) return;

    const itemsPerPage = 3;
    const totalPages = Math.ceil(infractions.length / itemsPerPage);

    if (isNaN(newPageIndex) || newPageIndex < 0 || newPageIndex >= totalPages) {
      await interaction.followUp({
        content: t('infractions.invalid-page', {
          lng: interaction.locale,
          totalPages,
        }),
        flags: [MessageFlags.Ephemeral],
      });
      return;
    }

    return interaction.editReply(
      buildInfractionOverview({
        client,
        infractions,
        target,
        itemsPerPage,
        sortBy,
        sortOrder,
        showGuild,
        showUser,
        locale: interaction.locale,
        page: newPageIndex,
      }),
    );
  },
});
