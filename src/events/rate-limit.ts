import { RESTEvents } from 'discord.js';

import { Event } from 'classes/base/event';
import { logger } from 'utility/logger';

export default new Event({
  name: RESTEvents.RateLimited,
  rest: true,
  once: false,
  async execute(_, rateLimitData) {
    logger.warn({ rateLimitData }, 'RateLimited event triggered');
  },
});
