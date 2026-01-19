import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from 'generated/client';

import { REST } from 'discord.js';

import { KEYS } from 'utility/keys';

export const discordRestClient = new REST({ version: '10' }).setToken(KEYS.DISCORD_BOT_TOKEN);

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

export const prisma = new PrismaClient({ adapter });
