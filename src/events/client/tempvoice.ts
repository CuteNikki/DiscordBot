import { Events } from 'discord.js';

import { Event } from 'classes/base/event';
import { deleteTempVoiceById, getAllTempVoices } from 'database/tempvoice';

export default new Event({
  name: Events.ClientReady,
  once: true,
  async execute(_extendedClient, readyClient) {
    // Fetch all temp voice records from DB in a single query
    const tempVoices = await getAllTempVoices().catch(() => []);
    if (tempVoices.length === 0) return;

    for (const tempVoice of tempVoices) {
      // Fetch the channel from Discord
      const channel = await readyClient.channels.fetch(tempVoice.channelId).catch(() => null);

      // Case A: Channel was deleted on Discord while bot was offline -> Clean up DB
      if (!channel) {
        await deleteTempVoiceById(tempVoice.id).catch(() => null);
        continue;
      }

      // Case B: Channel exists and is a voice channel
      if (channel.isVoiceBased()) {
        // If empty, delete the Discord channel and the DB record
        if (channel.members.size === 0) {
          await channel.delete('Cleaning up empty temporary voice channel on bot startup').catch(() => null);
          await deleteTempVoiceById(tempVoice.id).catch(() => null);
        }
      }
    }
  },
});
