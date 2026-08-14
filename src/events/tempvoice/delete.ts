import { Events } from 'discord.js';

import { Event } from 'classes/base/event';

import { deleteTempVoiceById, getTempVoiceByChannelId, getTempVoiceConfigurationByGuildId, updateTempVoiceOwner } from 'database/tempvoice';

import { logger } from 'utility/logger';
import { transferVoiceChannelOwnershipPermissions } from 'utility/tempvoice';

export default new Event({
  name: Events.VoiceStateUpdate,
  async execute(_client, oldState) {
    if (!oldState.channel || !oldState.member) return;

    const existingConfig = await getTempVoiceConfigurationByGuildId(oldState.guild.id).catch((err) => {
      logger.error(err, 'Failed to fetch temporary voice configuration');
      return null;
    });
    if (!existingConfig) return;

    const tempVoiceChannel = await getTempVoiceByChannelId(oldState.guild.id, oldState.channel.id).catch((err) => {
      logger.error(err, 'Failed to fetch temporary voice channel');
      return null;
    });
    if (!tempVoiceChannel) return;

    if (oldState.channel.members.size === 0) {
      await oldState.channel
        .delete('Temporary voice channel is empty')
        .catch((err) => logger.error(err, 'Failed to delete empty temporary voice channel'));
      await deleteTempVoiceById(tempVoiceChannel.id).catch((err) =>
        logger.error(err, 'Failed to delete temporary voice channel from database'),
      );
      return;
    }

    if (tempVoiceChannel.ownerId === oldState.member.id) {
      const newOwner = oldState.channel.members.first();
      if (newOwner) {
        await updateTempVoiceOwner(oldState.guild.id, oldState.channel.id, newOwner.id).catch((err) =>
          logger.error(err, 'Failed to update temporary voice channel owner in database'),
        );
        await transferVoiceChannelOwnershipPermissions(oldState.channel, newOwner.id).catch((err) =>
          logger.error(err, 'Failed to transfer temporary voice channel ownership permissions'),
        );

        await oldState.channel
          .send({
            content: `Ownership of this temporary voice channel has been transferred to <@${newOwner.id}>.`,
          })
          .catch((err) => logger.error(err, 'Failed to send ownership transfer message'));
      }
    }
  },
});
