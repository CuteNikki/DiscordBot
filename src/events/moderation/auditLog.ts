import { AuditLogEvent, Events } from 'discord.js';

import { Event } from 'classes/base/event';
import { logger } from 'utility/logger';

export default new Event({
  name: Events.GuildAuditLogEntryCreate,
  once: false,
  async execute(client, auditLogEntry, guild) {
    logger.info({ entry: auditLogEntry.toJSON() }, `Audit log entry created: ${auditLogEntry.action} in ${guild.name} (${guild.id})`);

    if (auditLogEntry.isAction(AuditLogEvent.MessageDelete)) {
      const executor = await client.users.fetch(auditLogEntry.executorId!).catch(() => null);
      const target = await client.users.fetch(auditLogEntry.targetId!).catch(() => null);
      const channel = auditLogEntry.extra.channel;
      logger.info(`A message by ${target} was deleted by ${executor} in ${channel}`);
    } else if (auditLogEntry.isAction(AuditLogEvent.MessageBulkDelete)) {
      const executor = await client.users.fetch(auditLogEntry.executorId!).catch(() => null);
      const count = auditLogEntry.extra.count;
      const channel = await client.channels.fetch(auditLogEntry.targetId!).catch(() => null);
      logger.info(`${executor} deleted ${count} messages in ${channel}`);
    } else if (auditLogEntry.isAction(AuditLogEvent.MemberKick)) {
      const executor = await client.users.fetch(auditLogEntry.executorId!).catch(() => null);
      const target = await client.users.fetch(auditLogEntry.targetId!).catch(() => null);
      const reason = auditLogEntry.reason || 'No reason provided';
      logger.info(`User ${target} was kicked by ${executor} for: ${reason}`);
    } else if (auditLogEntry.isAction(AuditLogEvent.MemberBanAdd)) {
      const executor = await client.users.fetch(auditLogEntry.executorId!).catch(() => null);
      const target = await client.users.fetch(auditLogEntry.targetId!).catch(() => null);
      const reason = auditLogEntry.reason || 'No reason provided';
      logger.info(`User ${target} was banned by ${executor} for: ${reason}`);
    } else if (auditLogEntry.isAction(AuditLogEvent.MemberBanRemove)) {
      const executor = await client.users.fetch(auditLogEntry.executorId!).catch(() => null);
      const target = await client.users.fetch(auditLogEntry.targetId!).catch(() => null);
      logger.info(`User ${target} was unbanned by ${executor}`);
    }
  },
});
