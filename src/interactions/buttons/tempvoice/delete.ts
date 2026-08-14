import { MessageFlags } from 'discord.js';
import { t } from 'i18next';

import { Button } from 'classes/base/button';

import { deleteTempVoiceById, getTempVoiceByChannelId } from 'database/tempvoice';

import { logger } from 'utility/logger';

export default new Button({
  customId: 'tempvoice-delete',
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

    await interaction.reply({
      content: t('tempvoice.delete.deleting', { lng }),
      flags: [MessageFlags.Ephemeral],
    });

    setTimeout(async () => {
      await deleteTempVoiceById(tempVoiceChannel.id).catch((err) =>
        logger.error(err, 'Failed to delete temporary voice channel from database'),
      );
      await interaction.channel
        ?.delete('Temporary voice channel deleted by owner')
        .catch((err) => logger.error(err, 'Failed to delete temporary voice channel'));
    }, 3000);
  },
});
