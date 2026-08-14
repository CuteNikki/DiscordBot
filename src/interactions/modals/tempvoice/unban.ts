import { MessageFlags, userMention } from 'discord.js';
import { t } from 'i18next';

import { Modal } from 'classes/base/modal';

import { getTempVoiceByChannelId } from 'database/tempvoice';

import { unbanUserFromVoiceChannel } from 'utility/tempvoice';

export default new Modal({
  customId: 'tempvoice-unban',
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

    const selectedUsers = interaction.components.getSelectedMembers('unban');
    const targetUserId = selectedUsers?.first()?.id;

    if (!targetUserId) {
      return interaction.reply({
        content: t('tempvoice.unban.none', { lng }),
        flags: [MessageFlags.Ephemeral],
      });
    }

    if (targetUserId === interaction.user.id) {
      return interaction.reply({
        content: t('tempvoice.unban.self', { lng }),
        flags: [MessageFlags.Ephemeral],
      });
    }

    const success = await unbanUserFromVoiceChannel(interaction.channel, targetUserId);

    if (success) {
      return interaction.reply({
        content: t('tempvoice.unban.success', { lng, user: userMention(targetUserId) }),
      });
    } else {
      return interaction.reply({
        content: t('tempvoice.unban.failed', { lng }),
        flags: [MessageFlags.Ephemeral],
      });
    }
  },
});
