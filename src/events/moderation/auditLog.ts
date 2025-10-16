import { Events } from 'discord.js';

import { Event } from 'classes/base/event';
import { logger } from 'utility/logger';

export default new Event({
  name: Events.GuildAuditLogEntryCreate,
  once: false,
  async execute(client, auditLogEntry, guild) {
    logger.info({ entry: auditLogEntry.toJSON() }, `Audit log entry created: ${auditLogEntry.action} in ${guild.name} (${guild.id})`);

    // Auditlog experimenting

    // if (auditLogEntry.isAction(AuditLogEvent.MemberUpdate)) {
    //   if (!auditLogEntry.targetId) {
    //     logger.warn('No target ID found for member update audit log entry');
    //     return;
    //   }

    //   const target = await client.users.fetch(auditLogEntry.targetId).catch(() => null);

    //   if (auditLogEntry.changes) {
    //     for (const change of auditLogEntry.changes) {
    //       if (change.key === 'communication_disabled_until') {
    //         const oldTime = change.old ? new Date(change.old).getTime() : null;
    //         const newTime = change.new ? new Date(change.new).getTime() : null;
    //         const reason = auditLogEntry.reason || 'No reason provided';

    //         let executor: User | null = null;
    //         if (auditLogEntry.executorId) {
    //           executor = await client.users.fetch(auditLogEntry.executorId).catch(() => null);
    //         }

    //         if (oldTime === null && newTime !== null) {
    //           // User was timed out
    //           logger.info(
    //             `User ${target} was timed out ${executor ? `by ${executor} ` : ''}until <t:${Math.floor(newTime / 1_000)}:F> (<t:${Math.floor(
    //               newTime / 1_000,
    //             )}:R>) in ${guild.name} (${guild.id}) because: ${reason}`,
    //           );
    //         } else if (oldTime !== null && newTime === null) {
    //           // User was un-timed out
    //           logger.info(
    //             `User ${target} was un-timed out ${executor ? `by ${executor} ` : ''}in ${guild.name} (${guild.id}) because: ${reason}`,
    //           );
    //         }
    //       }
    //     }
    //   }
    // }

    // if (auditLogEntry.isAction(AuditLogEvent.MessageDelete)) {
    //   const executor = await client.users.fetch(auditLogEntry.executorId!).catch(() => null);
    //   const target = await client.users.fetch(auditLogEntry.targetId!).catch(() => null);
    //   const channel = auditLogEntry.extra.channel;
    //   logger.info(`A message by ${target} was deleted by ${executor} in ${channel}`);
    // } else if (auditLogEntry.isAction(AuditLogEvent.MessageBulkDelete)) {
    //   const executor = await client.users.fetch(auditLogEntry.executorId!).catch(() => null);
    //   const count = auditLogEntry.extra.count;
    //   const channel = await client.channels.fetch(auditLogEntry.targetId!).catch(() => null);
    //   logger.info(`${executor} deleted ${count} messages in ${channel}`);
    // } else if (auditLogEntry.isAction(AuditLogEvent.MemberKick)) {
    //   const executor = await client.users.fetch(auditLogEntry.executorId).catch(() => null);
    //   const target = await client.users.fetch(auditLogEntry.targetId).catch(() => null);
    //   const reason = auditLogEntry.reason || 'No reason provided';
    //   logger.info(`User ${target} was kicked by ${executor} for: ${reason}`);
    // } else if (auditLogEntry.isAction(AuditLogEvent.MemberBanAdd)) {
    //   const executor = await client.users.fetch(auditLogEntry.executorId).catch(() => null);
    //   const target = await client.users.fetch(auditLogEntry.targetId).catch(() => null);
    //   const reason = auditLogEntry.reason || 'No reason provided';
    //   logger.info(`User ${target} was banned by ${executor} for: ${reason}`);
    // } else if (auditLogEntry.isAction(AuditLogEvent.MemberBanRemove)) {
    //   const executor = await client.users.fetch(auditLogEntry.executorId).catch(() => null);
    //   const target = await client.users.fetch(auditLogEntry.targetId).catch(() => null);
    //   const reason = auditLogEntry.reason || 'No reason provided';
    //   logger.info(`User ${target} was unbanned by ${executor} for: ${reason}`);
    // } else if (auditLogEntry.isAction(AuditLogEvent.AutoModerationUserCommunicationDisabled)) {
    //   const executor = await client.users.fetch(auditLogEntry.executorId).catch(() => null);
    //   const target = await client.users.fetch(auditLogEntry.targetId).catch(() => null);
    //   const reason = auditLogEntry.reason || 'No reason provided';
    //   logger.info(`User ${target} was timed out by ${executor} for: ${reason}`);
    // }
  },
});
