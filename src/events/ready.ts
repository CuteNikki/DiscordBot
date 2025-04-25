import { ActivityType, Events, PresenceUpdateStatus, type PresenceStatusData } from 'discord.js';
import figlet from 'figlet';

import { Event } from 'classes/base/event';

import { logger, table } from 'utility/logger';

export default new Event({
  name: Events.ClientReady,
  once: true,
  async execute(extendedClient, readyClient) {
    // Fetching and setting custom emojis
    await readyClient.application.emojis.fetch();

    for (const emoji of readyClient.application.emojis.cache.values()) {
      extendedClient.customEmojis[emoji.name as keyof typeof extendedClient.customEmojis] = emoji;
    }

    // Set the initial presence
    readyClient.user.setPresence({
      status: PresenceUpdateStatus.DoNotDisturb,
      activities: [
        {
          name: 'booting up...',
          type: ActivityType.Custom,
        },
      ],
    });

    let lastPresenceIndex: number | null = null;
    // Set a new presence every minute
    setInterval(async () => {
      const infos = await extendedClient.cluster.broadcastEval((client) => ({
        guildCount: client.guilds.cache.size,
        userCount: client.users.cache.size,
        channelCount: client.channels.cache.size,
      }));

      const presences: { status: PresenceStatusData; name: string; type: ActivityType; url?: string }[] = [
        {
          status: PresenceUpdateStatus.Online,
          name: /* Playing */ `in ${infos.reduce((total, info) => total + info.guildCount, 0)} guilds`,
          type: ActivityType.Playing,
        },
        {
          status: PresenceUpdateStatus.Online,
          name: /* Watching */ `${infos.reduce((total, info) => total + info.channelCount, 0)} channels`,
          type: ActivityType.Watching,
        },
        {
          status: PresenceUpdateStatus.Online,
          name: /* Playing */ `with ${infos.reduce((total, info) => total + info.userCount, 0)} users`,
          type: ActivityType.Playing,
        },
        {
          status: PresenceUpdateStatus.Online,
          name: /* Listening to */ 'your commands',
          type: ActivityType.Listening,
        },
        {
          status: PresenceUpdateStatus.Idle,
          name: /* Competing in */ 'the bot wars!',
          type: ActivityType.Competing,
        },
        {
          status: PresenceUpdateStatus.Idle,
          name: /* Listening to */ 'my creators',
          type: ActivityType.Listening,
        },
      ];

      // Get a random presence from the array
      let presenceIndex = Math.floor(Math.random() * presences.length);
      // Ensure the presence is different from the last one
      while (presenceIndex === lastPresenceIndex) {
        presenceIndex = Math.floor(Math.random() * presences.length);
      }
      // Store the last presence index
      lastPresenceIndex = presenceIndex;
      // Get the presence object
      const presence = presences[presenceIndex];

      // Set the presence
      readyClient.user.setPresence({
        status: presence.status,
        activities: [
          {
            name: presence.name,
            type: presence.type,
          },
        ],
      });
    }, 60_000 * 60); // update every hour

    figlet(readyClient.user.displayName, { font: 'Big', horizontalLayout: 'fitted', verticalLayout: 'default' }, (err, data) => {
      if (err || !data) {
        logger.error('Error generating ASCII art');
        return;
      }

      logger.info(
        [
          'Logged in as:',
          data,
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
  },
});
