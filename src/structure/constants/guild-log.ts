import { ChannelType, Events } from 'discord.js';

import type { LogEventDefinition } from 'types/guild-log';

export const APPLICATION_COMMAND_PERMISSIONS_UPDATE: LogEventDefinition = {
  name: Events.ApplicationCommandPermissionsUpdate,
  description: 'Emitted whenever permissions for an application command in a guild were updated.',
  canExcludeChannels: false,
  canIncludeChannels: false,
  canExcludeRoles: false,
  canIncludeRoles: false,
  canExcludeUsers: true,
  canIncludeUsers: true,
  canExcludeBotsOnly: true,
  canIncludeBotsOnly: true
};
export const AUTO_MODERATION_ACTION_EXECUTION: LogEventDefinition = {
  name: Events.AutoModerationActionExecution,
  description: 'Emitted whenever an auto moderation rule is triggered.',
  canExcludeChannels: true,
  canIncludeChannels: true,
  canExcludeRoles: true,
  canIncludeRoles: true,
  canExcludeUsers: true,
  canIncludeUsers: true
};
export const AUTO_MODERATION_RULE_CREATE: LogEventDefinition = {
  name: Events.AutoModerationRuleCreate,
  description: 'Emitted whenever an auto moderation rule is created.',
  canExcludeChannels: false,
  canIncludeChannels: false,
  canExcludeRoles: false,
  canIncludeRoles: false,
  canExcludeUsers: false,
  canIncludeUsers: false
};
export const AUTO_MODERATION_RULE_DELETE: LogEventDefinition = {
  name: Events.AutoModerationRuleDelete,
  description: 'Emitted whenever an auto moderation rule is deleted.',
  canExcludeChannels: false,
  canIncludeChannels: false,
  canExcludeRoles: false,
  canIncludeRoles: false,
  canExcludeUsers: false,
  canIncludeUsers: false
};
export const AUTO_MODERATION_RULE_UPDATE: LogEventDefinition = {
  name: Events.AutoModerationRuleUpdate,
  description: 'Emitted whenever an auto moderation rule is updated.',
  canExcludeChannels: false,
  canIncludeChannels: false,
  canExcludeRoles: false,
  canIncludeRoles: false,
  canExcludeUsers: false,
  canIncludeUsers: false
};
export const CHANNEL_CREATE: LogEventDefinition = {
  name: Events.ChannelCreate,
  description: 'Emitted whenever a channel is created.',
  canExcludeChannels: false,
  canIncludeChannels: false,
  canExcludeRoles: false,
  canIncludeRoles: false,
  canExcludeUsers: false,
  canIncludeUsers: false
};
export const CHANNEL_DELETE: LogEventDefinition = {
  name: Events.ChannelDelete,
  description: 'Emitted whenever a channel is deleted.',
  canExcludeChannels: false,
  canIncludeChannels: false,
  canExcludeRoles: false,
  canIncludeRoles: false,
  canExcludeUsers: false,
  canIncludeUsers: false
};
export const CHANNEL_UPDATE: LogEventDefinition = {
  name: Events.ChannelUpdate,
  description: 'Emitted whenever a channel is updated.',
  canExcludeChannels: true,
  canIncludeChannels: true,
  canExcludeRoles: false,
  canIncludeRoles: false,
  canExcludeUsers: false,
  canIncludeUsers: false
};
export const GUILD_EMOJI_CREATE: LogEventDefinition = {
  name: Events.GuildEmojiCreate,
  description: 'Emitted whenever an emoji is created in a guild.',
  canExcludeChannels: false,
  canIncludeChannels: false,
  canExcludeRoles: false,
  canIncludeRoles: false,
  canExcludeUsers: false,
  canIncludeUsers: false
};
export const GUILD_EMOJI_DELETE: LogEventDefinition = {
  name: Events.GuildEmojiDelete,
  description: 'Emitted whenever an emoji is deleted in a guild.',
  canExcludeChannels: false,
  canIncludeChannels: false,
  canExcludeRoles: false,
  canIncludeRoles: false,
  canExcludeUsers: false,
  canIncludeUsers: false
};
export const GUILD_EMOJI_UPDATE: LogEventDefinition = {
  name: Events.GuildEmojiUpdate,
  description: 'Emitted whenever an emoji is updated in a guild.',
  canExcludeChannels: false,
  canIncludeChannels: false,
  canExcludeRoles: false,
  canIncludeRoles: false,
  canExcludeUsers: false,
  canIncludeUsers: false
};
export const GUILD_BAN_ADD: LogEventDefinition = {
  name: Events.GuildBanAdd,
  description: 'Emitted whenever a member is banned from a guild.',
  canExcludeChannels: false,
  canIncludeChannels: false,
  canExcludeRoles: true,
  canIncludeRoles: true,
  canExcludeUsers: true,
  canIncludeUsers: false
};
export const GUILD_BAN_REMOVE: LogEventDefinition = {
  name: Events.GuildBanRemove,
  description: 'Emitted whenever a member is unbanned from a guild.',
  canExcludeChannels: false,
  canIncludeChannels: false,
  canExcludeRoles: false,
  canIncludeRoles: false,
  canExcludeUsers: true,
  canIncludeUsers: false
};
export const GUILD_MEMBER_ADD: LogEventDefinition = {
  name: Events.GuildMemberAdd,
  description: 'Emitted whenever a member joins a guild.',
  canExcludeChannels: false,
  canIncludeChannels: false,
  canExcludeRoles: false,
  canIncludeRoles: false,
  canExcludeUsers: true,
  canIncludeUsers: false
};
export const GUILD_MEMBER_REMOVE: LogEventDefinition = {
  name: Events.GuildMemberRemove,
  description: 'Emitted whenever a member leaves a guild.',
  canExcludeChannels: false,
  canIncludeChannels: false,
  canExcludeRoles: true,
  canIncludeRoles: true,
  canExcludeUsers: false,
  canIncludeUsers: false
};
export const GUILD_MEMBER_UPDATE: LogEventDefinition = {
  name: Events.GuildMemberUpdate,
  description: 'Emitted whenever a member is updated in a guild.',
  canExcludeChannels: false,
  canIncludeChannels: false,
  canExcludeRoles: true,
  canIncludeRoles: true,
  canExcludeUsers: false,
  canIncludeUsers: false
};
export const GUILD_SCHEDULED_EVENT_CREATE: LogEventDefinition = {
  name: Events.GuildScheduledEventCreate,
  description: 'Emitted whenever a scheduled event is created in a guild.',
  canExcludeChannels: false,
  canIncludeChannels: false,
  canExcludeRoles: false,
  canIncludeRoles: false,
  canExcludeUsers: false,
  canIncludeUsers: false
};
export const GUILD_SCHEDULED_EVENT_DELETE: LogEventDefinition = {
  name: Events.GuildScheduledEventDelete,
  description: 'Emitted whenever a scheduled event is deleted in a guild.',
  canExcludeChannels: false,
  canIncludeChannels: false,
  canExcludeRoles: false,
  canIncludeRoles: false,
  canExcludeUsers: false,
  canIncludeUsers: false
};
export const GUILD_SCHEDULED_EVENT_UPDATE: LogEventDefinition = {
  name: Events.GuildScheduledEventUpdate,
  description: 'Emitted whenever a scheduled event is updated in a guild.',
  canExcludeChannels: false,
  canIncludeChannels: false,
  canExcludeRoles: false,
  canIncludeRoles: false,
  canExcludeUsers: false,
  canIncludeUsers: false
};
export const GUILD_SCHEDULED_EVENT_USER_ADD: LogEventDefinition = {
  name: Events.GuildScheduledEventUserAdd,
  description: 'Emitted whenever a user is added to a scheduled event in a guild.',
  canExcludeChannels: false,
  canIncludeChannels: false,
  canExcludeRoles: false,
  canIncludeRoles: false,
  canExcludeUsers: false,
  canIncludeUsers: false
};
export const GUILD_SCHEDULED_EVENT_USER_REMOVE: LogEventDefinition = {
  name: Events.GuildScheduledEventUserRemove,
  description: 'Emitted whenever a user is removed from a scheduled event in a guild.',
  canExcludeChannels: false,
  canIncludeChannels: false,
  canExcludeRoles: false,
  canIncludeRoles: false,
  canExcludeUsers: false,
  canIncludeUsers: false
};
export const GUILD_UPDATE: LogEventDefinition = {
  name: Events.GuildUpdate,
  description: 'Emitted whenever a guild is updated.',
  canExcludeChannels: false,
  canIncludeChannels: false,
  canExcludeRoles: false,
  canIncludeRoles: false,
  canExcludeUsers: false,
  canIncludeUsers: false
};
export const INVITE_CREATE: LogEventDefinition = {
  name: Events.InviteCreate,
  description: 'Emitted whenever an invite is created in a guild.',
  canExcludeChannels: false,
  canIncludeChannels: false,
  canExcludeRoles: false,
  canIncludeRoles: false,
  canExcludeUsers: false,
  canIncludeUsers: false
};
export const INVITE_DELETE: LogEventDefinition = {
  name: Events.InviteDelete,
  description: 'Emitted whenever an invite is deleted in a guild.',
  canExcludeChannels: false,
  canIncludeChannels: false,
  canExcludeRoles: false,
  canIncludeRoles: false,
  canExcludeUsers: false,
  canIncludeUsers: false
};
export const MESSAGE_UPDATE: LogEventDefinition = {
  name: Events.MessageUpdate,
  description: 'Emitted whenever a message is updated in a guild.',
  canExcludeChannels: true,
  excludableChannelTypes: [
    ChannelType.GuildText,
    ChannelType.GuildVoice,
    ChannelType.GuildAnnouncement,
    ChannelType.GuildForum,
    ChannelType.GuildMedia,
    ChannelType.AnnouncementThread,
    ChannelType.PublicThread,
    ChannelType.PrivateThread
  ],
  canIncludeChannels: true,
  includableChannelTypes: [
    ChannelType.GuildText,
    ChannelType.GuildVoice,
    ChannelType.GuildAnnouncement,
    ChannelType.GuildForum,
    ChannelType.GuildMedia,
    ChannelType.AnnouncementThread,
    ChannelType.PublicThread,
    ChannelType.PrivateThread
  ],
  canExcludeRoles: true,
  canIncludeRoles: true,
  canExcludeUsers: true,
  canIncludeUsers: false
};
export const MESSAGE_DELETE: LogEventDefinition = {
  name: Events.MessageDelete,
  description: 'Emitted whenever a message is deleted in a guild.',
  canExcludeChannels: true,
  excludableChannelTypes: [
    ChannelType.GuildText,
    ChannelType.GuildVoice,
    ChannelType.GuildAnnouncement,
    ChannelType.GuildForum,
    ChannelType.GuildMedia,
    ChannelType.AnnouncementThread,
    ChannelType.PublicThread,
    ChannelType.PrivateThread
  ],
  canIncludeChannels: true,
  includableChannelTypes: [
    ChannelType.GuildText,
    ChannelType.GuildVoice,
    ChannelType.GuildAnnouncement,
    ChannelType.GuildForum,
    ChannelType.GuildMedia,
    ChannelType.AnnouncementThread,
    ChannelType.PublicThread,
    ChannelType.PrivateThread
  ],
  canExcludeRoles: true,
  canIncludeRoles: true,
  canExcludeUsers: true,
  canIncludeUsers: false
};
export const MESSAGE_BULK_DELETE: LogEventDefinition = {
  name: Events.MessageBulkDelete,
  description: 'Emitted whenever messages are deleted in bulk in a guild.',
  canExcludeChannels: true,
  excludableChannelTypes: [
    ChannelType.GuildText,
    ChannelType.GuildVoice,
    ChannelType.GuildAnnouncement,
    ChannelType.GuildForum,
    ChannelType.GuildMedia,
    ChannelType.AnnouncementThread,
    ChannelType.PublicThread,
    ChannelType.PrivateThread
  ],
  canIncludeChannels: true,
  includableChannelTypes: [
    ChannelType.GuildText,
    ChannelType.GuildVoice,
    ChannelType.GuildAnnouncement,
    ChannelType.GuildForum,
    ChannelType.GuildMedia,
    ChannelType.AnnouncementThread,
    ChannelType.PublicThread,
    ChannelType.PrivateThread
  ],
  canExcludeRoles: true,
  canIncludeRoles: true,
  canExcludeUsers: true,
  canIncludeUsers: false
};
export const MESSAGE_REACTION_REMOVE_ALL: LogEventDefinition = {
  name: Events.MessageReactionRemoveAll,
  description: 'Emitted whenever all reactions are removed from a message in a guild.',
  canExcludeChannels: true,
  canIncludeChannels: true,
  canExcludeRoles: true,
  canIncludeRoles: true,
  canExcludeUsers: true,
  canIncludeUsers: false
};
export const GUILD_ROLE_CREATE: LogEventDefinition = {
  name: Events.GuildRoleCreate,
  description: 'Emitted whenever a role is created in a guild.',
  canExcludeChannels: false,
  canIncludeChannels: false,
  canExcludeRoles: false,
  canIncludeRoles: false,
  canExcludeUsers: false,
  canIncludeUsers: false
};
export const GUILD_ROLE_DELETE: LogEventDefinition = {
  name: Events.GuildRoleDelete,
  description: 'Emitted whenever a role is deleted in a guild.',
  canExcludeChannels: false,
  canIncludeChannels: false,
  canExcludeRoles: false,
  canIncludeRoles: false,
  canExcludeUsers: false,
  canIncludeUsers: false
};
export const GUILD_ROLE_UPDATE: LogEventDefinition = {
  name: Events.GuildRoleUpdate,
  description: 'Emitted whenever a role is updated in a guild.',
  canExcludeChannels: false,
  canIncludeChannels: false,
  canExcludeRoles: true,
  canIncludeRoles: true,
  canExcludeUsers: false,
  canIncludeUsers: false
};
export const GUILD_STICKER_CREATE: LogEventDefinition = {
  name: Events.GuildStickerCreate,
  description: 'Emitted whenever a sticker is created in a guild.',
  canExcludeChannels: false,
  canIncludeChannels: false,
  canExcludeRoles: false,
  canIncludeRoles: false,
  canExcludeUsers: false,
  canIncludeUsers: false
};
export const GUILD_STICKER_DELETE: LogEventDefinition = {
  name: Events.GuildStickerDelete,
  description: 'Emitted whenever a sticker is deleted in a guild.',
  canExcludeChannels: false,
  canIncludeChannels: false,
  canExcludeRoles: false,
  canIncludeRoles: false,
  canExcludeUsers: false,
  canIncludeUsers: false
};
export const GUILD_STICKER_UPDATE: LogEventDefinition = {
  name: Events.GuildStickerUpdate,
  description: 'Emitted whenever a sticker is updated in a guild.',
  canExcludeChannels: false,
  canIncludeChannels: false,
  canExcludeRoles: false,
  canIncludeRoles: false,
  canExcludeUsers: false,
  canIncludeUsers: false
};
export const THREAD_CREATE: LogEventDefinition = {
  name: Events.ThreadCreate,
  description: 'Emitted whenever a thread is created in a guild.',
  canExcludeChannels: false,
  canIncludeChannels: false,
  canExcludeRoles: false,
  canIncludeRoles: false,
  canExcludeUsers: false,
  canIncludeUsers: false
};
export const THREAD_DELETE: LogEventDefinition = {
  name: Events.ThreadDelete,
  description: 'Emitted whenever a thread is deleted in a guild.',
  canExcludeChannels: false,
  canIncludeChannels: false,
  canExcludeRoles: false,
  canIncludeRoles: false,
  canExcludeUsers: false,
  canIncludeUsers: false
};
export const THREAD_UPDATE: LogEventDefinition = {
  name: Events.ThreadUpdate,
  description: 'Emitted whenever a thread is updated in a guild.',
  canExcludeChannels: true,
  excludableChannelTypes: [ChannelType.PublicThread, ChannelType.PrivateThread, ChannelType.AnnouncementThread],
  canIncludeChannels: true,
  includableChannelTypes: [ChannelType.PublicThread, ChannelType.PrivateThread, ChannelType.AnnouncementThread],
  canExcludeRoles: false,
  canIncludeRoles: false,
  canExcludeUsers: false,
  canIncludeUsers: false
};
export const VOICE_STATE_UPDATE: LogEventDefinition = {
  name: Events.VoiceStateUpdate,
  description: "Emitted whenever a member's voice state changes in a guild.",
  canExcludeChannels: true,
  excludableChannelTypes: [ChannelType.GuildVoice, ChannelType.GuildStageVoice],
  canIncludeChannels: true,
  includableChannelTypes: [ChannelType.GuildVoice, ChannelType.GuildStageVoice],
  canExcludeRoles: true,
  canIncludeRoles: true,
  canExcludeUsers: true,
  canIncludeUsers: true
};

export const LOG_EVENT_DEFINITION: LogEventDefinition[] = [
  APPLICATION_COMMAND_PERMISSIONS_UPDATE,
  AUTO_MODERATION_ACTION_EXECUTION,
  AUTO_MODERATION_RULE_CREATE,
  AUTO_MODERATION_RULE_DELETE,
  AUTO_MODERATION_RULE_UPDATE,
  CHANNEL_CREATE,
  CHANNEL_DELETE,
  CHANNEL_UPDATE,
  GUILD_EMOJI_CREATE,
  GUILD_EMOJI_DELETE,
  GUILD_EMOJI_UPDATE,
  GUILD_BAN_ADD,
  GUILD_BAN_REMOVE,
  GUILD_MEMBER_ADD,
  GUILD_MEMBER_REMOVE,
  GUILD_MEMBER_UPDATE,
  GUILD_SCHEDULED_EVENT_CREATE,
  GUILD_SCHEDULED_EVENT_DELETE,
  GUILD_SCHEDULED_EVENT_UPDATE,
  GUILD_SCHEDULED_EVENT_USER_ADD,
  GUILD_SCHEDULED_EVENT_USER_REMOVE,
  GUILD_UPDATE,
  INVITE_CREATE,
  INVITE_DELETE,
  MESSAGE_UPDATE,
  MESSAGE_DELETE,
  MESSAGE_BULK_DELETE,
  MESSAGE_REACTION_REMOVE_ALL,
  GUILD_ROLE_CREATE,
  GUILD_ROLE_DELETE,
  GUILD_ROLE_UPDATE,
  GUILD_STICKER_CREATE,
  GUILD_STICKER_DELETE,
  GUILD_STICKER_UPDATE,
  THREAD_UPDATE,
  THREAD_DELETE,
  THREAD_UPDATE,
  VOICE_STATE_UPDATE
];

export const LOG_EVENT_VALIDATION_LIST = [
  Events.ApplicationCommandPermissionsUpdate,
  Events.AutoModerationActionExecution,
  Events.AutoModerationRuleCreate,
  Events.AutoModerationRuleDelete,
  Events.AutoModerationRuleUpdate,
  Events.ChannelCreate,
  Events.ChannelDelete,
  Events.ChannelUpdate,
  Events.GuildEmojiCreate,
  Events.GuildEmojiDelete,
  Events.GuildEmojiUpdate,
  Events.GuildBanAdd,
  Events.GuildBanRemove,
  Events.GuildMemberAdd,
  Events.GuildMemberRemove,
  Events.GuildMemberUpdate,
  Events.GuildScheduledEventCreate,
  Events.GuildScheduledEventDelete,
  Events.GuildScheduledEventUpdate,
  Events.GuildScheduledEventUserAdd,
  Events.GuildScheduledEventUserRemove,
  Events.GuildUpdate,
  Events.InviteCreate,
  Events.InviteDelete,
  Events.MessageUpdate,
  Events.MessageDelete,
  Events.MessageBulkDelete,
  Events.MessageReactionRemoveAll,
  Events.GuildRoleCreate,
  Events.GuildRoleDelete,
  Events.GuildRoleUpdate,
  Events.GuildStickerCreate,
  Events.GuildStickerDelete,
  Events.GuildStickerUpdate,
  Events.ThreadCreate,
  Events.ThreadDelete,
  Events.ThreadUpdate,
  Events.VoiceStateUpdate
];

export const LOG_EVENT_RECOMMENDATIONS_ENABLED = [
  Events.ApplicationCommandPermissionsUpdate,
  Events.AutoModerationActionExecution,
  Events.AutoModerationRuleCreate,
  Events.AutoModerationRuleDelete,
  Events.AutoModerationRuleUpdate,
  Events.GuildScheduledEventCreate,
  Events.GuildScheduledEventDelete,
  Events.GuildScheduledEventUpdate,
  Events.GuildScheduledEventUserAdd,
  Events.GuildScheduledEventUserRemove,
  Events.InviteCreate,
  Events.InviteDelete,
  Events.ThreadCreate,
  Events.ThreadDelete,
  Events.ThreadUpdate,
  Events.VoiceStateUpdate
];

export const LOG_EVENT_RECOMMENDATIONS_DISABLED = [
  Events.ChannelCreate,
  Events.ChannelDelete,
  Events.ChannelUpdate,
  Events.GuildEmojiCreate,
  Events.GuildEmojiDelete,
  Events.GuildEmojiUpdate,
  Events.GuildBanAdd,
  Events.GuildBanRemove,
  Events.GuildMemberAdd,
  Events.GuildMemberRemove,
  Events.GuildMemberUpdate,
  Events.GuildUpdate,
  Events.MessageUpdate,
  Events.MessageDelete,
  Events.MessageBulkDelete,
  Events.MessageReactionRemoveAll,
  Events.GuildRoleCreate,
  Events.GuildRoleDelete,
  Events.GuildRoleUpdate,
  Events.GuildStickerCreate,
  Events.GuildStickerDelete,
  Events.GuildStickerUpdate
];
