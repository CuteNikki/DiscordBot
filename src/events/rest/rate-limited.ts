import { RESTEvents } from 'discord.js';

import { Event } from 'classes/base/event';
import { logger } from 'utility/logger';

export default new Event({
  name: RESTEvents.RateLimited,
  rest: true,
  once: false,
  async execute(_, rateLimitData) {
    // rateLimitData contains:
    // global: boolean - whether the rate limit is global
    // hash: string - the bucket hash for this request
    // limit: number - the number of requests that can be made
    // majorParameter: string - The major parameter of the routeFor example, in /channels/x, this will be x. If there is no major parameter (e.g: /bot/gateway) this will be global.
    // method: string - the HTTP method being performed (GET, POST, etc.)
    // retryAfter: number - the time, in milliseconds, that will need to pass before this specific request can be retried
    // route: string - the route being hit in this request
    // scope: 'global' | 'shared' | 'user' - The scope of the rate limit that was hit. This can be user for rate limits that are per client, global for rate limits that affect all clients or shared for rate limits that are shared per resource.
    // sublimitTimeout: number - The time, in milliseconds, that will need to pass before the sublimit lock for the route resets, and requests that fall under a sublimit can be retriedThis is only present on certain sublimits, and 0 otherwise
    // timeToReset: number - the time, in milliseconds, until the route's request-lock is reset
    // url: string - the full URL for this request
    logger.warn({ rateLimitData }, 'RateLimited event triggered');
  },
});
