import { AuditLogEvent } from 'discord.js';

import { AuditLog } from 'classes/base/auditLog';

import { logger } from 'utility/logger';

export default new AuditLog({
  event: AuditLogEvent.GuildUpdate,
  execute: async (_client, entry, guild) => {
    const changes = entry.changes; // Array of changes made
    const executor = entry.executor; // User who made the change
    const reason = entry.reason; // Reason for the change, if provided
    const extra = entry.extra; // Extra information, varies by action type

    return logger.info(
      [
        `Guild updated: ${guild.name} (${guild.id})`,
        executor ? `By: ${executor.tag} (${executor.id})` : null,
        reason ? `Reason: ${reason}` : null,
        extra ? `Extra Info: ${JSON.stringify(extra, null, 2)}` : null,
        '',
        `Changes:`,
        ...changes.map((change) => `- **${change.key}**: ${change.old} -> ${change.new}`),
      ]
        .filter((str) => str !== null)
        .join('\n'),
    );
  },
});
