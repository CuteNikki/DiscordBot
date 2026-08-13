import { MessageFlags } from 'discord.js';

import { Modal } from 'classes/base/modal';

import { getTempVoiceByChannelId, updateTempVoiceOwner } from 'database/tempvoice';

import { transferVoiceChannelOwnershipPermissions } from 'utility/tempvoice';

export default new Modal({
  customId: 'tempvoice-ownership',
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
        content: 'Only the owner of this temporary voice channel can transfer ownership.',
        flags: [MessageFlags.Ephemeral],
      });
    }

    const selectedUsers = interaction.components.getSelectedMembers('ownership');
    const newOwnerId = selectedUsers?.first()?.id;

    if (!newOwnerId) {
      return interaction.reply({
        content: 'No user was selected to transfer ownership to.',
        flags: [MessageFlags.Ephemeral],
      });
    }

    if (newOwnerId === interaction.user.id) {
      return interaction.reply({
        content: 'You are already the owner of this voice channel.',
        flags: [MessageFlags.Ephemeral],
      });
    }

    const targetMember = await interaction.guild.members.fetch(newOwnerId).catch(() => null);

    if (!targetMember) {
      return interaction.reply({
        content: 'Could not find that member in this server.',
        flags: [MessageFlags.Ephemeral],
      });
    }

    if (targetMember.user.bot) {
      return interaction.reply({
        content: 'You cannot transfer ownership to a bot.',
        flags: [MessageFlags.Ephemeral],
      });
    }

    await updateTempVoiceOwner(interaction.guildId, interaction.channel.id, newOwnerId);
    const success = await transferVoiceChannelOwnershipPermissions(interaction.channel, newOwnerId);

    if (success) {
      await interaction.channel.permissionOverwrites
        .edit(interaction.user.id, {
          ManageChannels: false,
        })
        .catch(() => null);

      return interaction.reply({
        content: `Ownership of this temporary voice channel has been transferred to <@${newOwnerId}>.`,
      });
    } else {
      return interaction.reply({
        content: 'Failed to update channel permissions for ownership transfer.',
        flags: [MessageFlags.Ephemeral],
      });
    }
  },
});
