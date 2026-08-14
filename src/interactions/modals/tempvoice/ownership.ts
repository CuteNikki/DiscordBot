import { MessageFlags, userMention } from 'discord.js';
import { t } from 'i18next';

import { Modal } from 'classes/base/modal';

import { getTempVoiceByChannelId, updateTempVoiceOwner } from 'database/tempvoice';

import { transferVoiceChannelOwnershipPermissions } from 'utility/tempvoice';

export default new Modal({
  customId: 'tempvoice-ownership',
  async execute(interaction) {
    if (!interaction.inCachedGuild() || !interaction.channel) return;
    const lng = interaction.locale;

    if (!interaction.channel.isVoiceBased()) {
      return interaction.reply({
        content: t('tempvoice.common.no-voice-channel', { lng }),
        flags: [MessageFlags.Ephemeral],
      });
    }

    const tempVoiceChannel = await getTempVoiceByChannelId(interaction.guildId, interaction.channel.id);
    if (!tempVoiceChannel) {
      return interaction.reply({
        content: t('tempvoice.common.no-voice-channel', { lng }),
        flags: [MessageFlags.Ephemeral],
      });
    }

    if (tempVoiceChannel.ownerId !== interaction.user.id) {
      return interaction.reply({
        content: t('tempvoice.common.owner-only', { lng }),
        flags: [MessageFlags.Ephemeral],
      });
    }

    const selectedUsers = interaction.components.getSelectedMembers('ownership');
    const newOwnerId = selectedUsers?.first()?.id;

    if (!newOwnerId) {
      return interaction.reply({
        content: t('tempvoice.ownership.none', { lng }),
        flags: [MessageFlags.Ephemeral],
      });
    }

    if (newOwnerId === interaction.user.id) {
      return interaction.reply({
        content: t('tempvoice.ownership.self', { lng }),
        flags: [MessageFlags.Ephemeral],
      });
    }

    const targetMember = await interaction.guild.members.fetch(newOwnerId).catch(() => null);

    if (!targetMember) {
      return interaction.reply({
        content: t('tempvoice.ownership.not-found', { lng }),
        flags: [MessageFlags.Ephemeral],
      });
    }

    if (targetMember.user.bot) {
      return interaction.reply({
        content: t('tempvoice.ownership.bot', { lng }),
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
        content: t('tempvoice.ownership.success', { lng, user: userMention(newOwnerId) }),
      });
    } else {
      return interaction.reply({
        content: t('tempvoice.ownership.failed', { lng }),
        flags: [MessageFlags.Ephemeral],
      });
    }
  },
});
