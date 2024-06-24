import mongoose from 'mongoose';

export enum AnnouncementType {
  USER_CHANNEL = 'USER_CHANNEL',
  OTHER_CHANNEL = 'OTHER_CHANNEL',
  PRIVATE_MESSAGE = 'PRIVATE_MESSAGE',
}

export interface Guild {
  guildId: string;
  moderation: {
    enabled: boolean;
  };
  music: {
    enabled: boolean;
  };
  level: {
    enabled: boolean;
    channelId?: string;
    announcement: AnnouncementType;
    ignoredRoles: string[];
    ignoredChannels: string[];
    enabledChannels: string[];
    rewards: { roleId: string; level: number; _id: mongoose.Types.ObjectId }[];
  };
}

export const guildModel = mongoose.model(
  'guild',
  new mongoose.Schema<Guild>({
    guildId: { type: String, required: true },
    music: {
      type: {
        enabled: { type: Boolean },
      },
      default: {
        enabled: false,
      },
    },
    moderation: {
      type: {
        enabled: { type: Boolean },
      },
      default: {
        enabled: true,
      },
    },
    level: {
      type: {
        enabled: { type: Boolean },
        channelId: { type: String },
        announcement: { type: String, enum: Object.values(AnnouncementType) },
        ignoredRoles: [{ type: String }],
        ignoredChannels: [{ type: String }],
        enabledChannels: [{ type: String }],
        rewards: [
          {
            level: { type: Number, required: true },
            roleId: { type: String, required: true },
          },
        ],
      },
      default: {
        enabled: false,
        announcement: AnnouncementType.USER_CHANNEL,
        ignoredRoles: [],
        ignoredChannels: [],
        enabledChannels: [],
        rewards: [],
      },
    },
  })
);
