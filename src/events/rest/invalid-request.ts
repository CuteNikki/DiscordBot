import { RESTEvents } from 'discord.js';

import { Event } from 'classes/base/event';
import { logger } from 'utility/logger';

export default new Event({
  name: RESTEvents.InvalidRequestWarning,
  rest: true,
  once: false,
  async execute(_, requestInfo) {
    // requestInfo contains:
    // count: number - of invalid requests that have been made in the window
    // remainingTime: number - Time in milliseconds remaining before the count resets
    logger.warn({ requestInfo }, 'InvalidRequestWarning event triggered');
  },
});
