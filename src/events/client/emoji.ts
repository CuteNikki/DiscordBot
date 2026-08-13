import { Events } from 'discord.js';
import { performance } from 'perf_hooks';

import { Event } from 'classes/base/event';

import { logger } from 'utility/logger';

export default new Event({
  name: Events.ClientReady,
  once: true,
  async execute(extendedClient, readyClient) {
    //
    // Get the custom emojis from the application and store them in the client
    //
    const startTime = performance.now();
    const emojis = await readyClient.application.emojis.fetch();
    extendedClient.initializeCustomEmojis(emojis.values().toArray());

    const endTime = performance.now();
    logger.debug(`Fetching ${emojis.size} custom emojis took ${Math.floor(endTime - startTime)}ms`);
  },
});
