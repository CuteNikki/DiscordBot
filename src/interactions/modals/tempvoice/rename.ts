import { MessageFlags } from 'discord.js';

import { Modal } from 'classes/base/modal';

import { getTempVoiceByChannelId } from 'database/tempvoice';

import { renameVoiceChannel } from 'utility/tempvoice';

export default new Modal({
  customId: 'tempvoice-rename',
  execute: async (interaction) => {
    if (!interaction.inCachedGuild() || !interaction.channel) return;

    if (!interaction.channel.isVoiceBased()) {
      return interaction.reply({ content: 'This can only be used in a temporary voice channel.', flags: [MessageFlags.Ephemeral] });
    }

    const tempVoiceChannel = await getTempVoiceByChannelId(interaction.guildId, interaction.channel.id);
    if (!tempVoiceChannel) {
      return interaction.reply({ content: 'This channel is not a temporary voice channel.', flags: [MessageFlags.Ephemeral] });
    }

    if (tempVoiceChannel.ownerId !== interaction.user.id) {
      return interaction.reply({
        content: 'Only the owner of this temporary voice channel can rename it.',
        flags: [MessageFlags.Ephemeral],
      });
    }

    const newName = interaction.components.getTextInputValue('name').trim().slice(0, 100);
    const success = await renameVoiceChannel(interaction.channel, newName);

    if (success) {
      return interaction.reply({ content: `Temporary voice channel renamed to \`${newName}\`.` });
    } else {
      return interaction.reply({ content: 'Failed to rename the temporary voice channel.', flags: [MessageFlags.Ephemeral] });
    }
  },
});
