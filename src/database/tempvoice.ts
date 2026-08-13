import { prisma } from 'database/index';
import { getUserOrCreate } from 'database/user';

export const createTempVoiceConfiguration = async (
  guildId: string,
  categoryChannelId: string,
  voiceChannelId: string,
  publicByDefault: boolean,
) =>
  prisma.tempVoiceConfiguration.create({
    data: { guildId, categoryChannelId, voiceChannelId, publicByDefault },
  });

export const getTempVoiceConfigurationByGuildId = async (guildId: string) =>
  prisma.tempVoiceConfiguration.findUnique({
    where: { guildId },
  });

export const updateTempVoiceConfiguration = async (
  guildId: string,
  categoryChannelId: string,
  voiceChannelId: string,
  publicByDefault: boolean,
) =>
  prisma.tempVoiceConfiguration.update({
    where: { guildId },
    data: { categoryChannelId, voiceChannelId, publicByDefault },
  });

export const deleteTempVoiceConfiguration = async (guildId: string) =>
  prisma.tempVoiceConfiguration.delete({
    where: { guildId },
  });

export const getAllTempVoices = async () => prisma.tempVoice.findMany();

export const createTempVoice = async (guildId: string, ownerId: string, channelId: string) =>
  prisma.tempVoice.create({
    data: { guildId, ownerId, channelId },
  });

export const updateTempVoiceOwner = async (guildId: string, channelId: string, newOwnerId: string) => {
  // Ensure the new owner exists in the database
  await getUserOrCreate(newOwnerId).catch(() => null);

  return prisma.tempVoice.updateMany({
    where: { guildId, channelId },
    data: { ownerId: newOwnerId },
  });
};

export const getTempVoiceByChannelId = async (guildId: string, channelId: string) =>
  prisma.tempVoice.findFirst({
    where: {
      guildId,
      channelId,
    },
  });

export const getTempVoicesByGuildId = async (guildId: string) =>
  prisma.tempVoice.findMany({
    where: { guildId },
  });

export const deleteTempVoicesByGuildId = async (guildId: string) =>
  prisma.tempVoice.deleteMany({
    where: { guildId },
  });

export const getTempVoiceById = async (id: string) =>
  prisma.tempVoice.findUnique({
    where: { id },
  });

export const deleteTempVoiceById = async (id: string) =>
  prisma.tempVoice.delete({
    where: { id },
  });
