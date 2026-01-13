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
        executor ? `By: ${executor.tag} (${executor.id})` : 'By: Unknown',
        reason ? `Reason: ${reason}` : '',
        extra ? `Extra Info: ${JSON.stringify(extra, null, 2)}` : '',
        '',
        `Changes:`,
        ...changes.map((change) => `- **${change.key}**: ${change.old} -> ${change.new}`),
      ].join('\n'),
    );
  },
});
