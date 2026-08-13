import { MessageFlags } from 'discord.js';

import { Button } from 'classes/base/button';

import { deleteTempVoiceById, getTempVoiceByChannelId } from 'database/tempvoice';

export default new Button({
  customId: 'tempvoice-delete',
  execute: async (interaction) => {
    if (!interaction.inCachedGuild() || !interaction.channel) return;

    if (!interaction.channel.isVoiceBased()) {
      return interaction.reply({
        content: 'This can only be used in a temporary voice channel.',
        flags: [MessageFlags.Ephemeral],
      });
    }

    const tempVoiceChannel = await getTempVoiceByChannelId(interaction.guildId, interaction.channel.id);
    if (!tempVoiceChannel) {
      return interaction.reply({
        content: 'This channel is not a temporary voice channel.',
        flags: [MessageFlags.Ephemeral],
      });
    }

    if (tempVoiceChannel.ownerId !== interaction.user.id) {
      return interaction.reply({
        content: 'Only the owner of this temporary voice channel can delete it.',
        flags: [MessageFlags.Ephemeral],
      });
    }

    await interaction.reply({
      content: 'Deleting temporary voice channel...',
      flags: [MessageFlags.Ephemeral],
    });

    setTimeout(async () => {
      await deleteTempVoiceById(tempVoiceChannel.id).catch(() => null);
      await interaction.channel?.delete('Temporary voice channel deleted by owner').catch(() => null);
    }, 3000);
  },
});
