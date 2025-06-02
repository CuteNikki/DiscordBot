import { InfractionType, type Infraction } from '@prisma/client';
import { Routes } from 'discord.js';

import { discordRestClient, prisma } from 'database/index';

import { InfractionSortBy, InfractionSortOrder } from 'types/infraction';

export const createInfraction = async (
  infraction: Omit<Infraction, 'id' | 'createdAt' | 'expiresAt' | 'isActive'> & { expiresAt?: Date; isActive?: boolean },
) =>
  prisma.infraction.create({
    data: infraction,
  });

export const updateInfraction = async (id: string, data: Partial<Omit<Infraction, 'id' | 'createdAt'>>) =>
  prisma.infraction.update({
    where: { id },
    data,
  });

export const getInfractionById = async (id: string) =>
  prisma.infraction.findUnique({
    where: { id },
  });

export const getInfractionsByUserId = async (
  userId: string,
  sortBy: InfractionSortBy = InfractionSortBy.createdAt,
  sortOrder: InfractionSortOrder = InfractionSortOrder.asc,
) =>
  prisma.infraction.findMany({
    where: { userId },
    orderBy: { [InfractionSortBy[sortBy]]: InfractionSortOrder[sortOrder] },
  });

export const getInfractionsByGuildId = async (
  guildId: string,
  sortBy: InfractionSortBy = InfractionSortBy.createdAt,
  sortOrder: InfractionSortOrder = InfractionSortOrder.asc,
) =>
  prisma.infraction.findMany({
    where: { guildId },
    orderBy: { [InfractionSortBy[sortBy]]: InfractionSortOrder[sortOrder] },
  });

export const getInfractionsByUserIdAndGuildId = async (
  userId: string,
  guildId: string,
  sortBy: InfractionSortBy = InfractionSortBy.createdAt,
  sortOrder: InfractionSortOrder = InfractionSortOrder.asc,
) =>
  prisma.infraction.findMany({
    where: { userId, guildId },
    orderBy: { [InfractionSortBy[sortBy]]: InfractionSortOrder[sortOrder] },
  });

export const getInfractionsByModeratorIdAndGuildId = async (
  moderatorId: string,
  guildId: string,
  sortBy: InfractionSortBy = InfractionSortBy.createdAt,
  sortOrder: InfractionSortOrder = InfractionSortOrder.asc,
) =>
  prisma.infraction.findMany({
    where: { moderatorId, guildId },
    orderBy: { [InfractionSortBy[sortBy]]: InfractionSortOrder[sortOrder] },
  });

export const getInfractionsByUserIdAndGuildIdPaginated = async (
  userId: string,
  guildId: string,
  skip: number,
  take: number,
  sortBy: InfractionSortBy = InfractionSortBy.createdAt,
  sortOrder: InfractionSortOrder = InfractionSortOrder.asc,
) =>
  prisma.infraction.findMany({
    where: { userId, guildId },
    skip,
    take,
    orderBy: { [InfractionSortBy[sortBy]]: InfractionSortOrder[sortOrder] },
  });

export const getExpiredInfractions = async () =>
  prisma.infraction.findMany({
    where: { expiresAt: { lt: new Date() }, isActive: true },
  });

export const deleteInfraction = async (id: string) =>
  prisma.infraction
    .delete({
      where: { id },
    })
    // If the infraction doesn't exist, return null
    .catch(() => null);

export const handleExpiredInfractions = async (): Promise<void> => {
  const expiredInfractions = await getExpiredInfractions();

  if (!expiredInfractions.length) return;

  for (const infraction of expiredInfractions) {
    // If the infraction is a tempban, unban the user
    if (infraction.type === InfractionType.Tempban) {
      await discordRestClient.delete(Routes.guildBan(infraction.guildId, infraction.userId)).catch(() => null);
    }

    await updateInfraction(infraction.id, { isActive: false });
  }
};
