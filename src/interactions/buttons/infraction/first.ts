import { MessageFlags } from 'discord.js';

import { Button } from 'classes/base/button';
import type { ExtendedClient } from 'classes/base/client';

import { getInfractionsByUserIdAndGuildId } from 'database/infraction';

import { buildInfractionOverview } from 'utility/infraction';
import { logger } from 'utility/logger';

export default new Button({
  customId: 'infractions-first',
  includeCustomId: true,
  async execute(interaction) {
    if (!interaction.inCachedGuild()) return;

    const targetUserId = interaction.customId.split('_')[1];
    const targetUser = await interaction.client.users.fetch(targetUserId).catch(() => null);

    if (!targetUser) {
      await interaction.reply({
        content: 'User not found.',
        flags: [MessageFlags.Ephemeral],
      });
      return;
    }

    await interaction.deferUpdate();

    const infractions = await getInfractionsByUserIdAndGuildId(targetUser.id, interaction.guild.id).catch((err) =>
      logger.error({ err }, 'Failed to get infractions'),
    );
    if (!infractions) return;

    const client = interaction.client as ExtendedClient;
    const itemsPerPage = 3;

    return interaction.editReply(
      buildInfractionOverview({
        client,
        infractions,
        targetUser,
        itemsPerPage,
        page: 0,
      }),
    );
  },
});
