import { AuditLogEvent, chatInputApplicationCommandMention, Events, Guild, GuildAuditLogsEntry, roleMention } from 'discord.js';

import type { ExtendedClient } from 'classes/base/client';
import { Event } from 'classes/base/event';

import { logger } from 'utility/logger';

export default new Event({
  name: Events.GuildAuditLogEntryCreate,
  once: false,
  async execute(client, auditLogEntry, guild) {
    logger.info({ entry: auditLogEntry.toJSON() }, `Audit log entry created: ${auditLogEntry.action} in ${guild.name} (${guild.id})`);

    // Auditlog experimenting
    if (auditLogEntry.isAction(AuditLogEvent.GuildUpdate)) {
      handleGuildUpdate(client, auditLogEntry, guild);
    } else if (auditLogEntry.isAction(AuditLogEvent.ChannelCreate)) {
      handleChannelCreate(client, auditLogEntry, guild);
    } else if (auditLogEntry.isAction(AuditLogEvent.ChannelUpdate)) {
      handleChannelUpdate(client, auditLogEntry, guild);
    } else if (auditLogEntry.isAction(AuditLogEvent.ChannelDelete)) {
      handleChannelDelete(client, auditLogEntry, guild);
    } else if (auditLogEntry.isAction(AuditLogEvent.ChannelOverwriteCreate)) {
      handleChannelOverwriteCreate(client, auditLogEntry, guild);
    } else if (auditLogEntry.isAction(AuditLogEvent.ChannelOverwriteUpdate)) {
      handleChannelOverwriteUpdate(client, auditLogEntry, guild);
    } else if (auditLogEntry.isAction(AuditLogEvent.ChannelOverwriteDelete)) {
      handleChannelOverwriteDelete(client, auditLogEntry, guild);
    } else if (auditLogEntry.isAction(AuditLogEvent.MemberKick)) {
      handleMemberKick(client, auditLogEntry, guild);
    } else if (auditLogEntry.isAction(AuditLogEvent.MemberPrune)) {
      handleMemberPrune(client, auditLogEntry, guild);
    } else if (auditLogEntry.isAction(AuditLogEvent.MemberBanAdd)) {
      handleMemberBanAdd(client, auditLogEntry, guild);
    } else if (auditLogEntry.isAction(AuditLogEvent.MemberBanRemove)) {
      handleMemberBanRemove(client, auditLogEntry, guild);
    } else if (auditLogEntry.isAction(AuditLogEvent.MemberUpdate)) {
      handleMemberUpdate(client, auditLogEntry, guild);
    } else if (auditLogEntry.isAction(AuditLogEvent.MemberRoleUpdate)) {
      handleMemberRoleUpdate(client, auditLogEntry, guild);
    } else if (auditLogEntry.isAction(AuditLogEvent.MemberMove)) {
      handleMemberMove(client, auditLogEntry, guild);
    } else if (auditLogEntry.isAction(AuditLogEvent.MemberDisconnect)) {
      handleMemberDisconnect(client, auditLogEntry, guild);
    } else if (auditLogEntry.isAction(AuditLogEvent.BotAdd)) {
      handleBotAdd(client, auditLogEntry, guild);
    } else if (auditLogEntry.isAction(AuditLogEvent.RoleCreate)) {
      handleRoleCreate(client, auditLogEntry, guild);
    } else if (auditLogEntry.isAction(AuditLogEvent.RoleUpdate)) {
      handleRoleUpdate(client, auditLogEntry, guild);
    } else if (auditLogEntry.isAction(AuditLogEvent.RoleDelete)) {
      handleRoleDelete(client, auditLogEntry, guild);
    } else if (auditLogEntry.isAction(AuditLogEvent.InviteCreate)) {
      handleInviteCreate(client, auditLogEntry, guild);
    } else if (auditLogEntry.isAction(AuditLogEvent.InviteUpdate)) {
      handleInviteUpdate(client, auditLogEntry, guild);
    } else if (auditLogEntry.isAction(AuditLogEvent.InviteDelete)) {
      handleInviteDelete(client, auditLogEntry, guild);
    } else if (auditLogEntry.isAction(AuditLogEvent.WebhookCreate)) {
      handleWebhookCreate(client, auditLogEntry, guild);
    } else if (auditLogEntry.isAction(AuditLogEvent.WebhookUpdate)) {
      handleWebhookUpdate(client, auditLogEntry, guild);
    } else if (auditLogEntry.isAction(AuditLogEvent.WebhookDelete)) {
      handleWebhookDelete(client, auditLogEntry, guild);
    } else if (auditLogEntry.isAction(AuditLogEvent.EmojiCreate)) {
      handleEmojiCreate(client, auditLogEntry, guild);
    } else if (auditLogEntry.isAction(AuditLogEvent.EmojiUpdate)) {
      handleEmojiUpdate(client, auditLogEntry, guild);
    } else if (auditLogEntry.isAction(AuditLogEvent.EmojiDelete)) {
      handleEmojiDelete(client, auditLogEntry, guild);
    } else if (auditLogEntry.isAction(AuditLogEvent.MessageDelete)) {
      handleMessageDelete(client, auditLogEntry, guild);
    } else if (auditLogEntry.isAction(AuditLogEvent.MessageBulkDelete)) {
      handleMessageBulkDelete(client, auditLogEntry, guild);
    } else if (auditLogEntry.isAction(AuditLogEvent.MessagePin)) {
      handleMessagePin(client, auditLogEntry, guild);
    } else if (auditLogEntry.isAction(AuditLogEvent.MessageUnpin)) {
      handleMessageUnpin(client, auditLogEntry, guild);
    } else if (auditLogEntry.isAction(AuditLogEvent.IntegrationCreate)) {
      handleIntegrationCreate(client, auditLogEntry, guild);
    } else if (auditLogEntry.isAction(AuditLogEvent.IntegrationUpdate)) {
      handleIntegrationUpdate(client, auditLogEntry, guild);
    } else if (auditLogEntry.isAction(AuditLogEvent.IntegrationDelete)) {
      handleIntegrationDelete(client, auditLogEntry, guild);
    } else if (auditLogEntry.isAction(AuditLogEvent.StageInstanceCreate)) {
      handleStageInstanceCreate(client, auditLogEntry, guild);
    } else if (auditLogEntry.isAction(AuditLogEvent.StageInstanceUpdate)) {
      handleStageInstanceUpdate(client, auditLogEntry, guild);
    } else if (auditLogEntry.isAction(AuditLogEvent.StageInstanceDelete)) {
      handleStageInstanceDelete(client, auditLogEntry, guild);
    } else if (auditLogEntry.isAction(AuditLogEvent.StickerCreate)) {
      handleStickerCreate(client, auditLogEntry, guild);
    } else if (auditLogEntry.isAction(AuditLogEvent.StickerUpdate)) {
      handleStickerUpdate(client, auditLogEntry, guild);
    } else if (auditLogEntry.isAction(AuditLogEvent.StickerDelete)) {
      handleStickerDelete(client, auditLogEntry, guild);
    } else if (auditLogEntry.isAction(AuditLogEvent.GuildScheduledEventCreate)) {
      handleGuildScheduledEventCreate(client, auditLogEntry, guild);
    } else if (auditLogEntry.isAction(AuditLogEvent.GuildScheduledEventUpdate)) {
      handleGuildScheduledEventUpdate(client, auditLogEntry, guild);
    } else if (auditLogEntry.isAction(AuditLogEvent.GuildScheduledEventDelete)) {
      handleGuildScheduledEventDelete(client, auditLogEntry, guild);
    } else if (auditLogEntry.isAction(AuditLogEvent.ThreadCreate)) {
      handleThreadCreate(client, auditLogEntry, guild);
    } else if (auditLogEntry.isAction(AuditLogEvent.ThreadUpdate)) {
      handleThreadUpdate(client, auditLogEntry, guild);
    } else if (auditLogEntry.isAction(AuditLogEvent.ThreadDelete)) {
      handleThreadDelete(client, auditLogEntry, guild);
    } else if (auditLogEntry.isAction(AuditLogEvent.ApplicationCommandPermissionUpdate)) {
      handleApplicationCommandPermissionUpdate(client, auditLogEntry, guild);
    } else if (auditLogEntry.isAction(AuditLogEvent.SoundboardSoundCreate)) {
      handleSoundboardSoundCreate(client, auditLogEntry, guild);
    } else if (auditLogEntry.isAction(AuditLogEvent.SoundboardSoundUpdate)) {
      handleSoundboardSoundUpdate(client, auditLogEntry, guild);
    } else if (auditLogEntry.isAction(AuditLogEvent.SoundboardSoundDelete)) {
      handleSoundboardSoundDelete(client, auditLogEntry, guild);
    } else if (auditLogEntry.isAction(AuditLogEvent.AutoModerationRuleCreate)) {
      handleAutoModerationRuleCreate(client, auditLogEntry, guild);
    } else if (auditLogEntry.isAction(AuditLogEvent.AutoModerationRuleUpdate)) {
      handleAutoModerationRuleUpdate(client, auditLogEntry, guild);
    } else if (auditLogEntry.isAction(AuditLogEvent.AutoModerationRuleDelete)) {
      handleAutoModerationRuleDelete(client, auditLogEntry, guild);
    } else if (auditLogEntry.isAction(AuditLogEvent.AutoModerationUserCommunicationDisabled)) {
      handleAutoModerationUserCommunicationDisabled(client, auditLogEntry, guild);
    } else if (auditLogEntry.isAction(AuditLogEvent.AutoModerationQuarantineUser)) {
      handleAutoModerationQuarantineUser(client, auditLogEntry, guild);
    } else if (auditLogEntry.isAction(AuditLogEvent.CreatorMonetizationRequestCreated)) {
      handleCreatorMonetizationRequestCreated(client, auditLogEntry, guild);
    } else if (auditLogEntry.isAction(AuditLogEvent.CreatorMonetizationTermsAccepted)) {
      handleCreatorMonetizationTermsAccepted(client, auditLogEntry, guild);
    } else if (auditLogEntry.isAction(AuditLogEvent.OnboardingPromptCreate)) {
      handleOnboardingPromptCreate(client, auditLogEntry, guild);
    } else if (auditLogEntry.isAction(AuditLogEvent.OnboardingPromptUpdate)) {
      handleOnboardingPromptUpdate(client, auditLogEntry, guild);
    } else if (auditLogEntry.isAction(AuditLogEvent.OnboardingPromptDelete)) {
      handleOnboardingPromptDelete(client, auditLogEntry, guild);
    } else if (auditLogEntry.isAction(AuditLogEvent.OnboardingCreate)) {
      handleOnboardingCreate(client, auditLogEntry, guild);
    } else if (auditLogEntry.isAction(AuditLogEvent.OnboardingUpdate)) {
      handleOnboardingUpdate(client, auditLogEntry, guild);
    } else if (auditLogEntry.isAction(AuditLogEvent.HomeSettingsCreate)) {
      handleHomeSettingsCreate(client, auditLogEntry, guild);
    } else if (auditLogEntry.isAction(AuditLogEvent.HomeSettingsUpdate)) {
      handleHomeSettingsUpdate(client, auditLogEntry, guild);
      // GuildProfileUpdate is not officially documented yet (action ID 211)
      // It handles changes to the guild profile such as profile banner color (brand_color_primary), traits, etc.
      // Example audit log entry:
      /*
      {
        "targetType": "Unknown",
        "actionType": "All",
        "action": 211,
        "reason": null,
        "executorId": "303142922780672013",
        "executor": "303142922780672013",
        "changes": [
          {
            "key": "traits",
            "old": [],
            "new": [
              {
                "position": 0,
                "label": "smile",
                "emoji_name": "grinning",
                "emoji_id": null,
                "emoji_animated": false
              }
            ]
          }
        ],
        "id": "1432366797457326263",
        "extra": null,
        "targetId": null,
        "target": {
          "traits": [
            {
              "position": 0,
              "label": "smile",
              "emoji_name": "grinning",
              "emoji_id": null,
              "emoji_animated": false
            }
          ],
          "id": null
        },
        "createdTimestamp": 1761573256602
      }
      Another example:
      {
        "targetType": "Unknown",
        "actionType": "All",
        "action": 211,
        "reason": null,
        "executorId": "303142922780672013",
        "executor": "303142922780672013",
        "changes": [
          {
            "key": "brand_color_primary",
            "old": "#ff1c90",
            "new": "#ff0000"
          }
        ],
        "id": "1432364095319052329",
        "extra": null,
        "targetId": null,
        "target": {
          "brand_color_primary": "#ff0000",
          "id": null
        },
        "createdTimestamp": 1761572612362
      }
      */
      // To handle this, uncomment and implement (once officially supported):
      // } else if (auditLogEntry.isAction(AuditLogEvent.GuildProfileUpdate)) {
      //   handleGuildProfileUpdate(client, auditLogEntry, guild);
    } else {
      logger.warn(`Unhandled audit log action: ${auditLogEntry.action}`);
    }
  },
});

/* eslint-disable @typescript-eslint/no-unused-vars */
function handleGuildUpdate(
  _client: ExtendedClient,
  auditLogEntry: GuildAuditLogsEntry<AuditLogEvent.GuildUpdate, 'Update', 'Guild'>,
  guild: Guild,
) {
  const changes = auditLogEntry.changes; // Array of changes made
  const executor = auditLogEntry.executor; // User who made the change
  const target = auditLogEntry.target; // Guild
  const reason = auditLogEntry.reason; // Reason for the change, if provided
  const extra = auditLogEntry.extra; // Extra information, varies by action type

  return logger.info(
    [
      `Guild updated: ${target.name} (${target.id})`,
      executor ? `By: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
      extra ? `Extra Info: ${JSON.stringify(extra, null, 2)}` : '',
      '',
      `Changes:`,
      ...changes.map((change) => `- **${change.key}**: ${change.old} -> ${change.new}`),
    ].join('\n'),
  );
}

function handleChannelCreate(
  _client: ExtendedClient,
  auditLogEntry: GuildAuditLogsEntry<AuditLogEvent.ChannelCreate, 'Create', 'Channel'>,
  guild: Guild,
) {
  const target = auditLogEntry.target; // Channel
  const executor = auditLogEntry.executor; // User who created the channel
  const reason = auditLogEntry.reason; // Reason for the creation, if provided

  return logger.info(
    [
      `Channel [${target.type}] created: ${target.name} (${target.id}) in Guild: ${guild.name} (${guild.id})`,
      executor ? `By: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
    ].join('\n'),
  );
}

function handleChannelUpdate(
  _client: ExtendedClient,
  auditLogEntry: GuildAuditLogsEntry<AuditLogEvent.ChannelUpdate, 'Update', 'Channel'>,
  guild: Guild,
) {
  const changes = auditLogEntry.changes; // Array of changes made
  const executor = auditLogEntry.executor; // User who made the change
  const target = auditLogEntry.target; // Channel
  const reason = auditLogEntry.reason; // Reason for the change, if provided

  return logger.info(
    [
      `Channel [${target.type}] updated: ${target.name} (${target.id}) in Guild: ${guild.name} (${guild.id})`,
      executor ? `By: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
      '',
      `Changes:`,
      ...changes.map((change) => `- **${change.key}**: ${change.old} -> ${change.new}`),
    ].join('\n'),
  );
}

function handleChannelDelete(
  _client: ExtendedClient,
  auditLogEntry: GuildAuditLogsEntry<AuditLogEvent.ChannelDelete, 'Delete', 'Channel'>,
  guild: Guild,
) {
  const target = auditLogEntry.target; // Channel
  const executor = auditLogEntry.executor; // User who deleted the channel
  const reason = auditLogEntry.reason; // Reason for the deletion, if provided

  return logger.info(
    [
      `Channel [${target.type}] deleted: ${target.name} (${target.id}) in Guild: ${guild.name} (${guild.id})`,
      executor ? `By: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
    ].join('\n'),
  );
}

function handleChannelOverwriteCreate(
  _client: ExtendedClient,
  auditLogEntry: GuildAuditLogsEntry<AuditLogEvent.ChannelOverwriteCreate, 'Create', 'Channel'>,
  guild: Guild,
) {
  const target = auditLogEntry.target; // Channel
  const executor = auditLogEntry.executor; // User who created the overwrite
  const reason = auditLogEntry.reason; // Reason for the creation, if provided
  const extra = auditLogEntry.extra; // Extra information about the overwrite

  return logger.info(
    [
      `Channel overwrite created in Channel: ${target.name} (${target.id}) in Guild: ${guild.name} (${guild.id})`,
      executor ? `By: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
      extra ? `Extra Info: ${JSON.stringify(extra, null, 2)}` : '',
    ].join('\n'),
  );
}

function handleChannelOverwriteUpdate(
  _client: ExtendedClient,
  auditLogEntry: GuildAuditLogsEntry<AuditLogEvent.ChannelOverwriteUpdate, 'Update', 'Channel'>,
  guild: Guild,
) {
  const changes = auditLogEntry.changes; // Array of changes made
  const executor = auditLogEntry.executor; // User who made the change
  const target = auditLogEntry.target; // Channel
  const reason = auditLogEntry.reason; // Reason for the change, if provided
  const extra = auditLogEntry.extra; // Extra information about the overwrite

  return logger.info(
    [
      `Channel overwrite updated in Channel: ${target.name} (${target.id}) in Guild: ${guild.name} (${guild.id})`,
      executor ? `By: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
      extra ? `Extra Info: ${JSON.stringify(extra, null, 2)}` : '',
      '',
      `Changes:`,
      ...changes.map((change) => `- **${change.key}**: ${change.old} -> ${change.new}`),
    ].join('\n'),
  );
}

function handleChannelOverwriteDelete(
  _client: ExtendedClient,
  auditLogEntry: GuildAuditLogsEntry<AuditLogEvent.ChannelOverwriteDelete, 'Delete', 'Channel'>,
  guild: Guild,
) {
  const target = auditLogEntry.target; // Channel
  const executor = auditLogEntry.executor; // User who deleted the overwrite
  const reason = auditLogEntry.reason; // Reason for the deletion, if provided
  const extra = auditLogEntry.extra; // Extra information about the overwrite

  return logger.info(
    [
      `Channel overwrite deleted in Channel: ${target.name} (${target.id}) in Guild: ${guild.name} (${guild.id})`,
      executor ? `By: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
      extra ? `Extra Info: ${JSON.stringify(extra, null, 2)}` : '',
    ].join('\n'),
  );
}

function handleMemberKick(
  _client: ExtendedClient,
  auditLogEntry: GuildAuditLogsEntry<AuditLogEvent.MemberKick, 'Delete', 'User'>,
  guild: Guild,
) {
  const target = auditLogEntry.target; // User who was kicked
  const executor = auditLogEntry.executor; // User who performed the kick
  const reason = auditLogEntry.reason; // Reason for the kick, if provided

  return logger.info(
    [
      `Member kicked: ${target?.tag} (${target?.id}) from Guild: ${guild.name} (${guild.id})`,
      executor ? `By: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
    ].join('\n'),
  );
}

function handleMemberPrune(
  _client: ExtendedClient,
  auditLogEntry: GuildAuditLogsEntry<AuditLogEvent.MemberPrune, 'Delete', 'User'>,
  guild: Guild,
) {
  const target = auditLogEntry.target; // User who was pruned
  const executor = auditLogEntry.executor; // User who performed the prune
  const reason = auditLogEntry.reason; // Reason for the prune, if provided
  const extra = auditLogEntry.extra; // Extra information about the prune

  return logger.info(
    [
      `Member pruned: ${target?.tag} (${target?.id}) from Guild: ${guild.name} (${guild.id})`,
      executor ? `By: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
      extra ? `Extra Info: ${JSON.stringify(extra, null, 2)}` : '',
    ].join('\n'),
  );
}

function handleMemberBanAdd(
  _client: ExtendedClient,
  auditLogEntry: GuildAuditLogsEntry<AuditLogEvent.MemberBanAdd, 'Delete', 'User'>,
  guild: Guild,
) {
  const target = auditLogEntry.target; // User who was banned
  const executor = auditLogEntry.executor; // User who performed the ban
  const reason = auditLogEntry.reason; // Reason for the ban, if provided
  const extra = auditLogEntry.extra; // Extra information about the ban

  return logger.info(
    [
      `Member banned: ${target?.tag} (${target?.id}) from Guild: ${guild.name} (${guild.id})`,
      executor ? `By: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
      extra ? `Extra Info: ${JSON.stringify(extra, null, 2)}` : '',
    ].join('\n'),
  );
}

function handleMemberBanRemove(
  _client: ExtendedClient,
  auditLogEntry: GuildAuditLogsEntry<AuditLogEvent.MemberBanRemove, 'Create', 'User'>,
  guild: Guild,
) {
  const target = auditLogEntry.target; // User who was unbanned
  const executor = auditLogEntry.executor; // User who performed the unban
  const reason = auditLogEntry.reason; // Reason for the unban, if provided
  const extra = auditLogEntry.extra; // Extra information about the unban

  return logger.info(
    [
      `Member unbanned: ${target?.tag} (${target?.id}) from Guild: ${guild.name} (${guild.id})`,
      executor ? `By: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
      extra ? `Extra Info: ${JSON.stringify(extra, null, 2)}` : '',
    ].join('\n'),
  );
}

function handleMemberUpdate(
  _client: ExtendedClient,
  auditLogEntry: GuildAuditLogsEntry<AuditLogEvent.MemberUpdate, 'Update', 'User'>,
  guild: Guild,
) {
  const changes = auditLogEntry.changes; // Array of changes made
  const executor = auditLogEntry.executor; // User who made the change
  const target = auditLogEntry.target; // User
  const reason = auditLogEntry.reason; // Reason for the change, if provided

  return logger.info(
    [
      `Member updated: ${target?.tag} (${target?.id}) in Guild: ${guild.name} (${guild.id})`,
      executor ? `By: ${executor.tag} (${executor.id})` : '',
      reason ? `Reason: ${reason}` : '',
      '',
      `Changes:`,
      ...changes.map((change) => `- **${change.key}**: ${change.old} -> ${change.new}`),
    ].join('\n'),
  );
}

function handleMemberRoleUpdate(
  _client: ExtendedClient,
  auditLogEntry: GuildAuditLogsEntry<AuditLogEvent.MemberRoleUpdate, 'Update', 'User'>,
  guild: Guild,
) {
  const changes = auditLogEntry.changes; // Array of changes made
  const executor = auditLogEntry.executor; // User who made the change
  const target = auditLogEntry.target; // User
  const reason = auditLogEntry.reason; // Reason for the change, if provided

  return logger.info(
    [
      `Member roles updated: ${target?.tag} (${target?.id}) in Guild: ${guild.name} (${guild.id})`,
      executor ? `By: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
      '',
      `Changes:`,
      ...changes.map((change) => `- **${change.key}**: ${change.old} -> ${change.new}`),
    ].join('\n'),
  );
}

function handleMemberMove(
  _client: ExtendedClient,
  auditLogEntry: GuildAuditLogsEntry<AuditLogEvent.MemberMove, 'Update', 'User'>,
  guild: Guild,
) {
  const changes = auditLogEntry.changes; // Array of changes made
  const executor = auditLogEntry.executor; // User who made the change
  const target = auditLogEntry.target; // User
  const reason = auditLogEntry.reason; // Reason for the change, if provided

  return logger.info(
    [
      `Member moved: ${target?.tag} (${target?.id}) in Guild: ${guild.name} (${guild.id})`,
      executor ? `By: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
      '',
      `Changes:`,
      ...changes.map((change) => `- **${change.key}**: ${change.old} -> ${change.new}`),
    ].join('\n'),
  );
}

function handleMemberDisconnect(
  _client: ExtendedClient,
  auditLogEntry: GuildAuditLogsEntry<AuditLogEvent.MemberDisconnect, 'Delete', 'User'>,
  guild: Guild,
) {
  const target = auditLogEntry.target; // User who was disconnected
  const executor = auditLogEntry.executor; // User who performed the disconnect
  const reason = auditLogEntry.reason; // Reason for the disconnect, if provided

  return logger.info(
    [
      `Member disconnected: ${target?.tag} (${target?.id}) from Guild: ${guild.name} (${guild.id})`,
      executor ? `By: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
    ].join('\n'),
  );
}

function handleBotAdd(_client: ExtendedClient, auditLogEntry: GuildAuditLogsEntry<AuditLogEvent.BotAdd, 'Create', 'User'>, guild: Guild) {
  const target = auditLogEntry.target; // Bot user who was added
  const executor = auditLogEntry.executor; // User who added the bot
  const reason = auditLogEntry.reason; // Reason for adding the bot, if provided

  return logger.info(
    [
      `Bot added: ${target?.tag} (${target?.id}) to Guild: ${guild.name} (${guild.id})`,
      executor ? `By: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
    ].join('\n'),
  );
}

function handleRoleCreate(
  _client: ExtendedClient,
  auditLogEntry: GuildAuditLogsEntry<AuditLogEvent.RoleCreate, 'Create', 'Role'>,
  guild: Guild,
) {
  const target = auditLogEntry.target; // Role that was created
  const executor = auditLogEntry.executor; // User who created the role
  const reason = auditLogEntry.reason; // Reason for creating the role, if provided

  return logger.info(
    [
      `Role created: ${'name' in target ? `${target.name} (${target.id})` : roleMention(target.id)} in Guild: ${guild.name} (${guild.id})`,
      executor ? `By: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
    ].join('\n'),
  );
}

function handleRoleUpdate(
  _client: ExtendedClient,
  auditLogEntry: GuildAuditLogsEntry<AuditLogEvent.RoleUpdate, 'Update', 'Role'>,
  guild: Guild,
) {
  const changes = auditLogEntry.changes; // Array of changes made
  const executor = auditLogEntry.executor; // User who made the change
  const target = auditLogEntry.target; // Role
  const reason = auditLogEntry.reason; // Reason for the change, if provided

  return logger.info(
    [
      `Role updated: ${'name' in target ? `${target.name} (${target.id})` : roleMention(target.id)} in Guild: ${guild.name} (${guild.id})`,
      executor ? `By: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
      '',
      `Changes:`,
      ...changes.map((change) => `- **${change.key}**: ${change.old} -> ${change.new}`),
    ].join('\n'),
  );
}

function handleRoleDelete(
  _client: ExtendedClient,
  auditLogEntry: GuildAuditLogsEntry<AuditLogEvent.RoleDelete, 'Delete', 'Role'>,
  guild: Guild,
) {
  const target = auditLogEntry.target; // Role that was deleted
  const executor = auditLogEntry.executor; // User who deleted the role
  const reason = auditLogEntry.reason; // Reason for deleting the role, if provided

  return logger.info(
    [
      `Role deleted: ${'name' in target ? `${target.name} (${target.id})` : roleMention(target.id)} from Guild: ${guild.name} (${guild.id})`,
      executor ? `By: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
    ].join('\n'),
  );
}

function handleInviteCreate(
  _client: ExtendedClient,
  auditLogEntry: GuildAuditLogsEntry<AuditLogEvent.InviteCreate, 'Create', 'Invite'>,
  guild: Guild,
) {
  const target = auditLogEntry.target; // Invite that was created
  const executor = auditLogEntry.executor; // User who created the invite
  const reason = auditLogEntry.reason; // Reason for creating the invite, if provided

  return logger.info(
    [
      `Invite created: ${target.code} to Guild: ${guild.name} (${guild.id})`,
      executor ? `By: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
    ].join('\n'),
  );
}

function handleInviteUpdate(
  _client: ExtendedClient,
  auditLogEntry: GuildAuditLogsEntry<AuditLogEvent.InviteUpdate, 'Update', 'Invite'>,
  guild: Guild,
) {
  const changes = auditLogEntry.changes; // Array of changes made
  const executor = auditLogEntry.executor; // User who made the change
  const target = auditLogEntry.target; // Invite
  const reason = auditLogEntry.reason; // Reason for the change, if provided

  return logger.info(
    [
      `Invite updated: ${target.code} in Guild: ${guild.name} (${guild.id})`,
      executor ? `By: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
      '',
      `Changes:`,
      ...changes.map((change) => `- **${change.key}**: ${change.old} -> ${change.new}`),
    ].join('\n'),
  );
}

function handleInviteDelete(
  _client: ExtendedClient,
  auditLogEntry: GuildAuditLogsEntry<AuditLogEvent.InviteDelete, 'Delete', 'Invite'>,
  guild: Guild,
) {
  const target = auditLogEntry.target; // Invite that was deleted
  const executor = auditLogEntry.executor; // User who deleted the invite
  const reason = auditLogEntry.reason; // Reason for deleting the invite, if provided

  return logger.info(
    [
      `Invite deleted: ${target.code} from Guild: ${guild.name} (${guild.id})`,
      executor ? `By: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
    ].join('\n'),
  );
}

function handleWebhookCreate(
  _client: ExtendedClient,
  auditLogEntry: GuildAuditLogsEntry<AuditLogEvent.WebhookCreate, 'Create', 'Webhook'>,
  guild: Guild,
) {
  const target = auditLogEntry.target; // Webhook that was created
  const executor = auditLogEntry.executor; // User who created the webhook
  const reason = auditLogEntry.reason; // Reason for creating the webhook, if provided

  return logger.info(
    [
      `Webhook created: ${target.name} (${target.id}) in Guild: ${guild.name} (${guild.id})`,
      executor ? `By: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
    ].join('\n'),
  );
}

function handleWebhookUpdate(
  _client: ExtendedClient,
  auditLogEntry: GuildAuditLogsEntry<AuditLogEvent.WebhookUpdate, 'Update', 'Webhook'>,
  guild: Guild,
) {
  const changes = auditLogEntry.changes; // Array of changes made
  const executor = auditLogEntry.executor; // User who made the change
  const target = auditLogEntry.target; // Webhook
  const reason = auditLogEntry.reason; // Reason for the change, if provided

  return logger.info(
    [
      `Webhook updated: ${target.name} (${target.id}) in Guild: ${guild.name} (${guild.id})`,
      executor ? `By: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
      '',
      `Changes:`,
      ...changes.map((change) => `- **${change.key}**: ${change.old} -> ${change.new}`),
    ].join('\n'),
  );
}

function handleWebhookDelete(
  _client: ExtendedClient,
  auditLogEntry: GuildAuditLogsEntry<AuditLogEvent.WebhookDelete, 'Delete', 'Webhook'>,
  guild: Guild,
) {
  const target = auditLogEntry.target; // Webhook that was deleted
  const executor = auditLogEntry.executor; // User who deleted the webhook
  const reason = auditLogEntry.reason; // Reason for deleting the webhook, if provided

  return logger.info(
    [
      `Webhook deleted: ${target.name} (${target.id}) from Guild: ${guild.name} (${guild.id})`,
      executor ? `By: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
    ].join('\n'),
  );
}

function handleEmojiCreate(
  _client: ExtendedClient,
  auditLogEntry: GuildAuditLogsEntry<AuditLogEvent.EmojiCreate, 'Create', 'Emoji'>,
  guild: Guild,
) {
  const target = auditLogEntry.target; // Emoji that was created
  const executor = auditLogEntry.executor; // User who created the emoji
  const reason = auditLogEntry.reason; // Reason for creating the emoji, if provided

  return logger.info(
    [
      `Emoji created: ${'name' in target ? `${target.name} (${target.id})` : target.id} in Guild: ${guild.name} (${guild.id})`,
      executor ? `By: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
    ].join('\n'),
  );
}

function handleEmojiUpdate(
  _client: ExtendedClient,
  auditLogEntry: GuildAuditLogsEntry<AuditLogEvent.EmojiUpdate, 'Update', 'Emoji'>,
  guild: Guild,
) {
  const changes = auditLogEntry.changes; // Array of changes made
  const executor = auditLogEntry.executor; // User who made the change
  const target = auditLogEntry.target; // Emoji
  const reason = auditLogEntry.reason; // Reason for the change, if provided

  return logger.info(
    [
      `Emoji updated: ${'name' in target ? `${target.name} (${target.id})` : target.id} in Guild: ${guild.name} (${guild.id})`,
      executor ? `By: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
      '',
      `Changes:`,
      ...changes.map((change) => `- **${change.key}**: ${change.old} -> ${change.new}`),
    ].join('\n'),
  );
}

function handleEmojiDelete(
  _client: ExtendedClient,
  auditLogEntry: GuildAuditLogsEntry<AuditLogEvent.EmojiDelete, 'Delete', 'Emoji'>,
  guild: Guild,
) {
  const target = auditLogEntry.target; // Emoji that was deleted
  const executor = auditLogEntry.executor; // User who deleted the emoji
  const reason = auditLogEntry.reason; // Reason for deleting the emoji, if provided

  return logger.info(
    [
      `Emoji deleted: ${'name' in target ? `${target.name} (${target.id})` : target.id} from Guild: ${guild.name} (${guild.id})`,
      executor ? `By: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
    ].join('\n'),
  );
}

function handleMessageDelete(
  _client: ExtendedClient,
  auditLogEntry: GuildAuditLogsEntry<AuditLogEvent.MessageDelete, 'Delete', 'Message'>,
  guild: Guild,
) {
  const target = auditLogEntry.target; // The author of the deleted message
  const executor = auditLogEntry.executor; // User who deleted the message
  const reason = auditLogEntry.reason; // Reason for deleting the message, if provided

  return logger.info(
    [
      `Message sent by ${target ? target.username : 'Unknown'} deleted in Guild: ${guild.name} (${guild.id})`,
      executor ? `Deleted by: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
    ].join('\n'),
  );
}

function handleMessageBulkDelete(
  _client: ExtendedClient,
  auditLogEntry: GuildAuditLogsEntry<AuditLogEvent.MessageBulkDelete, 'Delete', 'Message'>,
  guild: Guild,
) {
  const executor = auditLogEntry.executor; // User who deleted the messages
  const reason = auditLogEntry.reason; // Reason for deleting the messages, if provided

  return logger.info(
    [
      `Bulk message delete in Guild: ${guild.name} (${guild.id})`,
      executor ? `Deleted by: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
    ].join('\n'),
  );
}

function handleMessagePin(
  _client: ExtendedClient,
  auditLogEntry: GuildAuditLogsEntry<AuditLogEvent.MessagePin, 'Create', 'Message'>,
  guild: Guild,
) {
  const target = auditLogEntry.target; // The author of the pinned message
  const executor = auditLogEntry.executor; // User who pinned the message
  const reason = auditLogEntry.reason; // Reason for pinning the message, if provided

  return logger.info(
    [
      `Message sent by ${target ? target.username : 'Unknown'} pinned in Guild: ${guild.name} (${guild.id})`,
      executor ? `Pinned by: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
    ].join('\n'),
  );
}

function handleMessageUnpin(
  _client: ExtendedClient,
  auditLogEntry: GuildAuditLogsEntry<AuditLogEvent.MessageUnpin, 'Delete', 'Message'>,
  guild: Guild,
) {
  const target = auditLogEntry.target; // The author of the unpinned message
  const executor = auditLogEntry.executor; // User who unpinned the message
  const reason = auditLogEntry.reason; // Reason for unpinning the message, if provided

  return logger.info(
    [
      `Message sent by ${target ? target.username : 'Unknown'} unpinned in Guild: ${guild.name} (${guild.id})`,
      executor ? `Unpinned by: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
    ].join('\n'),
  );
}

function handleIntegrationCreate(
  _client: ExtendedClient,
  auditLogEntry: GuildAuditLogsEntry<AuditLogEvent.IntegrationCreate, 'Create', 'Integration'>,
  guild: Guild,
) {
  const target = auditLogEntry.target; // Integration that was created
  const executor = auditLogEntry.executor; // User who created the integration
  const reason = auditLogEntry.reason; // Reason for creating the integration, if provided

  return logger.info(
    [
      `Integration created: ${target.name} (${target.id}) in Guild: ${guild.name} (${guild.id})`,
      executor ? `By: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
    ].join('\n'),
  );
}

function handleIntegrationUpdate(
  _client: ExtendedClient,
  auditLogEntry: GuildAuditLogsEntry<AuditLogEvent.IntegrationUpdate, 'Update', 'Integration'>,
  guild: Guild,
) {
  const changes = auditLogEntry.changes; // Array of changes made
  const executor = auditLogEntry.executor; // User who made the change
  const target = auditLogEntry.target; // Integration
  const reason = auditLogEntry.reason; // Reason for the change, if provided

  return logger.info(
    [
      `Integration updated: ${target.name} (${target.id}) in Guild: ${guild.name} (${guild.id})`,
      executor ? `By: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
      '',
      `Changes:`,
      ...changes.map((change) => `- **${change.key}**: ${change.old} -> ${change.new}`),
    ].join('\n'),
  );
}

function handleIntegrationDelete(
  _client: ExtendedClient,
  auditLogEntry: GuildAuditLogsEntry<AuditLogEvent.IntegrationDelete, 'Delete', 'Integration'>,
  guild: Guild,
) {
  const target = auditLogEntry.target; // Integration that was deleted
  const executor = auditLogEntry.executor; // User who deleted the integration
  const reason = auditLogEntry.reason; // Reason for deleting the integration, if provided

  return logger.info(
    [
      `Integration deleted: ${target.name} (${target.id}) from Guild: ${guild.name} (${guild.id})`,
      executor ? `By: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
    ].join('\n'),
  );
}

function handleStageInstanceCreate(
  _client: ExtendedClient,
  auditLogEntry: GuildAuditLogsEntry<AuditLogEvent.StageInstanceCreate, 'Create', 'StageInstance'>,
  guild: Guild,
) {
  const target = auditLogEntry.target; // Stage instance that was created
  const executor = auditLogEntry.executor; // User who created the stage instance
  const reason = auditLogEntry.reason; // Reason for creating the stage instance, if provided

  return logger.info(
    [
      `Stage instance created: ${target.topic} (${target.id}) in Guild: ${guild.name} (${guild.id})`,
      executor ? `By: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
    ].join('\n'),
  );
}

function handleStageInstanceUpdate(
  _client: ExtendedClient,
  auditLogEntry: GuildAuditLogsEntry<AuditLogEvent.StageInstanceUpdate, 'Update', 'StageInstance'>,
  guild: Guild,
) {
  const changes = auditLogEntry.changes; // Array of changes made
  const executor = auditLogEntry.executor; // User who made the change
  const target = auditLogEntry.target; // Stage instance
  const reason = auditLogEntry.reason; // Reason for the change, if provided

  return logger.info(
    [
      `Stage instance updated: ${target.topic} (${target.id}) in Guild: ${guild.name} (${guild.id})`,
      executor ? `By: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
      '',
      `Changes:`,
      ...changes.map((change) => `- **${change.key}**: ${change.old} -> ${change.new}`),
    ].join('\n'),
  );
}

function handleStageInstanceDelete(
  _client: ExtendedClient,
  auditLogEntry: GuildAuditLogsEntry<AuditLogEvent.StageInstanceDelete, 'Delete', 'StageInstance'>,
  guild: Guild,
) {
  const target = auditLogEntry.target; // Stage instance that was deleted
  const executor = auditLogEntry.executor; // User who deleted the stage instance
  const reason = auditLogEntry.reason; // Reason for deleting the stage instance, if provided

  return logger.info(
    [
      `Stage instance deleted: ${target.topic} (${target.id}) from Guild: ${guild.name} (${guild.id})`,
      executor ? `By: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
    ].join('\n'),
  );
}

function handleStickerCreate(
  _client: ExtendedClient,
  auditLogEntry: GuildAuditLogsEntry<AuditLogEvent.StickerCreate, 'Create', 'Sticker'>,
  guild: Guild,
) {
  const target = auditLogEntry.target; // Sticker that was created
  const executor = auditLogEntry.executor; // User who created the sticker
  const reason = auditLogEntry.reason; // Reason for creating the sticker, if provided

  return logger.info(
    [
      `Sticker created: ${target.name} (${target.id}) in Guild: ${guild.name} (${guild.id})`,
      executor ? `By: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
    ].join('\n'),
  );
}

function handleStickerUpdate(
  _client: ExtendedClient,
  auditLogEntry: GuildAuditLogsEntry<AuditLogEvent.StickerUpdate, 'Update', 'Sticker'>,
  guild: Guild,
) {
  const changes = auditLogEntry.changes; // Array of changes made
  const executor = auditLogEntry.executor; // User who made the change
  const target = auditLogEntry.target; // Sticker
  const reason = auditLogEntry.reason; // Reason for the change, if provided

  return logger.info(
    [
      `Sticker updated: ${target.name} (${target.id}) in Guild: ${guild.name} (${guild.id})`,
      executor ? `By: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
      '',
      `Changes:`,
      ...changes.map((change) => `- **${change.key}**: ${change.old} -> ${change.new}`),
    ].join('\n'),
  );
}

function handleStickerDelete(
  _client: ExtendedClient,
  auditLogEntry: GuildAuditLogsEntry<AuditLogEvent.StickerDelete, 'Delete', 'Sticker'>,
  guild: Guild,
) {
  const target = auditLogEntry.target; // Sticker that was deleted
  const executor = auditLogEntry.executor; // User who deleted the sticker
  const reason = auditLogEntry.reason; // Reason for deleting the sticker, if provided

  return logger.info(
    [
      `Sticker deleted: ${target.name} (${target.id}) from Guild: ${guild.name} (${guild.id})`,
      executor ? `By: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
    ].join('\n'),
  );
}

function handleGuildScheduledEventCreate(
  _client: ExtendedClient,
  auditLogEntry: GuildAuditLogsEntry<AuditLogEvent.GuildScheduledEventCreate, 'Create', 'GuildScheduledEvent'>,
  guild: Guild,
) {
  const target = auditLogEntry.target; // Scheduled event that was created
  const executor = auditLogEntry.executor; // User who created the scheduled event
  const reason = auditLogEntry.reason; // Reason for creating the scheduled event, if provided

  return logger.info(
    [
      `Scheduled event created: ${target.name} (${target.id}) in Guild: ${guild.name} (${guild.id})`,
      executor ? `By: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
    ].join('\n'),
  );
}

function handleGuildScheduledEventUpdate(
  _client: ExtendedClient,
  auditLogEntry: GuildAuditLogsEntry<AuditLogEvent.GuildScheduledEventUpdate, 'Update', 'GuildScheduledEvent'>,
  guild: Guild,
) {
  const changes = auditLogEntry.changes; // Array of changes made
  const executor = auditLogEntry.executor; // User who made the change
  const target = auditLogEntry.target; // Scheduled event
  const reason = auditLogEntry.reason; // Reason for the change, if provided

  return logger.info(
    [
      `Scheduled event updated: ${target.name} (${target.id}) in Guild: ${guild.name} (${guild.id})`,
      executor ? `By: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
      '',
      `Changes:`,
      ...changes.map((change) => `- **${change.key}**: ${change.old} -> ${change.new}`),
    ].join('\n'),
  );
}

function handleGuildScheduledEventDelete(
  _client: ExtendedClient,
  auditLogEntry: GuildAuditLogsEntry<AuditLogEvent.GuildScheduledEventDelete, 'Delete', 'GuildScheduledEvent'>,
  guild: Guild,
) {
  const target = auditLogEntry.target; // Scheduled event that was deleted
  const executor = auditLogEntry.executor; // User who deleted the scheduled event
  const reason = auditLogEntry.reason; // Reason for deleting the scheduled event, if provided

  return logger.info(
    [
      `Scheduled event deleted: ${target.name} (${target.id}) from Guild: ${guild.name} (${guild.id})`,
      executor ? `By: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
    ].join('\n'),
  );
}

function handleThreadCreate(
  _client: ExtendedClient,
  auditLogEntry: GuildAuditLogsEntry<AuditLogEvent.ThreadCreate, 'Create', 'Thread'>,
  guild: Guild,
) {
  const target = auditLogEntry.target; // Thread that was created
  const executor = auditLogEntry.executor; // User who created the thread
  const reason = auditLogEntry.reason; // Reason for creating the thread, if provided

  return logger.info(
    [
      `Thread created: ${target.name} (${target.id}) in Guild: ${guild.name} (${guild.id})`,
      executor ? `By: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
    ].join('\n'),
  );
}

function handleThreadUpdate(
  _client: ExtendedClient,
  auditLogEntry: GuildAuditLogsEntry<AuditLogEvent.ThreadUpdate, 'Update', 'Thread'>,
  guild: Guild,
) {
  const changes = auditLogEntry.changes; // Array of changes made
  const executor = auditLogEntry.executor; // User who made the change
  const target = auditLogEntry.target; // Thread
  const reason = auditLogEntry.reason; // Reason for the change, if provided

  return logger.info(
    [
      `Thread updated: ${target.name} (${target.id}) in Guild: ${guild.name} (${guild.id})`,
      executor ? `By: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
      '',
      `Changes:`,
      ...changes.map((change) => `- **${change.key}**: ${change.old} -> ${change.new}`),
    ].join('\n'),
  );
}

function handleThreadDelete(
  _client: ExtendedClient,
  auditLogEntry: GuildAuditLogsEntry<AuditLogEvent.ThreadDelete, 'Delete', 'Thread'>,
  guild: Guild,
) {
  const target = auditLogEntry.target; // Thread that was deleted
  const executor = auditLogEntry.executor; // User who deleted the thread
  const reason = auditLogEntry.reason; // Reason for deleting the thread, if provided

  return logger.info(
    [
      `Thread deleted: ${target.name} (${target.id}) from Guild: ${guild.name} (${guild.id})`,
      executor ? `By: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
    ].join('\n'),
  );
}

function handleApplicationCommandPermissionUpdate(
  _client: ExtendedClient,
  auditLogEntry: GuildAuditLogsEntry<AuditLogEvent.ApplicationCommandPermissionUpdate, 'Update', 'ApplicationCommand'>,
  guild: Guild,
) {
  const changes = auditLogEntry.changes; // Array of changes made
  const executor = auditLogEntry.executor; // User who made the change
  const target = auditLogEntry.target; // Application Command
  const reason = auditLogEntry.reason; // Reason for the change, if provided
  const extra = auditLogEntry.extra; // Additional info

  return logger.info(
    [
      `Application Command permissions updated: ${chatInputApplicationCommandMention(target.id, 'unknown')} in Guild: ${guild.name} (${guild.id})`,
      executor ? `By: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
      extra ? JSON.stringify(extra, null, 2) : '',
      '',
      `Changes:`,
      ...changes.map((change) => `- **${change.key}**: ${change.old} -> ${change.new}`),
    ].join('\n'),
  );
}

function handleSoundboardSoundCreate(
  _client: ExtendedClient,
  auditLogEntry: GuildAuditLogsEntry<AuditLogEvent.SoundboardSoundCreate, 'Create', 'SoundboardSound'>,
  guild: Guild,
) {
  const target = auditLogEntry.target; // Soundboard sound that was created
  const executor = auditLogEntry.executor; // User who created the soundboard sound
  const reason = auditLogEntry.reason; // Reason for creating the soundboard sound, if provided

  return logger.info(
    [
      `Soundboard sound created: ${'name' in target ? `${target.name} (${target.soundId})` : target.id} in Guild: ${guild.name} (${guild.id})`,
      executor ? `By: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
    ].join('\n'),
  );
}

function handleSoundboardSoundUpdate(
  _client: ExtendedClient,
  auditLogEntry: GuildAuditLogsEntry<AuditLogEvent.SoundboardSoundUpdate, 'Update', 'SoundboardSound'>,
  guild: Guild,
) {
  const changes = auditLogEntry.changes; // Array of changes made
  const executor = auditLogEntry.executor; // User who made the change
  const target = auditLogEntry.target; // Soundboard sound
  const reason = auditLogEntry.reason; // Reason for the change, if provided

  return logger.info(
    [
      `Soundboard sound updated: ${'name' in target ? `${target.name} (${target.soundId})` : target.id} in Guild: ${guild.name} (${guild.id})`,
      executor ? `By: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
      '',
      `Changes:`,
      ...changes.map((change) => `- **${change.key}**: ${change.old} -> ${change.new}`),
    ].join('\n'),
  );
}

function handleSoundboardSoundDelete(
  _client: ExtendedClient,
  auditLogEntry: GuildAuditLogsEntry<AuditLogEvent.SoundboardSoundDelete, 'Delete', 'SoundboardSound'>,
  guild: Guild,
) {
  const target = auditLogEntry.target; // Soundboard sound that was deleted
  const executor = auditLogEntry.executor; // User who deleted the soundboard sound
  const reason = auditLogEntry.reason; // Reason for deleting the soundboard sound, if provided

  return logger.info(
    [
      `Soundboard sound deleted: ${'name' in target ? `${target.name} (${target.soundId})` : target.id} from Guild: ${guild.name} (${guild.id})`,
      executor ? `By: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
    ].join('\n'),
  );
}

function handleAutoModerationRuleCreate(
  _client: ExtendedClient,
  auditLogEntry: GuildAuditLogsEntry<AuditLogEvent.AutoModerationRuleCreate, 'Create', 'AutoModeration'>,
  guild: Guild,
) {
  const target = auditLogEntry.target; // Auto moderation rule that was created
  const executor = auditLogEntry.executor; // User who created the auto moderation rule
  const reason = auditLogEntry.reason; // Reason for creating the auto moderation rule, if provided

  return logger.info(
    [
      `Auto moderation rule created: ${target.name} (${target.id}) in Guild: ${guild.name} (${guild.id})`,
      executor ? `By: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
    ].join('\n'),
  );
}

function handleAutoModerationRuleUpdate(
  _client: ExtendedClient,
  auditLogEntry: GuildAuditLogsEntry<AuditLogEvent.AutoModerationRuleUpdate, 'Update', 'AutoModeration'>,
  guild: Guild,
) {
  const changes = auditLogEntry.changes; // Array of changes made
  const executor = auditLogEntry.executor; // User who made the change
  const target = auditLogEntry.target; // Auto moderation rule
  const reason = auditLogEntry.reason; // Reason for the change, if provided

  return logger.info(
    [
      `Auto moderation rule updated: ${target.name} (${target.id}) in Guild: ${guild.name} (${guild.id})`,
      executor ? `By: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
      '',
      `Changes:`,
      ...changes.map((change) => `- **${change.key}**: ${change.old} -> ${change.new}`),
    ].join('\n'),
  );
}

function handleAutoModerationRuleDelete(
  _client: ExtendedClient,
  auditLogEntry: GuildAuditLogsEntry<AuditLogEvent.AutoModerationRuleDelete, 'Delete', 'AutoModeration'>,
  guild: Guild,
) {
  const target = auditLogEntry.target; // Auto moderation rule that was deleted
  const executor = auditLogEntry.executor; // User who deleted the auto moderation rule
  const reason = auditLogEntry.reason; // Reason for deleting the auto moderation rule, if provided

  return logger.info(
    [
      `Auto moderation rule deleted: ${target.name} (${target.id}) from Guild: ${guild.name} (${guild.id})`,
      executor ? `By: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
    ].join('\n'),
  );
}

function handleAutoModerationUserCommunicationDisabled(
  _client: ExtendedClient,
  auditLogEntry: GuildAuditLogsEntry<AuditLogEvent.AutoModerationUserCommunicationDisabled, 'Update', 'User'>,
  guild: Guild,
) {
  const changes = auditLogEntry.changes; // Array of changes made
  const executor = auditLogEntry.executor; // User who made the change
  const target = auditLogEntry.target; // User
  const reason = auditLogEntry.reason; // Reason for the change, if provided

  return logger.info(
    [
      `Auto moderation user communication disabled: ${target?.username} (${target?.id}) in Guild: ${guild.name} (${guild.id})`,
      executor ? `By: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
      '',
      `Changes:`,
      ...changes.map((change) => `- **${change.key}**: ${change.old} -> ${change.new}`),
    ].join('\n'),
  );
}

function handleAutoModerationQuarantineUser(
  _client: ExtendedClient,
  auditLogEntry: GuildAuditLogsEntry<AuditLogEvent.AutoModerationQuarantineUser, 'All', 'Unknown'>,
  guild: Guild,
) {
  const target = auditLogEntry.target; // User who was quarantined
  const executor = auditLogEntry.executor; // User who quarantined the user
  const reason = auditLogEntry.reason; // Reason for quarantining the user, if provided

  return logger.info(
    [
      `User quarantined by auto moderation: ${target?.username} (${target?.id}) in Guild: ${guild.name} (${guild.id})`,
      executor ? `By: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
    ].join('\n'),
  );
}

function handleCreatorMonetizationRequestCreated(
  _client: ExtendedClient,
  auditLogEntry: GuildAuditLogsEntry<AuditLogEvent.CreatorMonetizationRequestCreated, 'All', 'Unknown'>,
  guild: Guild,
) {
  const target = auditLogEntry.target; // User who created the monetization request
  const executor = auditLogEntry.executor; // User who processed the monetization request
  const reason = auditLogEntry.reason; // Reason for creating the monetization request, if provided

  return logger.info(
    [
      `Creator monetization request created by: ${target?.username} (${target?.id}) in Guild: ${guild.name} (${guild.id})`,
      executor ? `Processed by: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
    ].join('\n'),
  );
}

function handleCreatorMonetizationTermsAccepted(
  _client: ExtendedClient,
  auditLogEntry: GuildAuditLogsEntry<AuditLogEvent.CreatorMonetizationTermsAccepted, 'All', 'Unknown'>,
  guild: Guild,
) {
  const target = auditLogEntry.target; // User who accepted the terms
  const executor = auditLogEntry.executor; // User who processed the acceptance
  const reason = auditLogEntry.reason; // Reason for accepting the terms, if provided

  return logger.info(
    [
      `Creator monetization terms accepted by: ${target?.username} (${target?.id}) in Guild: ${guild.name} (${guild.id})`,
      executor ? `Processed by: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
    ].join('\n'),
  );
}

function handleOnboardingPromptCreate(
  _client: ExtendedClient,
  auditLogEntry: GuildAuditLogsEntry<AuditLogEvent.OnboardingPromptCreate, 'Create', 'GuildOnboardingPrompt'>,
  guild: Guild,
) {
  const target = auditLogEntry.target; // Onboarding prompt that was created
  const executor = auditLogEntry.executor; // User who created the onboarding prompt
  const reason = auditLogEntry.reason; // Reason for creating the onboarding prompt, if provided

  return logger.info(
    [
      `Onboarding prompt created: ${target.id} in Guild: ${guild.name} (${guild.id})`,
      executor ? `By: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
    ].join('\n'),
  );
}

function handleOnboardingPromptUpdate(
  _client: ExtendedClient,
  auditLogEntry: GuildAuditLogsEntry<AuditLogEvent.OnboardingPromptUpdate, 'Update', 'GuildOnboardingPrompt'>,
  guild: Guild,
) {
  const changes = auditLogEntry.changes; // Array of changes made
  const executor = auditLogEntry.executor; // User who made the change
  const target = auditLogEntry.target; // Onboarding prompt
  const reason = auditLogEntry.reason; // Reason for the change, if provided

  return logger.info(
    [
      `Onboarding prompt updated: ${target.id} in Guild: ${guild.name} (${guild.id})`,
      executor ? `By: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
      '',
      `Changes:`,
      ...changes.map((change) => `- **${change.key}**: ${change.old} -> ${change.new}`),
    ].join('\n'),
  );
}

function handleOnboardingPromptDelete(
  _client: ExtendedClient,
  auditLogEntry: GuildAuditLogsEntry<AuditLogEvent.OnboardingPromptDelete, 'Delete', 'GuildOnboardingPrompt'>,
  guild: Guild,
) {
  const target = auditLogEntry.target; // Onboarding prompt that was deleted
  const executor = auditLogEntry.executor; // User who deleted the onboarding prompt
  const reason = auditLogEntry.reason; // Reason for deleting the onboarding prompt, if provided

  return logger.info(
    [
      `Onboarding prompt deleted: ${target.id} from Guild: ${guild.name} (${guild.id})`,
      executor ? `By: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
    ].join('\n'),
  );
}

function handleOnboardingCreate(
  _client: ExtendedClient,
  auditLogEntry: GuildAuditLogsEntry<AuditLogEvent.OnboardingCreate, 'All', 'Unknown'>,
  guild: Guild,
) {
  const target = auditLogEntry.target; // User who created the onboarding
  const executor = auditLogEntry.executor; // User who processed the onboarding creation
  const reason = auditLogEntry.reason; // Reason for creating the onboarding, if provided

  return logger.info(
    [
      `Onboarding created by: ${target?.username} (${target?.id}) in Guild: ${guild.name} (${guild.id})`,
      executor ? `Processed by: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
    ].join('\n'),
  );
}

function handleOnboardingUpdate(
  _client: ExtendedClient,
  auditLogEntry: GuildAuditLogsEntry<AuditLogEvent.OnboardingUpdate, 'All', 'Unknown'>,
  guild: Guild,
) {
  const changes = auditLogEntry.changes; // Array of changes made
  const executor = auditLogEntry.executor; // User who made the change
  const target = auditLogEntry.target; // User
  const reason = auditLogEntry.reason; // Reason for the change, if provided

  return logger.info(
    [
      `Onboarding updated for: ${target?.username} (${target?.id}) in Guild: ${guild.name} (${guild.id})`,
      executor ? `By: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
      '',
      `Changes:`,
      ...changes.map((change) => `- **${change.key}**: ${change.old} -> ${change.new}`),
    ].join('\n'),
  );
}

function handleHomeSettingsCreate(
  _client: ExtendedClient,
  auditLogEntry: GuildAuditLogsEntry<AuditLogEvent.HomeSettingsCreate, 'All', 'Unknown'>,
  guild: Guild,
) {
  const target = auditLogEntry.target; // User who created the home settings
  const executor = auditLogEntry.executor; // User who processed the home settings creation
  const reason = auditLogEntry.reason; // Reason for creating the home settings, if provided

  return logger.info(
    [
      `Home settings created by: ${target?.username} (${target?.id}) in Guild: ${guild.name} (${guild.id})`,
      executor ? `Processed by: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
    ].join('\n'),
  );
}

function handleHomeSettingsUpdate(
  _client: ExtendedClient,
  auditLogEntry: GuildAuditLogsEntry<AuditLogEvent.HomeSettingsUpdate, 'All', 'Unknown'>,
  guild: Guild,
) {
  const changes = auditLogEntry.changes; // Array of changes made
  const executor = auditLogEntry.executor; // User who made the change
  const target = auditLogEntry.target; // User
  const reason = auditLogEntry.reason; // Reason for the change, if provided

  return logger.info(
    [
      `Home settings updated for: ${target?.username} (${target?.id}) in Guild: ${guild.name} (${guild.id})`,
      executor ? `By: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
      '',
      `Changes:`,
      ...changes.map((change) => `- **${change.key}**: ${change.old} -> ${change.new}`),
    ].join('\n'),
  );
}
