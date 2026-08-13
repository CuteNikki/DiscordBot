import { MessageFlags } from 'discord.js';

import { Modal } from 'classes/base/modal';

import { getTempVoiceByChannelId } from 'database/tempvoice';

import { unbanUserFromVoiceChannel } from 'utility/tempvoice';

export default new Modal({
  customId: 'tempvoice-unban',
  async execute(interaction) {
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
        content: 'Only the owner of this temporary voice channel can unban members.',
        flags: [MessageFlags.Ephemeral],
      });
    }

    const selectedUsers = interaction.components.getSelectedMembers('unban');
    const targetUserId = selectedUsers?.first()?.id;

    if (!targetUserId) {
      return interaction.reply({
        content: 'No user was selected to unban.',
        flags: [MessageFlags.Ephemeral],
      });
    }

    const success = await unbanUserFromVoiceChannel(interaction.channel, targetUserId);

    if (success) {
      return interaction.reply({
        content: `Unbanned <@${targetUserId}> from the temporary voice channel.`,
      });
    } else {
      return interaction.reply({
        content: 'Failed to unban the user from the temporary voice channel.',
        flags: [MessageFlags.Ephemeral],
      });
    }
  },
});
