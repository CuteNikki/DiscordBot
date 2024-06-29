import config from '../../config.json';

const keys = {
  DISCORD_BOT_TOKEN: config.DISCORD_BOT.TOKEN ?? 'abc123',
  DISCORD_BOT_ID: config.DISCORD_BOT.ID ?? 'abc123',
  DEVELOPER_USER_IDS: config.DEVELOPER.USER_IDS ?? [],
  DEVELOPER_GUILD_IDS: config.DEVELOPER.GUILD_IDS ?? [],
  DATABASE_URI: config.DATABASE.URI ?? 'abc123',
  WEATHER_API_KEY: config.API_KEYS.WEATHER ?? 'abc123',
};

export { keys };
