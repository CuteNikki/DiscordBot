import { Events } from 'discord.js';

import { Event } from 'classes/base/event';

import { deleteTempVoiceById, getTempVoiceByChannelId, getTempVoiceConfigurationByGuildId, updateTempVoiceOwner } from 'database/tempvoice';

import { transferVoiceChannelOwnershipPermissions } from 'utility/tempvoice';

export default new Event({
  name: Events.VoiceStateUpdate,
  async execute(_client, oldState) {
    if (!oldState.channel || !oldState.member) return;

    const existingConfig = await getTempVoiceConfigurationByGuildId(oldState.guild.id);
    if (!existingConfig) return;

    const tempVoiceChannel = await getTempVoiceByChannelId(oldState.guild.id, oldState.channel.id);
    if (!tempVoiceChannel) return;

    if (oldState.channel.members.size === 0) {
      await oldState.channel.delete('Temporary voice channel is empty').catch(() => null);
      await deleteTempVoiceById(tempVoiceChannel.id);
      return;
    }

    if (tempVoiceChannel.ownerId === oldState.member.id) {
      const newOwner = oldState.channel.members.first();
      if (newOwner) {
        await updateTempVoiceOwner(oldState.guild.id, oldState.channel.id, newOwner.id);
        await transferVoiceChannelOwnershipPermissions(oldState.channel, newOwner.id);

        await oldState.channel
          .send({
            content: `Ownership of this temporary voice channel has been transferred to <@${newOwner.id}>.`,
          })
          .catch(() => null);
      }
    }
  },
});
