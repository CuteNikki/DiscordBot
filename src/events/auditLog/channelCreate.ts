import { AuditLogEvent, ChannelType, type NonThreadGuildBasedChannel } from 'discord.js';

import { AuditLog } from 'classes/base/auditLog';

import { logger } from 'utility/logger';

export default new AuditLog({
  event: AuditLogEvent.ChannelCreate,
  execute: async (_client, entry, guild) => {
    const target = entry.target; // Channel
    const executor = entry.executor; // User who created the channel
    const reason = entry.reason; // Reason for the creation, if provided

    if (isNonThreadBasedChannel(target)) {
      return logger.info(
        [
          `Channel of type ${ChannelType[target.type]} created in Guild: ${guild.name} (${guild.id})`,
          `Channel: ${target.name} (${target.id})`,
          executor ? `Created by: ${executor.tag} (${executor.id})` : null,
          reason ? `Reason: ${reason}` : null,
        ]
          .filter((str) => str !== null)
          .join('\n'),
      );
    } else {
      return logger.info(
        [
          `Channel created in Guild: ${guild.name} (${guild.id})`,
          `Channel: ${target.name} (${target.id})`,
          executor ? `By: ${executor.tag} (${executor.id})` : null,
          reason ? `Reason: ${reason}` : null,
        ]
          .filter((str) => str !== null)
          .join('\n'),
      );
    }
  },
});

function isNonThreadBasedChannel(channel: unknown): channel is NonThreadGuildBasedChannel {
  return (
    channel !== null &&
    typeof channel === 'object' &&
    'id' in channel &&
    'guild' in channel &&
    'type' in channel &&
    typeof channel.id === 'string' &&
    typeof channel.guild !== 'undefined' &&
    typeof channel.type !== 'undefined'
  );
}
