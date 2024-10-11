import mongoose, { Model, model, Schema, Types } from 'mongoose';

import { type GuildDocument } from 'types/guild';

export const guildModel: Model<GuildDocument> =
  mongoose.models['guild'] ||
  model<GuildDocument>(
    'guild',
    new Schema<GuildDocument>({
      guildId: { type: String, required: true },
      language: { type: String, required: false },
      customVoice: { type: Types.ObjectId, ref: 'custom_voice_config', required: false },
      starboard: { type: Types.ObjectId, ref: 'starboard_config', required: false },
      reactionRoles: { type: Types.ObjectId, ref: 'reaction_role_config', required: false },
      counting: { type: Types.ObjectId, ref: 'counting_config', required: false },
      ticket: { type: Types.ObjectId, ref: 'ticket_config', required: false },
      moderation: { type: Types.ObjectId, ref: 'moderation', required: false },
      level: { type: Types.ObjectId, ref: 'level_config', required: false },
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
                url: { type: String }
              },
              footer: {
                text: { type: String },
                icon_url: { type: String }
              },
              fields: [
                {
                  name: { type: String },
                  value: { type: String },
                  inline: { type: Boolean }
                }
              ]
            }
          }
        },
        default: {
          enabled: true,
          message: {
            content: null,
            embed: {
              color: undefined,
              description: undefined,
              image: undefined,
              thumbnail: undefined,
              title: undefined,
              url: undefined,
              author: {
                name: undefined,
                icon_url: undefined,
                url: undefined
              },
              fields: [],
              footer: {
                text: undefined,
                icon_url: undefined
              }
            }
          },
          roles: []
        }
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
                url: { type: String }
              },
              footer: {
                text: { type: String },
                icon_url: { type: String }
              },
              fields: [
                {
                  name: { type: String },
                  value: { type: String },
                  inline: { type: Boolean }
                }
              ]
            }
          }
        },
        default: {
          enabled: true,
          message: {
            content: null,
            embed: {
              color: undefined,
              description: undefined,
              image: undefined,
              thumbnail: undefined,
              title: undefined,
              url: undefined,
              author: {
                name: undefined,
                icon_url: undefined,
                url: undefined
              },
              fields: [],
              footer: {
                text: undefined,
                icon_url: undefined
              }
            }
          }
        }
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
            voiceStateUpdate: { type: Boolean }
          }
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
            voiceStateUpdate: false
          }
        }
      }
    })
  );
