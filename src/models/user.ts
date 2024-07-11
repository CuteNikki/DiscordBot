import mongoose from 'mongoose';

export enum BadgeType {
  Developer,
  Moderator,
  Translator,
  Supporter,
  ExpertBughunter,
  Bughunter,
}

export interface Badge {
  id: BadgeType;
  receivedAt: number;
}

export interface UserData {
  userId: string;
  language?: string;
  banned: boolean;
  badges: Badge[];
}

export const userModel = mongoose.model(
  'user',
  new mongoose.Schema<UserData>({
    userId: { type: String, required: true },
    language: { type: String, requiredPaths: false },
    banned: { type: Boolean, default: false },
    badges: [
      {
        id: { type: Number, enum: Object.values(BadgeType).filter((value) => typeof value === 'number'), required: true },
        receivedAt: { type: Number, required: true },
      },
    ],
  })
);
