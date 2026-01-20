import { Events } from 'discord.js';

import { Event } from 'classes/base/event';
import { logger } from 'utility/logger';

export default new Event({
  name: Events.Debug,
  once: false,
  async execute(_, message) {
    // message: string - Informational debug message
    logger.debug({ message }, 'Debug event triggered');
  },
});
