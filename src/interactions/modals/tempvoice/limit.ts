import { MessageFlags } from 'discord.js';

import { Modal } from 'classes/base/modal';

import { getTempVoiceByChannelId } from 'database/tempvoice';

import { setVoiceChannelUserLimit } from 'utility/tempvoice';

export default new Modal({
  customId: 'tempvoice-limit',
  execute: async (interaction) => {
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
        content: 'Only the owner of this temporary voice channel can change the user limit.',
        flags: [MessageFlags.Ephemeral],
      });
    }

    const rawInput = interaction.components.getTextInputValue('limit').trim();
    const userLimit = parseInt(rawInput, 10);

    if (isNaN(userLimit) || userLimit < 0 || userLimit > 99) {
      return interaction.reply({
        content: 'Please enter a valid number between **0** and **99** (0 means no limit).',
        flags: [MessageFlags.Ephemeral],
      });
    }

    const success = await setVoiceChannelUserLimit(interaction.channel, userLimit);

    if (success) {
      const limitText = userLimit === 0 ? 'unlimited' : `**${userLimit}** user${userLimit === 1 ? '' : 's'}`;
      return interaction.reply({
        content: `Temporary voice channel limit set to ${limitText}.`,
      });
    } else {
      return interaction.reply({
        content: 'Failed to update the user limit for the temporary voice channel.',
        flags: [MessageFlags.Ephemeral],
      });
    }
  },
});
