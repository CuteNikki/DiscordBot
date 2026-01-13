// remove the line below when all handlers are implemented
/* eslint-disable @typescript-eslint/no-unused-vars */
import { AuditLogEvent, chatInputApplicationCommandMention, Events, Guild, GuildAuditLogsEntry, roleMention } from 'discord.js';

import type { ExtendedClient } from 'classes/base/client';
import { Event } from 'classes/base/event';

import { getGuild } from 'database/guild';

import { logger } from 'utility/logger';

export default new Event({
  name: Events.GuildAuditLogEntryCreate,
  once: false,
  async execute(client, auditLogEntry, guild) {
    // Auditlog experimenting
    logger.info({ entry: auditLogEntry.toJSON() }, `Audit log entry created: ${auditLogEntry.action} in ${guild.name} (${guild.id})`);

    // Ignore if no guild configuration is found
    const guildConfig = await getGuild(guild.id);
    if (!guildConfig) return;

    // @todo: check if logging is enabled (bonus: toggling types of audit log entries)

    const auditLogHandler = client.auditLogs.get(auditLogEntry.action);

    if (auditLogHandler) {
      return auditLogHandler.options.execute(client, auditLogEntry, guild);
    } else {
      logger.warn(auditLogEntry, `Unhandled audit log action: ${auditLogEntry.action}`);
    }

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
  },
});

function handleChannelCreate(_client: ExtendedClient, auditLogEntry: GuildAuditLogsEntry, guild: Guild) {
  const entry = auditLogEntry as GuildAuditLogsEntry<AuditLogEvent.ChannelCreate, 'Create', 'Channel'>;
  const target = entry.target; // Channel
  const executor = entry.executor; // User who created the channel
  const reason = entry.reason; // Reason for the creation, if provided

  return logger.info(
    [
      `Channel [${target.type}] created: ${target.name} (${target.id}) in Guild: ${guild.name} (${guild.id})`,
      executor ? `By: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
    ].join('\n'),
  );
}

function handleChannelUpdate(_client: ExtendedClient, auditLogEntry: GuildAuditLogsEntry, guild: Guild) {
  const entry = auditLogEntry as GuildAuditLogsEntry<AuditLogEvent.ChannelUpdate, 'Update', 'Channel'>;
  const changes = entry.changes; // Array of changes made
  const executor = entry.executor; // User who made the change
  const target = entry.target; // Channel
  const reason = entry.reason; // Reason for the change, if provided

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

function handleChannelDelete(_client: ExtendedClient, auditLogEntry: GuildAuditLogsEntry, guild: Guild) {
  const entry = auditLogEntry as GuildAuditLogsEntry<AuditLogEvent.ChannelDelete, 'Delete', 'Channel'>;
  const target = entry.target; // Channel
  const executor = entry.executor; // User who deleted the channel
  const reason = entry.reason; // Reason for the deletion, if provided

  return logger.info(
    [
      `Channel [${target.type}] deleted: ${target.name} (${target.id}) in Guild: ${guild.name} (${guild.id})`,
      executor ? `By: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
    ].join('\n'),
  );
}

function handleChannelOverwriteCreate(_client: ExtendedClient, auditLogEntry: GuildAuditLogsEntry, guild: Guild) {
  const entry = auditLogEntry as GuildAuditLogsEntry<AuditLogEvent.ChannelOverwriteCreate, 'Create', 'Channel'>;
  const target = entry.target; // Channel
  const executor = entry.executor; // User who created the overwrite
  const reason = entry.reason; // Reason for the creation, if provided
  const extra = entry.extra; // Extra information about the overwrite

  return logger.info(
    [
      `Channel overwrite created in Channel: ${target.name} (${target.id}) in Guild: ${guild.name} (${guild.id})`,
      executor ? `By: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
      extra ? `Extra Info: ${JSON.stringify(extra, null, 2)}` : '',
    ].join('\n'),
  );
}

function handleChannelOverwriteUpdate(_client: ExtendedClient, auditLogEntry: GuildAuditLogsEntry, guild: Guild) {
  const entry = auditLogEntry as GuildAuditLogsEntry<AuditLogEvent.ChannelOverwriteUpdate, 'Update', 'Channel'>;
  const changes = entry.changes; // Array of changes made
  const executor = entry.executor; // User who made the change
  const target = entry.target; // Channel
  const reason = entry.reason; // Reason for the change, if provided
  const extra = entry.extra; // Extra information about the overwrite

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

function handleChannelOverwriteDelete(_client: ExtendedClient, auditLogEntry: GuildAuditLogsEntry, guild: Guild) {
  const entry = auditLogEntry as GuildAuditLogsEntry<AuditLogEvent.ChannelOverwriteDelete, 'Delete', 'Channel'>;
  const target = entry.target; // Channel
  const executor = entry.executor; // User who deleted the overwrite
  const reason = entry.reason; // Reason for the deletion, if provided
  const extra = entry.extra; // Extra information about the overwrite

  return logger.info(
    [
      `Channel overwrite deleted in Channel: ${target.name} (${target.id}) in Guild: ${guild.name} (${guild.id})`,
      executor ? `By: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
      extra ? `Extra Info: ${JSON.stringify(extra, null, 2)}` : '',
    ].join('\n'),
  );
}

function handleMemberKick(_client: ExtendedClient, auditLogEntry: GuildAuditLogsEntry, guild: Guild) {
  const entry = auditLogEntry as GuildAuditLogsEntry<AuditLogEvent.MemberKick, 'Delete', 'User'>;
  const target = entry.target; // User who was kicked
  const executor = entry.executor; // User who performed the kick
  const reason = entry.reason; // Reason for the kick, if provided

  return logger.info(
    [
      `Member kicked: ${target?.tag} (${target?.id}) from Guild: ${guild.name} (${guild.id})`,
      executor ? `By: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
    ].join('\n'),
  );
}

function handleMemberPrune(_client: ExtendedClient, auditLogEntry: GuildAuditLogsEntry, guild: Guild) {
  const entry = auditLogEntry as GuildAuditLogsEntry<AuditLogEvent.MemberPrune, 'Delete', 'User'>;
  const target = entry.target; // User who was pruned
  const executor = entry.executor; // User who performed the prune
  const reason = entry.reason; // Reason for the prune, if provided
  const extra = entry.extra; // Extra information about the prune

  return logger.info(
    [
      `Member pruned: ${target?.tag} (${target?.id}) from Guild: ${guild.name} (${guild.id})`,
      executor ? `By: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
      extra ? `Extra Info: ${JSON.stringify(extra, null, 2)}` : '',
    ].join('\n'),
  );
}

function handleMemberBanAdd(_client: ExtendedClient, auditLogEntry: GuildAuditLogsEntry, guild: Guild) {
  const entry = auditLogEntry as GuildAuditLogsEntry<AuditLogEvent.MemberBanAdd, 'Delete', 'User'>;
  const target = entry.target; // User who was banned
  const executor = entry.executor; // User who performed the ban
  const reason = entry.reason; // Reason for the ban, if provided
  const extra = entry.extra; // Extra information about the ban

  return logger.info(
    [
      `Member banned: ${target?.tag} (${target?.id}) from Guild: ${guild.name} (${guild.id})`,
      executor ? `By: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
      extra ? `Extra Info: ${JSON.stringify(extra, null, 2)}` : '',
    ].join('\n'),
  );
}

function handleMemberBanRemove(_client: ExtendedClient, auditLogEntry: GuildAuditLogsEntry, guild: Guild) {
  const entry = auditLogEntry as GuildAuditLogsEntry<AuditLogEvent.MemberBanRemove, 'Delete', 'User'>;
  const target = entry.target; // User who was unbanned
  const executor = entry.executor; // User who performed the unban
  const reason = entry.reason; // Reason for the unban, if provided
  const extra = entry.extra; // Extra information about the unban
  return logger.info(
    [
      `Member unbanned: ${target?.tag} (${target?.id}) from Guild: ${guild.name} (${guild.id})`,
      executor ? `By: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
      extra ? `Extra Info: ${JSON.stringify(extra, null, 2)}` : '',
    ].join('\n'),
  );
}

function handleMemberUpdate(_client: ExtendedClient, auditLogEntry: GuildAuditLogsEntry, guild: Guild) {
  const entry = auditLogEntry as GuildAuditLogsEntry<AuditLogEvent.MemberUpdate, 'Update', 'User'>;
  const changes = entry.changes; // Array of changes made
  const executor = entry.executor; // User who made the change
  const target = entry.target; // User
  const reason = entry.reason; // Reason for the change, if provided

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

function handleMemberRoleUpdate(_client: ExtendedClient, auditLogEntry: GuildAuditLogsEntry, guild: Guild) {
  const entry = auditLogEntry as GuildAuditLogsEntry<AuditLogEvent.MemberRoleUpdate, 'Update', 'User'>;
  const changes = entry.changes; // Array of changes made
  const executor = entry.executor; // User who made the change
  const target = entry.target; // User
  const reason = entry.reason; // Reason for the change, if provided

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

function handleMemberMove(_client: ExtendedClient, auditLogEntry: GuildAuditLogsEntry, guild: Guild) {
  const entry = auditLogEntry as GuildAuditLogsEntry<AuditLogEvent.MemberMove, 'Update', 'User'>;
  const changes = entry.changes; // Array of changes made
  const executor = entry.executor; // User who made the change
  const target = entry.target; // User
  const reason = entry.reason; // Reason for the change, if provided

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

function handleMemberDisconnect(_client: ExtendedClient, auditLogEntry: GuildAuditLogsEntry, guild: Guild) {
  const entry = auditLogEntry as GuildAuditLogsEntry<AuditLogEvent.MemberDisconnect, 'Update', 'User'>;
  const target = entry.target; // User who was disconnected
  const executor = entry.executor; // User who performed the disconnect
  const reason = entry.reason; // Reason for the disconnect, if provided

  return logger.info(
    [
      `Member disconnected: ${target?.tag} (${target?.id}) from Guild: ${guild.name} (${guild.id})`,
      executor ? `By: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
    ].join('\n'),
  );
}

function handleBotAdd(_client: ExtendedClient, auditLogEntry: GuildAuditLogsEntry, guild: Guild) {
  const entry = auditLogEntry as GuildAuditLogsEntry<AuditLogEvent.BotAdd, 'Create', 'User'>;
  const target = entry.target; // Bot user who was added
  const executor = entry.executor; // User who added the bot
  const reason = entry.reason; // Reason for adding the bot, if provided

  return logger.info(
    [
      `Bot added: ${target?.tag} (${target?.id}) to Guild: ${guild.name} (${guild.id})`,
      executor ? `By: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
    ].join('\n'),
  );
}

function handleRoleCreate(_client: ExtendedClient, auditLogEntry: GuildAuditLogsEntry, guild: Guild) {
  const entry = auditLogEntry as GuildAuditLogsEntry<AuditLogEvent.RoleCreate, 'Create', 'Role'>;
  const target = entry.target; // Role that was created
  const executor = entry.executor; // User who created the role
  const reason = entry.reason; // Reason for creating the role, if provided

  return logger.info(
    [
      `Role created: ${'name' in target ? `${target.name} (${target.id})` : roleMention(target.id)} in Guild: ${guild.name} (${guild.id})`,
      executor ? `By: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
    ].join('\n'),
  );
}

function handleRoleUpdate(_client: ExtendedClient, auditLogEntry: GuildAuditLogsEntry, guild: Guild) {
  const entry = auditLogEntry as GuildAuditLogsEntry<AuditLogEvent.RoleUpdate, 'Update', 'Role'>;
  const changes = entry.changes; // Array of changes made
  const executor = entry.executor; // User who made the change
  const target = entry.target; // Role
  const reason = entry.reason; // Reason for the change, if provided

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

function handleRoleDelete(_client: ExtendedClient, auditLogEntry: GuildAuditLogsEntry, guild: Guild) {
  const entry = auditLogEntry as GuildAuditLogsEntry<AuditLogEvent.RoleDelete, 'Delete', 'Role'>;
  const target = entry.target; // Role that was deleted
  const executor = entry.executor; // User who deleted the role
  const reason = entry.reason; // Reason for deleting the role, if provided

  return logger.info(
    [
      `Role deleted: ${'name' in target ? `${target.name} (${target.id})` : roleMention(target.id)} from Guild: ${guild.name} (${guild.id})`,
      executor ? `By: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
    ].join('\n'),
  );
}

function handleInviteCreate(_client: ExtendedClient, auditLogEntry: GuildAuditLogsEntry, guild: Guild) {
  const entry = auditLogEntry as GuildAuditLogsEntry<AuditLogEvent.InviteCreate, 'Create', 'Invite'>;
  const target = entry.target; // Invite that was created
  const executor = entry.executor; // User who created the invite
  const reason = entry.reason; // Reason for creating the invite, if provided

  return logger.info(
    [
      `Invite created: ${target.code} to Guild: ${guild.name} (${guild.id})`,
      executor ? `By: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
    ].join('\n'),
  );
}

function handleInviteUpdate(_client: ExtendedClient, auditLogEntry: GuildAuditLogsEntry, guild: Guild) {
  const entry = auditLogEntry as GuildAuditLogsEntry<AuditLogEvent.InviteUpdate, 'Update', 'Invite'>;
  const changes = entry.changes; // Array of changes made
  const executor = entry.executor; // User who made the change
  const target = entry.target; // Invite
  const reason = entry.reason; // Reason for the change, if provided

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

function handleInviteDelete(_client: ExtendedClient, auditLogEntry: GuildAuditLogsEntry, guild: Guild) {
  const entry = auditLogEntry as GuildAuditLogsEntry<AuditLogEvent.InviteDelete, 'Delete', 'Invite'>;
  const target = entry.target; // Invite that was deleted
  const executor = entry.executor; // User who deleted the invite
  const reason = entry.reason; // Reason for deleting the invite, if provided

  return logger.info(
    [
      `Invite deleted: ${target.code} from Guild: ${guild.name} (${guild.id})`,
      executor ? `By: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
    ].join('\n'),
  );
}

function handleWebhookCreate(_client: ExtendedClient, auditLogEntry: GuildAuditLogsEntry, guild: Guild) {
  const entry = auditLogEntry as GuildAuditLogsEntry<AuditLogEvent.WebhookCreate, 'Create', 'Webhook'>;
  const target = entry.target; // Webhook that was created
  const executor = entry.executor; // User who created the webhook
  const reason = entry.reason; // Reason for creating the webhook, if provided

  return logger.info(
    [
      `Webhook created: ${target.name} (${target.id}) in Guild: ${guild.name} (${guild.id})`,
      executor ? `By: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
    ].join('\n'),
  );
}

function handleWebhookUpdate(_client: ExtendedClient, auditLogEntry: GuildAuditLogsEntry, guild: Guild) {
  const entry = auditLogEntry as GuildAuditLogsEntry<AuditLogEvent.WebhookUpdate, 'Update', 'Webhook'>;
  const changes = entry.changes; // Array of changes made
  const executor = entry.executor; // User who made the change
  const target = entry.target; // Webhook
  const reason = entry.reason; // Reason for the change, if provided

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

function handleWebhookDelete(_client: ExtendedClient, auditLogEntry: GuildAuditLogsEntry, guild: Guild) {
  const entry = auditLogEntry as GuildAuditLogsEntry<AuditLogEvent.WebhookDelete, 'Delete', 'Webhook'>;
  const target = entry.target; // Webhook that was deleted
  const executor = entry.executor; // User who deleted the webhook
  const reason = entry.reason; // Reason for deleting the webhook, if provided

  return logger.info(
    [
      `Webhook deleted: ${target.name} (${target.id}) from Guild: ${guild.name} (${guild.id})`,
      executor ? `By: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
    ].join('\n'),
  );
}

function handleEmojiCreate(_client: ExtendedClient, auditLogEntry: GuildAuditLogsEntry, guild: Guild) {
  const entry = auditLogEntry as GuildAuditLogsEntry<AuditLogEvent.EmojiCreate, 'Create', 'Emoji'>;
  const target = entry.target; // Emoji that was created
  const executor = entry.executor; // User who created the emoji
  const reason = entry.reason; // Reason for creating the emoji, if provided

  return logger.info(
    [
      `Emoji created: ${'name' in target ? `${target.name} (${target.id})` : target.id} in Guild: ${guild.name} (${guild.id})`,
      executor ? `By: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
    ].join('\n'),
  );
}

function handleEmojiUpdate(_client: ExtendedClient, auditLogEntry: GuildAuditLogsEntry, guild: Guild) {
  const entry = auditLogEntry as GuildAuditLogsEntry<AuditLogEvent.EmojiUpdate, 'Update', 'Emoji'>;
  const changes = entry.changes; // Array of changes made
  const executor = entry.executor; // User who made the change
  const target = entry.target; // Emoji
  const reason = entry.reason; // Reason for the change, if provided

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

function handleEmojiDelete(_client: ExtendedClient, auditLogEntry: GuildAuditLogsEntry, guild: Guild) {
  const entry = auditLogEntry as GuildAuditLogsEntry<AuditLogEvent.EmojiDelete, 'Delete', 'Emoji'>;
  const target = entry.target; // Emoji that was deleted
  const executor = entry.executor; // User who deleted the emoji
  const reason = entry.reason; // Reason for deleting the emoji, if provided

  return logger.info(
    [
      `Emoji deleted: ${'name' in target ? `${target.name} (${target.id})` : target.id} from Guild: ${guild.name} (${guild.id})`,
      executor ? `By: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
    ].join('\n'),
  );
}

function handleMessageDelete(_client: ExtendedClient, auditLogEntry: GuildAuditLogsEntry, guild: Guild) {
  const entry = auditLogEntry as GuildAuditLogsEntry<AuditLogEvent.MessageDelete, 'Delete', 'Message'>;
  const target = entry.target; // The author of the deleted message
  const executor = entry.executor; // User who deleted the message
  const reason = entry.reason; // Reason for deleting the message, if provided

  return logger.info(
    [
      `Message sent by ${target ? target.username : 'Unknown'} deleted in Guild: ${guild.name} (${guild.id})`,
      executor ? `Deleted by: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
    ].join('\n'),
  );
}

function handleMessageBulkDelete(_client: ExtendedClient, auditLogEntry: GuildAuditLogsEntry, guild: Guild) {
  const entry = auditLogEntry as GuildAuditLogsEntry<AuditLogEvent.MessageBulkDelete, 'Delete', 'Message'>;
  const executor = entry.executor; // User who deleted the messages
  const reason = entry.reason; // Reason for deleting the messages, if provided

  return logger.info(
    [
      `Bulk message delete in Guild: ${guild.name} (${guild.id})`,
      executor ? `Deleted by: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
    ].join('\n'),
  );
}

function handleMessagePin(_client: ExtendedClient, auditLogEntry: GuildAuditLogsEntry, guild: Guild) {
  const entry = auditLogEntry as GuildAuditLogsEntry<AuditLogEvent.MessagePin, 'Create', 'Message'>;
  const target = entry.target; // The author of the pinned message
  const executor = entry.executor; // User who pinned the message
  const reason = entry.reason; // Reason for pinning the message, if provided

  return logger.info(
    [
      `Message sent by ${target ? target.username : 'Unknown'} pinned in Guild: ${guild.name} (${guild.id})`,
      executor ? `Pinned by: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
    ].join('\n'),
  );
}

function handleMessageUnpin(_client: ExtendedClient, auditLogEntry: GuildAuditLogsEntry, guild: Guild) {
  const entry = auditLogEntry as GuildAuditLogsEntry<AuditLogEvent.MessageUnpin, 'Delete', 'Message'>;
  const target = entry.target; // The author of the unpinned message
  const executor = entry.executor; // User who unpinned the message
  const reason = entry.reason; // Reason for unpinning the message, if provided

  return logger.info(
    [
      `Message sent by ${target ? target.username : 'Unknown'} unpinned in Guild: ${guild.name} (${guild.id})`,
      executor ? `Unpinned by: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
    ].join('\n'),
  );
}

function handleIntegrationCreate(_client: ExtendedClient, auditLogEntry: GuildAuditLogsEntry, guild: Guild) {
  const entry = auditLogEntry as GuildAuditLogsEntry<AuditLogEvent.IntegrationCreate, 'Create', 'Integration'>;
  const target = entry.target; // Integration that was created
  const executor = entry.executor; // User who created the integration
  const reason = entry.reason; // Reason for creating the integration, if provided

  return logger.info(
    [
      `Integration created: ${target.name} (${target.id}) in Guild: ${guild.name} (${guild.id})`,
      executor ? `By: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
    ].join('\n'),
  );
}

function handleIntegrationUpdate(_client: ExtendedClient, auditLogEntry: GuildAuditLogsEntry, guild: Guild) {
  const entry = auditLogEntry as GuildAuditLogsEntry<AuditLogEvent.IntegrationUpdate, 'Update', 'Integration'>;
  const changes = entry.changes; // Array of changes made
  const executor = entry.executor; // User who made the change
  const target = entry.target; // Integration
  const reason = entry.reason; // Reason for the change, if provided
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

function handleIntegrationDelete(_client: ExtendedClient, auditLogEntry: GuildAuditLogsEntry, guild: Guild) {
  const entry = auditLogEntry as GuildAuditLogsEntry<AuditLogEvent.IntegrationDelete, 'Delete', 'Integration'>;
  const target = entry.target; // Integration that was deleted
  const executor = entry.executor; // User who deleted the integration
  const reason = entry.reason; // Reason for deleting the integration, if provided

  return logger.info(
    [
      `Integration deleted: ${target.name} (${target.id}) from Guild: ${guild.name} (${guild.id})`,
      executor ? `By: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
    ].join('\n'),
  );
}

function handleStageInstanceCreate(_client: ExtendedClient, auditLogEntry: GuildAuditLogsEntry, guild: Guild) {
  const entry = auditLogEntry as GuildAuditLogsEntry<AuditLogEvent.StageInstanceCreate, 'Create', 'StageInstance'>;
  const target = entry.target; // Stage instance that was created
  const executor = entry.executor; // User who created the stage instance
  const reason = entry.reason; // Reason for creating the stage instance, if provided

  return logger.info(
    [
      `Stage instance created: ${target.topic} (${target.id}) in Guild: ${guild.name} (${guild.id})`,
      executor ? `By: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
    ].join('\n'),
  );
}

function handleStageInstanceUpdate(_client: ExtendedClient, auditLogEntry: GuildAuditLogsEntry, guild: Guild) {
  const entry = auditLogEntry as GuildAuditLogsEntry<AuditLogEvent.StageInstanceUpdate, 'Update', 'StageInstance'>;
  const changes = entry.changes; // Array of changes made
  const executor = entry.executor; // User who made the change
  const target = entry.target; // Stage instance
  const reason = entry.reason; // Reason for the change, if provided

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

function handleStageInstanceDelete(_client: ExtendedClient, auditLogEntry: GuildAuditLogsEntry, guild: Guild) {
  const entry = auditLogEntry as GuildAuditLogsEntry<AuditLogEvent.StageInstanceDelete, 'Delete', 'StageInstance'>;
  const target = entry.target; // Stage instance that was deleted
  const executor = entry.executor; // User who deleted the stage instance
  const reason = entry.reason; // Reason for deleting the stage instance, if provided

  return logger.info(
    [
      `Stage instance deleted: ${target.topic} (${target.id}) from Guild: ${guild.name} (${guild.id})`,
      executor ? `By: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
    ].join('\n'),
  );
}

function handleStickerCreate(_client: ExtendedClient, auditLogEntry: GuildAuditLogsEntry, guild: Guild) {
  const entry = auditLogEntry as GuildAuditLogsEntry<AuditLogEvent.StickerCreate, 'Create', 'Sticker'>;
  const target = entry.target; // Sticker that was created
  const executor = entry.executor; // User who created the sticker
  const reason = entry.reason; // Reason for creating the sticker, if provided

  return logger.info(
    [
      `Sticker created: ${target.name} (${target.id}) in Guild: ${guild.name} (${guild.id})`,
      executor ? `By: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
    ].join('\n'),
  );
}

function handleStickerUpdate(_client: ExtendedClient, auditLogEntry: GuildAuditLogsEntry, guild: Guild) {
  const entry = auditLogEntry as GuildAuditLogsEntry<AuditLogEvent.StickerUpdate, 'Update', 'Sticker'>;
  const changes = entry.changes; // Array of changes made
  const executor = entry.executor; // User who made the change
  const target = entry.target; // Sticker
  const reason = entry.reason; // Reason for the change, if provided

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

function handleStickerDelete(_client: ExtendedClient, auditLogEntry: GuildAuditLogsEntry, guild: Guild) {
  const entry = auditLogEntry as GuildAuditLogsEntry<AuditLogEvent.StickerDelete, 'Delete', 'Sticker'>;
  const target = entry.target; // Sticker that was deleted
  const executor = entry.executor; // User who deleted the sticker
  const reason = entry.reason; // Reason for deleting the sticker, if provided

  return logger.info(
    [
      `Sticker deleted: ${target.name} (${target.id}) from Guild: ${guild.name} (${guild.id})`,
      executor ? `By: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
    ].join('\n'),
  );
}

function handleGuildScheduledEventCreate(_client: ExtendedClient, auditLogEntry: GuildAuditLogsEntry, guild: Guild) {
  const entry = auditLogEntry as GuildAuditLogsEntry<AuditLogEvent.GuildScheduledEventCreate, 'Create', 'GuildScheduledEvent'>;
  const target = entry.target; // Scheduled event that was created
  const executor = entry.executor; // User who created the scheduled event
  const reason = entry.reason; // Reason for creating the scheduled event, if provided

  return logger.info(
    [
      `Scheduled event created: ${target.name} (${target.id}) in Guild: ${guild.name} (${guild.id})`,
      executor ? `By: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
    ].join('\n'),
  );
}

function handleGuildScheduledEventUpdate(_client: ExtendedClient, auditLogEntry: GuildAuditLogsEntry, guild: Guild) {
  const entry = auditLogEntry as GuildAuditLogsEntry<AuditLogEvent.GuildScheduledEventUpdate, 'Update', 'GuildScheduledEvent'>;
  const changes = entry.changes; // Array of changes made
  const executor = entry.executor; // User who made the change
  const target = entry.target; // Scheduled event
  const reason = entry.reason; // Reason for the change, if provided

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

function handleGuildScheduledEventDelete(_client: ExtendedClient, auditLogEntry: GuildAuditLogsEntry, guild: Guild) {
  const entry = auditLogEntry as GuildAuditLogsEntry<AuditLogEvent.GuildScheduledEventDelete, 'Delete', 'GuildScheduledEvent'>;
  const target = entry.target; // Scheduled event that was deleted
  const executor = entry.executor; // User who deleted the scheduled event
  const reason = entry.reason; // Reason for deleting the scheduled event, if provided

  return logger.info(
    [
      `Scheduled event deleted: ${target.name} (${target.id}) from Guild: ${guild.name} (${guild.id})`,
      executor ? `By: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
    ].join('\n'),
  );
}

function handleThreadCreate(_client: ExtendedClient, auditLogEntry: GuildAuditLogsEntry, guild: Guild) {
  const entry = auditLogEntry as GuildAuditLogsEntry<AuditLogEvent.ThreadCreate, 'Create', 'Thread'>;
  const target = entry.target; // Thread that was created
  const executor = entry.executor; // User who created the thread
  const reason = entry.reason; // Reason for creating the thread, if provided

  return logger.info(
    [
      `Thread created: ${target.name} (${target.id}) in Guild: ${guild.name} (${guild.id})`,
      executor ? `By: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
    ].join('\n'),
  );
}

function handleThreadUpdate(_client: ExtendedClient, auditLogEntry: GuildAuditLogsEntry, guild: Guild) {
  const entry = auditLogEntry as GuildAuditLogsEntry<AuditLogEvent.ThreadUpdate, 'Update', 'Thread'>;
  const changes = entry.changes; // Array of changes made
  const executor = entry.executor; // User who made the change
  const target = entry.target; // Thread
  const reason = entry.reason; // Reason for the change, if provided

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

function handleThreadDelete(_client: ExtendedClient, auditLogEntry: GuildAuditLogsEntry, guild: Guild) {
  const entry = auditLogEntry as GuildAuditLogsEntry<AuditLogEvent.ThreadDelete, 'Delete', 'Thread'>;
  const target = entry.target; // Thread that was deleted
  const executor = entry.executor; // User who deleted the thread
  const reason = entry.reason; // Reason for deleting the thread, if provided

  return logger.info(
    [
      `Thread deleted: ${target.name} (${target.id}) from Guild: ${guild.name} (${guild.id})`,
      executor ? `By: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
    ].join('\n'),
  );
}

function handleApplicationCommandPermissionUpdate(_client: ExtendedClient, auditLogEntry: GuildAuditLogsEntry, guild: Guild) {
  const entry = auditLogEntry as GuildAuditLogsEntry<AuditLogEvent.ApplicationCommandPermissionUpdate, 'Update', 'ApplicationCommand'>;
  const changes = entry.changes; // Array of changes made
  const executor = entry.executor; // User who made the change
  const target = entry.target; // Application Command
  const reason = entry.reason; // Reason for the change, if provided
  const extra = entry.extra; // Additional info

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

function handleSoundboardSoundCreate(_client: ExtendedClient, auditLogEntry: GuildAuditLogsEntry, guild: Guild) {
  const entry = auditLogEntry as GuildAuditLogsEntry<AuditLogEvent.SoundboardSoundCreate, 'Create', 'SoundboardSound'>;
  const target = entry.target; // Soundboard sound that was created
  const executor = entry.executor; // User who created the soundboard sound
  const reason = entry.reason; // Reason for creating the soundboard sound, if provided

  return logger.info(
    [
      `Soundboard sound created: ${'name' in target ? `${target.name} (${target.soundId})` : target.id} in Guild: ${guild.name} (${guild.id})`,
      executor ? `By: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
    ].join('\n'),
  );
}

function handleSoundboardSoundUpdate(_client: ExtendedClient, auditLogEntry: GuildAuditLogsEntry, guild: Guild) {
  const entry = auditLogEntry as GuildAuditLogsEntry<AuditLogEvent.SoundboardSoundUpdate, 'Update', 'SoundboardSound'>;
  const changes = entry.changes; // Array of changes made
  const executor = entry.executor; // User who made the change
  const target = entry.target; // Soundboard sound
  const reason = entry.reason; // Reason for the change, if provided

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

function handleSoundboardSoundDelete(_client: ExtendedClient, auditLogEntry: GuildAuditLogsEntry, guild: Guild) {
  const entry = auditLogEntry as GuildAuditLogsEntry<AuditLogEvent.SoundboardSoundDelete, 'Delete', 'SoundboardSound'>;
  const target = entry.target; // Soundboard sound that was deleted
  const executor = entry.executor; // User who deleted the soundboard sound
  const reason = entry.reason; // Reason for deleting the soundboard sound, if provided

  return logger.info(
    [
      `Soundboard sound deleted: ${'name' in target ? `${target.name} (${target.soundId})` : target.id} from Guild: ${guild.name} (${guild.id})`,
      executor ? `By: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
    ].join('\n'),
  );
}

function handleAutoModerationRuleCreate(_client: ExtendedClient, auditLogEntry: GuildAuditLogsEntry, guild: Guild) {
  const entry = auditLogEntry as GuildAuditLogsEntry<AuditLogEvent.AutoModerationRuleCreate, 'Create', 'AutoModeration'>;
  const target = entry.target; // Auto moderation rule that was created
  const executor = entry.executor; // User who created the auto moderation rule
  const reason = entry.reason; // Reason for creating the auto moderation rule, if provided

  return logger.info(
    [
      `Auto moderation rule created: ${target.name} (${target.id}) in Guild: ${guild.name} (${guild.id})`,
      executor ? `By: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
    ].join('\n'),
  );
}

function handleAutoModerationRuleUpdate(_client: ExtendedClient, auditLogEntry: GuildAuditLogsEntry, guild: Guild) {
  const entry = auditLogEntry as GuildAuditLogsEntry<AuditLogEvent.AutoModerationRuleUpdate, 'Update', 'AutoModeration'>;
  const changes = entry.changes; // Array of changes made
  const executor = entry.executor; // User who made the change
  const target = entry.target; // Auto moderation rule
  const reason = entry.reason; // Reason for the change, if provided

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

function handleAutoModerationRuleDelete(_client: ExtendedClient, auditLogEntry: GuildAuditLogsEntry, guild: Guild) {
  const entry = auditLogEntry as GuildAuditLogsEntry<AuditLogEvent.AutoModerationRuleDelete, 'Delete', 'AutoModeration'>;
  const target = entry.target; // Auto moderation rule that was deleted
  const executor = entry.executor; // User who deleted the auto moderation rule
  const reason = entry.reason; // Reason for deleting the auto moderation rule, if provided

  return logger.info(
    [
      `Auto moderation rule deleted: ${target.name} (${target.id}) from Guild: ${guild.name} (${guild.id})`,
      executor ? `By: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
    ].join('\n'),
  );
}

function handleAutoModerationUserCommunicationDisabled(_client: ExtendedClient, auditLogEntry: GuildAuditLogsEntry, guild: Guild) {
  const entry = auditLogEntry as GuildAuditLogsEntry<AuditLogEvent.AutoModerationUserCommunicationDisabled, 'Update', 'User'>;
  const changes = entry.changes; // Array of changes made
  const executor = entry.executor; // User who made the change
  const target = entry.target; // User
  const reason = entry.reason; // Reason for the change, if provided

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

function handleAutoModerationQuarantineUser(_client: ExtendedClient, auditLogEntry: GuildAuditLogsEntry, guild: Guild) {
  const entry = auditLogEntry as GuildAuditLogsEntry<AuditLogEvent.AutoModerationQuarantineUser, 'Update', 'User'>;
  const target = entry.target; // User who was quarantined
  const executor = entry.executor; // User who quarantined the user
  const reason = entry.reason; // Reason for quarantining the user, if provided

  return logger.info(
    [
      `User quarantined by auto moderation: ${target?.username} (${target?.id}) in Guild: ${guild.name} (${guild.id})`,
      executor ? `By: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
    ].join('\n'),
  );
}

function handleCreatorMonetizationRequestCreated(_client: ExtendedClient, auditLogEntry: GuildAuditLogsEntry, guild: Guild) {
  const entry = auditLogEntry as GuildAuditLogsEntry<AuditLogEvent.CreatorMonetizationRequestCreated>;
  const target = entry.target; // User who created the monetization request
  const executor = entry.executor; // User who processed the monetization request
  const reason = entry.reason; // Reason for creating the monetization request, if provided

  return logger.info(
    [
      `Creator monetization request created by: ${target?.username} (${target?.id}) in Guild: ${guild.name} (${guild.id})`,
      executor ? `Processed by: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
    ].join('\n'),
  );
}

function handleCreatorMonetizationTermsAccepted(_client: ExtendedClient, auditLogEntry: GuildAuditLogsEntry, guild: Guild) {
  const entry = auditLogEntry as GuildAuditLogsEntry<AuditLogEvent.CreatorMonetizationTermsAccepted>;
  const target = entry.target; // User who accepted the terms
  const executor = entry.executor; // User who processed the acceptance
  const reason = entry.reason; // Reason for accepting the terms, if provided
  return logger.info(
    [
      `Creator monetization terms accepted by: ${target?.username} (${target?.id}) in Guild: ${guild.name} (${guild.id})`,
      executor ? `Processed by: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
    ].join('\n'),
  );
}

function handleOnboardingPromptCreate(_client: ExtendedClient, auditLogEntry: GuildAuditLogsEntry, guild: Guild) {
  const entry = auditLogEntry as GuildAuditLogsEntry<AuditLogEvent.OnboardingPromptCreate, 'Create', 'GuildOnboardingPrompt'>;
  const target = entry.target; // Onboarding prompt that was created
  const executor = entry.executor; // User who created the onboarding prompt
  const reason = entry.reason; // Reason for creating the onboarding prompt, if provided

  return logger.info(
    [
      `Onboarding prompt created: ${target.id} in Guild: ${guild.name} (${guild.id})`,
      executor ? `By: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
    ].join('\n'),
  );
}

function handleOnboardingPromptUpdate(_client: ExtendedClient, auditLogEntry: GuildAuditLogsEntry, guild: Guild) {
  const entry = auditLogEntry as GuildAuditLogsEntry<AuditLogEvent.OnboardingPromptUpdate, 'Update', 'GuildOnboardingPrompt'>;
  const changes = entry.changes; // Array of changes made
  const executor = entry.executor; // User who made the change
  const target = entry.target; // Onboarding prompt
  const reason = entry.reason; // Reason for the change, if provided

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

function handleOnboardingPromptDelete(_client: ExtendedClient, auditLogEntry: GuildAuditLogsEntry, guild: Guild) {
  const entry = auditLogEntry as GuildAuditLogsEntry<AuditLogEvent.OnboardingPromptDelete, 'Delete', 'GuildOnboardingPrompt'>;
  const target = entry.target; // Onboarding prompt that was deleted
  const executor = entry.executor; // User who deleted the onboarding prompt
  const reason = entry.reason; // Reason for deleting the onboarding prompt, if provided

  return logger.info(
    [
      `Onboarding prompt deleted: ${target.id} from Guild: ${guild.name} (${guild.id})`,
      executor ? `By: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
    ].join('\n'),
  );
}

function handleOnboardingCreate(_client: ExtendedClient, auditLogEntry: GuildAuditLogsEntry, guild: Guild) {
  const entry = auditLogEntry as GuildAuditLogsEntry<AuditLogEvent.OnboardingCreate>;
  const target = entry.target; // User who created the onboarding
  const executor = entry.executor; // User who processed the onboarding creation
  const reason = entry.reason; // Reason for creating the onboarding, if provided

  return logger.info(
    [
      `Onboarding created by: ${target?.username} (${target?.id}) in Guild: ${guild.name} (${guild.id})`,
      executor ? `Processed by: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
    ].join('\n'),
  );
}

function handleOnboardingUpdate(_client: ExtendedClient, auditLogEntry: GuildAuditLogsEntry, guild: Guild) {
  const entry = auditLogEntry as GuildAuditLogsEntry<AuditLogEvent.OnboardingUpdate>;
  const changes = entry.changes; // Array of changes made
  const executor = entry.executor; // User who made the change
  const target = entry.target; // User
  const reason = entry.reason; // Reason for the change, if provided

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

function handleHomeSettingsCreate(_client: ExtendedClient, auditLogEntry: GuildAuditLogsEntry, guild: Guild) {
  const entry = auditLogEntry as GuildAuditLogsEntry<AuditLogEvent.HomeSettingsCreate>;
  const target = entry.target; // User who created the home settings
  const executor = entry.executor; // User who processed the home settings creation
  const reason = entry.reason; // Reason for creating the home settings, if provided

  return logger.info(
    [
      `Home settings created by: ${target?.username} (${target?.id}) in Guild: ${guild.name} (${guild.id})`,
      executor ? `Processed by: ${executor.tag} (${executor.id})` : 'By: Unknown',
      reason ? `Reason: ${reason}` : '',
    ].join('\n'),
  );
}

function handleHomeSettingsUpdate(_client: ExtendedClient, auditLogEntry: GuildAuditLogsEntry, guild: Guild) {
  const entry = auditLogEntry as GuildAuditLogsEntry<AuditLogEvent.HomeSettingsUpdate>;
  const changes = entry.changes; // Array of changes made
  const executor = entry.executor; // User who made the change
  const target = entry.target; // User
  const reason = entry.reason; // Reason for the change, if provided

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
