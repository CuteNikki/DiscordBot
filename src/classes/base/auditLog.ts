import type { AuditLogEvent, Guild, GuildAuditLogsEntry } from 'discord.js';

import type { ExtendedClient } from 'classes/base/client';

export class AuditLog<T extends AuditLogEvent = AuditLogEvent> {
  constructor(
    public options: {
      event: T;
      execute: (client: ExtendedClient, auditLogEntry: GuildAuditLogsEntry<T>, guild: Guild) => unknown;
    },
  ) {}
}
