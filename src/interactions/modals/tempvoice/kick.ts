import { MessageFlags, userMention } from 'discord.js';
import { t } from 'i18next';

import { Modal } from 'classes/base/modal';

import { getTempVoiceByChannelId } from 'database/tempvoice';

import { kickUserFromVoiceChannel } from 'utility/tempvoice';

export default new Modal({
  customId: 'tempvoice-kick',
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

    const selectedUsers = interaction.components.getSelectedMembers('kick');
    const targetUserId = selectedUsers?.first()?.id;

    if (!targetUserId) {
      return interaction.reply({
        content: t('tempvoice.kick.none', { lng }),
        flags: [MessageFlags.Ephemeral],
      });
    }

    if (targetUserId === interaction.user.id) {
      return interaction.reply({
        content: t('tempvoice.kick.self', { lng }),
        flags: [MessageFlags.Ephemeral],
      });
    }

    const isMemberInChannel = interaction.channel.members.has(targetUserId);
    if (!isMemberInChannel) {
      return interaction.reply({
        content: t('tempvoice.kick.channel', { lng }),
        flags: [MessageFlags.Ephemeral],
      });
    }

    const success = await kickUserFromVoiceChannel(interaction.channel, targetUserId);

    if (success) {
      return interaction.reply({
        content: t('tempvoice.kick.success', { lng, user: userMention(targetUserId) }),
      });
    } else {
      return interaction.reply({
        content: t('tempvoice.kick.failed', { lng }),
        flags: [MessageFlags.Ephemeral],
      });
    }
  },
});
