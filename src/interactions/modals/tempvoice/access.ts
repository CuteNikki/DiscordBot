import { MessageFlags } from 'discord.js';

import { Modal } from 'classes/base/modal';

import { getTempVoiceByChannelId } from 'database/tempvoice';

import { setVoiceChannelAccess } from 'utility/tempvoice';

export default new Modal({
  customId: 'tempvoice-access',
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
        content: 'Only the owner of this temporary voice channel can change its access settings.',
        flags: [MessageFlags.Ephemeral],
      });
    }

    const selectedOption = interaction.components.getStringSelectValues('access')[0];
    const isPublic = selectedOption === 'public';

    const success = await setVoiceChannelAccess(interaction.channel, interaction.guild.roles.everyone.id, isPublic);

    if (success) {
      return interaction.reply({
        content: `Temporary voice channel is now **${isPublic ? 'Public' : 'Private'}**.`,
      });
    } else {
      return interaction.reply({
        content: 'Failed to update access settings for the temporary voice channel.',
        flags: [MessageFlags.Ephemeral],
      });
    }
  },
});
