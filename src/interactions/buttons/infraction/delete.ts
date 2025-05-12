import { MessageFlags } from 'discord.js';

import { Button } from 'classes/base/button';

import { deleteInfraction, getInfractionById } from 'database/infraction';

export default new Button({
  customId: 'infractions-delete',
  includeCustomId: true,
  userPermissions: ['ModerateMembers'],
  async execute(interaction) {
    const infractionId = interaction.customId.split('_')[1];

    if (!interaction.inCachedGuild()) {
      await interaction.reply({
        content: 'You can only delete infractions on a guild.',
        flags: [MessageFlags.Ephemeral],
      });
      return;
    }

    await interaction.deferReply();

    const infraction = await getInfractionById(infractionId).catch(() => null);

    if (!infraction || infraction.guildId !== interaction.guildId) {
      await interaction.reply({
        content: 'This infraction does not exist or is not in this guild.',
      });
      return;
    }

    await deleteInfraction(infractionId).catch(() => null);
    await interaction.editReply({
      content: `Infraction with ID \`${infractionId}\` has been deleted.`,
    });
  },
});
