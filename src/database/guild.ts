import type { Guild, Prisma } from '@prisma/client';

import { prisma } from 'database/index';

export const createGuild = async (guildId: string) =>
  prisma.guild.create({
    data: { guildId },
  });

export const getGuild = async (guildId: string, include: Prisma.GuildInclude = {}) =>
  prisma.guild.findUnique({
    where: { guildId },
    include,
  });

export const getGuildOrCreate = async (guildId: string) =>
  await prisma.guild.upsert({
    where: { guildId },
    update: {},
    create: { guildId },
  });

export const updateGuild = async (guildId: string, data: Partial<Omit<Guild, 'guildId'>>) =>
  prisma.guild.update({
    where: { guildId },
    data,
  });
