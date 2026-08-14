import { MessageFlags } from 'discord.js';
import { t } from 'i18next';

import { Modal } from 'classes/base/modal';

import { getTempVoiceByChannelId } from 'database/tempvoice';

import { setVoiceChannelVisibility } from 'utility/tempvoice';

export default new Modal({
  customId: 'tempvoice-visibility',
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

    const selectedOption = interaction.components.getStringSelectValues('visibility')[0];
    const isVisible = selectedOption === 'visible';

    const success = await setVoiceChannelVisibility(interaction.channel, isVisible);

    if (success) {
      return interaction.reply({
        content: t(`tempvoice.visibility.${isVisible ? 'visible' : 'hidden'}`, { lng }),
      });
    } else {
      return interaction.reply({
        content: t('tempvoice.visibility.failed', { lng }),
        flags: [MessageFlags.Ephemeral],
      });
    }
  },
});
