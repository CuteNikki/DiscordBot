import { MessageFlags } from 'discord.js';
import { t } from 'i18next';

import { Modal } from 'classes/base/modal';

import { getTempVoiceByChannelId } from 'database/tempvoice';

import { setVoiceChannelUserLimit } from 'utility/tempvoice';

export default new Modal({
  customId: 'tempvoice-limit',
  execute: async (interaction) => {
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

    const rawInput = interaction.components.getTextInputValue('limit').trim();
    const userLimit = parseInt(rawInput, 10);

    if (isNaN(userLimit) || userLimit < 0 || userLimit > 99) {
      return interaction.reply({
        content: t('tempvoice.limit.invalid', { lng }),
        flags: [MessageFlags.Ephemeral],
      });
    }

    const success = await setVoiceChannelUserLimit(interaction.channel, userLimit);

    if (success) {
      const limitText = userLimit === 0 ? 'unlimited' : `**${userLimit}** user${userLimit === 1 ? '' : 's'}`;
      return interaction.reply({
        content: t('tempvoice.limit.success', { lng, limit: limitText }),
      });
    } else {
      return interaction.reply({
        content: t('tempvoice.limit.failed', { lng }),
        flags: [MessageFlags.Ephemeral],
      });
    }
  },
});
