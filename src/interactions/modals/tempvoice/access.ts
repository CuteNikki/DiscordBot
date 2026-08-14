import { MessageFlags } from 'discord.js';
import { t } from 'i18next';

import { Modal } from 'classes/base/modal';

import { getTempVoiceByChannelId } from 'database/tempvoice';

import { setVoiceChannelAccess } from 'utility/tempvoice';

export default new Modal({
  customId: 'tempvoice-access',
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

    const selectedOption = interaction.components.getStringSelectValues('access')[0];
    const isPublic = selectedOption === 'public';

    const success = await setVoiceChannelAccess(interaction.channel, interaction.guild.roles.everyone.id, isPublic);

    if (success) {
      return interaction.reply({
        content: t(`tempvoice.access.${isPublic ? 'public' : 'private'}`, { lng }),
      });
    } else {
      return interaction.reply({
        content: t('tempvoice.access.failed', { lng }),
        flags: [MessageFlags.Ephemeral],
      });
    }
  },
});
