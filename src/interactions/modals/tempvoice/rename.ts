import { MessageFlags } from 'discord.js';
import { t } from 'i18next';

import { Modal } from 'classes/base/modal';

import { getTempVoiceByChannelId } from 'database/tempvoice';

import { renameVoiceChannel } from 'utility/tempvoice';

export default new Modal({
  customId: 'tempvoice-rename',
  execute: async (interaction) => {
    if (!interaction.inCachedGuild() || !interaction.channel) return;
    const lng = interaction.locale;

    if (!interaction.channel.isVoiceBased()) {
      return interaction.reply({ content: t('tempvoice.common.no-voice-channel', { lng }), flags: [MessageFlags.Ephemeral] });
    }

    const tempVoiceChannel = await getTempVoiceByChannelId(interaction.guildId, interaction.channel.id);
    if (!tempVoiceChannel) {
      return interaction.reply({ content: t('tempvoice.common.no-voice-channel', { lng }), flags: [MessageFlags.Ephemeral] });
    }

    if (tempVoiceChannel.ownerId !== interaction.user.id) {
      return interaction.reply({
        content: t('tempvoice.common.owner-only', { lng }),
        flags: [MessageFlags.Ephemeral],
      });
    }

    const newName = interaction.components.getTextInputValue('name').trim().slice(0, 100);
    const success = await renameVoiceChannel(interaction.channel, newName);

    if (success) {
      return interaction.reply({ content: t('tempvoice.rename.success', { lng, name: newName }) });
    } else {
      return interaction.reply({ content: t('tempvoice.rename.failed', { lng }), flags: [MessageFlags.Ephemeral] });
    }
  },
});
