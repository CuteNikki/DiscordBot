import { ActivityType, PresenceUpdateStatus } from 'discord.js';
import type { CustomPresence } from 'types/presence';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined in the environment variables');
}
if (!process.env.DISCORD_BOT_TOKEN) {
  throw new Error('DISCORD_BOT_TOKEN is not defined in the environment variables');
}
if (!process.env.DISCORD_BOT_ID) {
  throw new Error('DISCORD_BOT_ID is not defined in the environment variables');
}

export const KEYS = {
  // Database settings
  // This is the URL to the database that will be used by the bot
  // This should be in the format of: postgresql://user:password@host:port/database
  DATABASE_URL: process.env.DATABASE_URL,

  //
  // Discord bot settings
  //
  DISCORD_BOT_TOKEN: process.env.DISCORD_BOT_TOKEN,
  DISCORD_BOT_ID: process.env.DISCORD_BOT_ID,
  // Optional developer settings
  DISCORD_DEV_GUILD_ID: process.env.DISCORD_DEV_GUILD_ID, // Optional
  DISCORD_DEV_OWNER_ID: process.env.DISCORD_DEV_OWNER_ID, // Optional

  //
  // Webhook settings
  //
  WEBHOOK_BLACKLIST: process.env.WEBHOOK_BLACKLIST, // Optional

  //
  // Localization settings
  //
  // Supported languages: https://discord.com/developers/docs/reference#locales
  LOCALES_SUPPORTED: ['en-GB', 'en-US', 'de'] satisfies string[],
  // This is the default language that will be used if the users language is not supported
  LOCALES_FALLBACK: 'en-GB' satisfies string,

  //
  // Presence settings
  //
  // Optional: this is the interval in milliseconds to update the presence
  PRESENCE_UPDATE_INTERVAL: (5_000 * 60) satisfies number | null, // 5 minutes
  // Optional: this is the initial presence that will be set when the bot starts
  // this may be set to null if you don't want to use the presence feature
  PRESENCE_INITIAL: {
    status: PresenceUpdateStatus.DoNotDisturb,
    name: 'booting up...',
    type: ActivityType.Custom,
  } satisfies CustomPresence | null,
  // Optional: this is a list of presences to cycle between
  // this may be set to an empty array if you don't want to use the presence feature
  PRESENCE_LIST: [
    {
      status: PresenceUpdateStatus.Online,
      name: '/help | some-website.com',
      type: ActivityType.Custom,
    },
    {
      status: PresenceUpdateStatus.Online,
      name: /* Playing */ `in {{guildCount}} guilds`,
      type: ActivityType.Playing,
    },
    {
      status: PresenceUpdateStatus.Online,
      name: /* Watching */ `{{channelCount}} channels`,
      type: ActivityType.Watching,
    },
    {
      status: PresenceUpdateStatus.Online,
      name: /* Playing */ `with {{userCount}} users`,
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
  ] satisfies CustomPresence[],
} as const;
