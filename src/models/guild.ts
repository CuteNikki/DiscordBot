import mongoose, { Model, model, Schema, Types } from 'mongoose';

export enum AnnouncementType {
  UserChannel,
  OtherChannel,
  PrivateMessage,
}

export const availableEvents = [
  'applicationCommandPermissionsUpdate',
  'autoModerationActionExecution',
  'autoModerationRuleCreate',
  'autoModerationRuleDelete',
  'autoModerationRuleUpdate',
  'channelCreate',
  'channelDelete',
  'channelUpdate',
  'emojiCreate',
  'emojiDelete',
  'emojiUpdate',
  'guildBanAdd',
  'guildBanRemove',
  'guildMemberAdd',
  'guildMemberRemove',
  'guildMemberUpdate',
  'guildScheduledEventCreate',
  'guildScheduledEventDelete',
  'guildScheduledEventUpdate',
  'guildScheduledEventUserAdd',
  'guildScheduledEventUserRemove',
  'guildUpdate',
  'inviteCreate',
  'inviteDelete',
  'messageUpdate',
  'messageDelete',
  'messageBulkDelete',
  'messageReactionRemoveAll',
  'roleCreate',
  'roleDelete',
  'roleUpdate',
  'stickerCreate',
  'stickerDelete',
  'stickerUpdate',
  'threadCreate',
  'threadDelete',
  'threadUpdate',
  'voiceStateUpdate',
];

// !! Embed cannot be empty !!
// Either a title, description, author-name, footer-text or field is needed
export interface Embed {
  color: string | number | null;
  title: string | null; // max 256 characters
  url: string | null; // max 256 characters
  description: string | null; // max 4096 characters
  thumbnail?: string; // max 256 characters
  image?: string; // max 256 characters
  author: {
    name: string | null; // max 256 characters
    icon_url: string | null; // max 256 characters
    url: string | null; // max 256 characters
  };
  footer: {
    text: string | null; // max 2048 characters
    icon_url: string | null; // max 256 characters
  };
  // max 25 fields
  fields: {
    name: string; // max 256 characters
    value: string; // max 1024 characters
    inline: boolean | null;
  }[];
}

export interface Message {
  content: string | null; // max 2000 characters
  embed: Embed; // max 10 embeds but not using array
}

export interface LevelReward {
  roleId: string;
  level: number;
  _id: Types.ObjectId;
}

export interface GuildSettings {
  _id: Types.ObjectId;
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
    rewards: LevelReward[];
  };
  welcome: {
    enabled: boolean;
    channelId: string;
    roles: string[];
    message: Message;
  };
  farewell: {
    enabled: boolean;
    channelId: string;
    message: Message;
  };
  log: {
    enabled: boolean;
    channelId?: string;
    events: {
      applicationCommandPermissionsUpdate: boolean;
      autoModerationActionExecution: boolean;
      autoModerationRuleCreate: boolean;
      autoModerationRuleDelete: boolean;
      autoModerationRuleUpdate: boolean;
      channelCreate: boolean;
      channelDelete: boolean;
      channelUpdate: boolean;
      emojiCreate: boolean;
      emojiDelete: boolean;
      emojiUpdate: boolean;
      guildBanAdd: boolean;
      guildBanRemove: boolean;
      guildMemberAdd: boolean;
      guildMemberRemove: boolean;
      guildMemberUpdate: boolean;
      guildScheduledEventCreate: boolean;
      guildScheduledEventDelete: boolean;
      guildScheduledEventUpdate: boolean;
      guildScheduledEventUserAdd: boolean;
      guildScheduledEventUserRemove: boolean;
      guildUpdate: boolean;
      inviteCreate: boolean;
      inviteDelete: boolean;
      messageUpdate: boolean;
      messageDelete: boolean;
      messageBulkDelete: boolean;
      messageReactionRemoveAll: boolean;
      roleCreate: boolean;
      roleDelete: boolean;
      roleUpdate: boolean;
      stickerCreate: boolean;
      stickerDelete: boolean;
      stickerUpdate: boolean;
      threadCreate: boolean;
      threadDelete: boolean;
      threadUpdate: boolean;
      voiceStateUpdate: boolean;
    };
  };
}

const guildSchema = new Schema<GuildSettings>({
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
  welcome: {
    type: {
      channelId: { type: String },
      enabled: { type: Boolean },
      roles: [{ type: String }],
      message: {
        content: { type: String },
        embed: {
          color: { type: String },
          title: { type: String },
          url: { type: String },
          description: { type: String },
          thumbnail: { type: String },
          image: { type: String },
          author: {
            name: { type: String },
            icon_url: { type: String },
            url: { type: String },
          },
          footer: {
            text: { type: String },
            icon_url: { type: String },
          },
          fields: [
            {
              name: { type: String },
              value: { type: String },
              inline: { type: Boolean },
            },
          ],
        },
      },
    },
    default: {
      enabled: true,
      message: {
        content: null,
        embed: {
          color: null,
          description: null,
          image: undefined,
          thumbnail: undefined,
          title: null,
          url: null,
          author: {
            name: null,
            icon_url: null,
            url: null,
          },
          fields: [],
          footer: {
            text: null,
            icon_url: null,
          },
        },
      },
      roles: [],
    },
  },
  farewell: {
    type: {
      channelId: { type: String },
      enabled: { type: Boolean },
      message: {
        content: { type: String },
        embed: {
          color: { type: String },
          title: { type: String },
          url: { type: String },
          description: { type: String },
          thumbnail: { type: String },
          image: { type: String },
          author: {
            name: { type: String },
            icon_url: { type: String },
            url: { type: String },
          },
          footer: {
            text: { type: String },
            icon_url: { type: String },
          },
          fields: [
            {
              name: { type: String },
              value: { type: String },
              inline: { type: Boolean },
            },
          ],
        },
      },
    },
    default: {
      enabled: true,
      message: {
        content: null,
        embed: {
          color: null,
          description: null,
          image: undefined,
          thumbnail: undefined,
          title: null,
          url: null,
          author: {
            name: null,
            icon_url: null,
            url: null,
          },
          fields: [],
          footer: {
            text: null,
            icon_url: null,
          },
        },
      },
    },
  },
  level: {
    type: {
      enabled: { type: Boolean },
      channelId: { type: String },
      announcement: { type: Number, enum: Object.values(AnnouncementType).filter((value) => typeof value === 'number') },
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
      channelId: undefined,
      announcement: AnnouncementType.UserChannel,
      ignoredRoles: [],
      ignoredChannels: [],
      enabledChannels: [],
      rewards: [],
    },
  },
  log: {
    type: {
      enabled: { type: Boolean },
      channelId: { type: String },
      events: {
        applicationCommandPermissionsUpdate: { type: Boolean },
        autoModerationActionExecution: { type: Boolean },
        autoModerationRuleCreate: { type: Boolean },
        autoModerationRuleDelete: { type: Boolean },
        autoModerationRuleUpdate: { type: Boolean },
        channelCreate: { type: Boolean },
        channelDelete: { type: Boolean },
        channelUpdate: { type: Boolean },
        emojiCreate: { type: Boolean },
        emojiDelete: { type: Boolean },
        emojiUpdate: { type: Boolean },
        guildBanAdd: { type: Boolean },
        guildBanRemove: { type: Boolean },
        guildMemberAdd: { type: Boolean },
        guildMemberRemove: { type: Boolean },
        guildMemberUpdate: { type: Boolean },
        guildScheduledEventCreate: { type: Boolean },
        guildScheduledEventDelete: { type: Boolean },
        guildScheduledEventUpdate: { type: Boolean },
        guildScheduledEventUserAdd: { type: Boolean },
        guildScheduledEventUserRemove: { type: Boolean },
        guildUpdate: { type: Boolean },
        inviteCreate: { type: Boolean },
        inviteDelete: { type: Boolean },
        messageUpdate: { type: Boolean },
        messageDelete: { type: Boolean },
        messageBulkDelete: { type: Boolean },
        messageReactionRemoveAll: { type: Boolean },
        roleCreate: { type: Boolean },
        roleDelete: { type: Boolean },
        roleUpdate: { type: Boolean },
        stickerCreate: { type: Boolean },
        stickerDelete: { type: Boolean },
        stickerUpdate: { type: Boolean },
        threadCreate: { type: Boolean },
        threadDelete: { type: Boolean },
        threadUpdate: { type: Boolean },
        voiceStateUpdate: { type: Boolean },
      },
    },
    default: {
      enabled: true,
      channelId: undefined,
      events: {
        applicationCommandPermissionsUpdate: false,
        autoModerationActionExecution: false,
        autoModerationRuleCreate: false,
        autoModerationRuleDelete: false,
        autoModerationRuleUpdate: false,
        channelCreate: false,
        channelDelete: false,
        channelUpdate: false,
        emojiCreate: false,
        emojiDelete: false,
        emojiUpdate: false,
        guildBanAdd: false,
        guildBanRemove: false,
        guildMemberAdd: false,
        guildMemberRemove: false,
        guildMemberUpdate: false,
        guildScheduledEventCreate: false,
        guildScheduledEventDelete: false,
        guildScheduledEventUpdate: false,
        guildScheduledEventUserAdd: false,
        guildScheduledEventUserRemove: false,
        guildUpdate: false,
        inviteCreate: false,
        inviteDelete: false,
        messageUpdate: false,
        messageDelete: false,
        messageBulkDelete: false,
        messageReactionRemoveAll: false,
        roleCreate: false,
        roleDelete: false,
        roleUpdate: false,
        stickerCreate: false,
        stickerDelete: false,
        stickerUpdate: false,
        threadCreate: false,
        threadDelete: false,
        threadUpdate: false,
        voiceStateUpdate: false,
      },
    },
  },
});

export const guildModel: Model<GuildSettings> = mongoose.models['guild'] || model<GuildSettings>('guild', guildSchema);
