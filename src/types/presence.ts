import type { ActivityType, PresenceUpdateStatus } from 'discord.js';

export type CustomPresence = {
  status: PresenceUpdateStatus;
  name: string;
  type: ActivityType;
};
