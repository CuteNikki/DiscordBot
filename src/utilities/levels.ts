import type { Types } from 'mongoose';

import type { DiscordClient } from 'classes/client';

import { levelModel } from 'models/levels';
import { weeklyLevelModel } from 'models/weeklyLevels';
import { guildModel } from '../models/guild';

export interface LevelIdentifier {
  userId: string;
  guildId: string;
}

export interface Level {
  _id: Types.ObjectId;
  userId: string;
  guildId: string;
  level: number;
  xp: number;
}

export interface PositionLevel extends Level {
  position: number;
  username: string;
}

export interface LevelReward {
  roleId: string;
  level: number;
}

export function randomInteger(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function levelToXP(level: number): number {
  return level * 200;
}

export function xpToLevel(xp: number): number {
  return Math.floor(xp / 200);
}

export function randomXP(): number {
  return randomInteger(5, 15);
}

export function getData(identifier: LevelIdentifier, client: DiscordClient) {
  const data = client.levels.get(identifier);
  if (data) return data;
}

export async function getDataOrCreate(identifier: LevelIdentifier, client: DiscordClient): Promise<Level> {
  const data = client.levels.get(identifier);
  if (data) return data;
  const newData = await levelModel.findOneAndUpdate(identifier, {}, { new: true, upsert: true }).lean().exec();
  client.levels.set(identifier, newData);
  return newData;
}

export function getWeeklyData(identifier: LevelIdentifier, client: DiscordClient) {
  const data = client.levelsWeekly.get(identifier);
  if (data) return data;
}

export async function getWeeklyDataOrCreate(identifier: LevelIdentifier, client: DiscordClient): Promise<Level> {
  const data = client.levelsWeekly.get(identifier);
  if (data) return data;
  const newData = await weeklyLevelModel.create(identifier);
  client.levelsWeekly.set(identifier, newData);
  return newData;
}

export async function appendXP(identifier: LevelIdentifier, client: DiscordClient, xp: number, current: Level): Promise<Level> {
  const level = xpToLevel(current.xp + xp);
  const newWeeklyLevel = await weeklyLevelModel.findOneAndUpdate(identifier, { $inc: { xp }, $set: { level } }, { upsert: true, new: true }).lean().exec();
  client.levelsWeekly.set(identifier, newWeeklyLevel);
  const newLevel = await levelModel.findOneAndUpdate(identifier, { $inc: { xp }, $set: { level } }, { upsert: true, new: true }).lean().exec();
  client.levels.set(identifier, newLevel);
  return newLevel;
}

export async function setXP(identifier: LevelIdentifier, client: DiscordClient, xp: number): Promise<Level> {
  const level = xpToLevel(xp);
  const newLevel = await levelModel.findOneAndUpdate(identifier, { $set: { level, xp } }, { upsert: true, new: true }).lean().exec();
  client.levels.set(identifier, newLevel);
  return newLevel;
}

export async function addXP(identifier: LevelIdentifier, client: DiscordClient, xp: number): Promise<Level> {
  const level = xpToLevel(xp);
  const newLevel = await levelModel.findOneAndUpdate(identifier, { $inc: { xp }, $set: { level } }, { upsert: true, new: true }).lean().exec();
  client.levels.set(identifier, newLevel);
  return newLevel;
}

export async function setLevel(identifier: LevelIdentifier, client: DiscordClient, level: number): Promise<Level> {
  const xp = levelToXP(level);
  const newLevel = await levelModel.findOneAndUpdate(identifier, { $set: { level, xp } }, { upsert: true, new: true }).lean().exec();
  client.levels.set(identifier, newLevel);
  return newLevel;
}

export async function addLevel(identifier: LevelIdentifier, client: DiscordClient, level: number): Promise<Level> {
  const xp = levelToXP(level);
  const newLevel = await levelModel.findOneAndUpdate(identifier, { $set: { level, xp } }, { upsert: true, new: true }).lean().exec();
  client.levels.set(identifier, newLevel);
  return newLevel;
}

export async function getLevelReward(level: Level | PositionLevel): Promise<LevelReward[] | null> {
  const guildData = await guildModel.findOne({ guildId: level.guildId }).lean().exec();
  if (!guildData) return null;
  const rewards = guildData.levels.rewards.filter((rw) => rw.level === level.level);
  return rewards;
}

export async function getDataWithRank(identifier: LevelIdentifier, client: DiscordClient): Promise<PositionLevel | undefined> {
  return (await computeLeaderboard(await getLeaderboard(identifier.guildId), client)).find((level) => level.userId === identifier.userId);
}

export async function getWeeklyDataWithRank(identifier: LevelIdentifier, client: DiscordClient): Promise<PositionLevel | undefined> {
  return (await computeLeaderboard(await getWeeklyLeaderboard(identifier.guildId), client)).find((level) => level.userId === identifier.userId);
}

export async function getLeaderboard(guildId: string): Promise<Level[]> {
  return await levelModel
    .find({ guildId })
    .sort([['xp', 'descending']])
    .lean()
    .exec();
}

export async function getWeeklyLeaderboard(guildId: string): Promise<Level[]> {
  return await weeklyLevelModel
    .find({ guildId })
    .sort([['xp', 'descending']])
    .lean()
    .exec();
}

export async function computeLeaderboard(leaderboard: Level[], client: DiscordClient): Promise<PositionLevel[]> {
  const computedLeaderboard: PositionLevel[] = [];

  for (const level of leaderboard) {
    const usernames = await client.cluster.broadcastEval(
      (c, { userId }) => {
        const user = c.users.cache.get(userId);
        if (user) return user.username;
        return false;
      },
      { context: { userId: level.userId } }
    );
    const username = usernames.find((name) => typeof name === 'string');
    const position = leaderboard.findIndex((lvl) => lvl.userId === level.userId) + 1;

    computedLeaderboard.push({ ...level, position, username: username || `<@${level.userId}>` });
  }

  return computedLeaderboard;
}
