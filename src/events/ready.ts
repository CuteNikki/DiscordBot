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

    const presences: { status: PresenceStatusData; name: string; type: ActivityType; url?: string }[] = [
      {
        status: PresenceUpdateStatus.Online,
        name: /* Watching */ `${readyClient.guilds.cache.size} servers`,
        type: ActivityType.Watching,
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
      {
        status: PresenceUpdateStatus.Online,
        name: /* Playing */ 'with users',
        type: ActivityType.Playing,
      },
    ];

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
    setInterval(() => {
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
    }, 60_000);

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
