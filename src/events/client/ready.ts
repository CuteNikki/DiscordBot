import { Events } from 'discord.js';
import figlet from 'figlet';

import { Event } from 'classes/base/event';

import { logger, table } from 'utility/logger';

export default new Event({
  name: Events.ClientReady,
  once: true,
  async execute(_extendedClient, readyClient) {
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
  },
});
