import { Events, PresenceUpdateStatus } from 'discord.js';
import figlet from 'figlet';
import { performance } from 'perf_hooks';

import { Event } from 'classes/base/event';

import { KEYS } from 'utility/keys';
import { logger, table } from 'utility/logger';

export default new Event({
  name: Events.ClientReady,
  once: true,
  async execute(extendedClient, readyClient) {
    //
    // Log the bot's information
    //
    figlet(readyClient.user.displayName, { font: 'Big', horizontalLayout: 'fitted', verticalLayout: 'default' }, (err, art) => {
      if (err || !art) {
        logger.error('Error generating ASCII art');
      }

      logger.info(
        [
          'Logged in as:',
          art,
          table([
            {
              username: readyClient.user.tag,
              id: readyClient.user.id,
              guilds: readyClient.guilds.cache.size,
              users: readyClient.users.cache.size,
              channels: readyClient.channels.cache.size,
            },
          ]),
        ].join('\n'),
      );
    });

    //
    // Get the custom emojis from the application and store them in the client
    //
    const startTime = performance.now();
    const emojis = await readyClient.application.emojis.fetch();
    for (const emoji of emojis.values()) {
      extendedClient.customEmojis[emoji.name as keyof typeof extendedClient.customEmojis] = emoji;
    }
    const endTime = performance.now();
    logger.debug(`Fetching ${emojis.size} custom emojis took ${Math.floor(endTime - startTime)}ms`);

    if (!KEYS.PRESENCE_LIST.length || !KEYS.PRESENCE_INITIAL || !KEYS.PRESENCE_UPDATE_INTERVAL) return;

    logger.debug(`Presence feature is enabled. Setting initial presence and updating every ${KEYS.PRESENCE_UPDATE_INTERVAL}ms.`);

    //
    // Setting an initial presence
    //
    readyClient.user.setPresence({
      status: PresenceUpdateStatus.DoNotDisturb,
      activities: [KEYS.PRESENCE_INITIAL],
    });

    //
    // Set an interval to update the presence every x
    //
    let lastPresenceIndex: number | null = null;
    setInterval(async () => {
      // Fetch the guild, user, and channel counts from all shards
      const infos = await extendedClient.cluster.broadcastEval((client) => ({
        guildCount: client.guilds.cache.size,
        userCount: client.users.cache.size,
        channelCount: client.channels.cache.size,
      }));
      const guildCount = infos.reduce((total, info) => total + info.guildCount, 0);
      const userCount = infos.reduce((total, info) => total + info.userCount, 0);
      const channelCount = infos.reduce((total, info) => total + info.channelCount, 0);
      logger.debug({ guildCount, userCount, channelCount }, `Fetched total counts from all shards:`);

      // Get a random presence from the array
      let presenceIndex = Math.floor(Math.random() * KEYS.PRESENCE_LIST.length);
      // Ensure the presence is different from the last one
      while (presenceIndex === lastPresenceIndex) {
        presenceIndex = Math.floor(Math.random() * KEYS.PRESENCE_LIST.length);
      }

      // Store the last presence index
      lastPresenceIndex = presenceIndex;

      // Get the new presence object and set it
      const presence = KEYS.PRESENCE_LIST[presenceIndex];
      readyClient.user.setPresence({
        status: presence.status,
        activities: [
          {
            name: presence.name
              .replace('{{guildCount}}', guildCount.toString())
              .replace('{{userCount}}', userCount.toString())
              .replace('{{channelCount}}', channelCount.toString()),
            type: presence.type,
          },
        ],
      });
      logger.debug({ presence }, `Presence has been updated to:`);
    }, KEYS.PRESENCE_UPDATE_INTERVAL);
  },
});
