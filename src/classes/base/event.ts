import type { ExtendedClient } from 'classes/base/client';
import type { ClientEventTypes, RestEvents } from 'discord.js';

export class Event<T extends keyof ClientEventTypes | keyof RestEvents> {
  constructor(
    public options: {
      name: T;
      rest?: boolean;
      once?: boolean;
      execute: (
        client: ExtendedClient,
        ...args: T extends keyof ClientEventTypes ? ClientEventTypes[T] : T extends keyof RestEvents ? RestEvents[T] : never
      ) => unknown;
    },
  ) {}
}
