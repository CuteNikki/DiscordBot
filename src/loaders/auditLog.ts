import { AuditLogEvent } from 'discord.js';
import { performance } from 'perf_hooks';

import type { AuditLog } from 'classes/base/auditLog';
import type { ExtendedClient } from 'classes/base/client';

import { getAuditLogFiles } from 'utility/files';
import { logger, table } from 'utility/logger';

export async function loadAuditLogs(client: ExtendedClient) {
  client.auditLogs.clear();

  const tableData: { file: string; name: string; valid: string }[] = [];
  const startTime = performance.now();
  const filePaths = await getAuditLogFiles();

  await Promise.all(
    filePaths.map(async (filePath) => {
      const auditLog = (await import(`${filePath}?update=${Date.now()}`)).default;

      if (isValidAuditLog(auditLog)) {
        client.auditLogs.set(auditLog.options.event, auditLog);
        tableData.push({
          file: filePath.split('/').slice(-2).join('/'),
          name: AuditLogEvent[auditLog.options.event],
          valid: '✅',
        });
        logger.debug(`Loaded audit log file ${filePath.split('/').slice(-2).join('/')} (${auditLog.options.event})`);
      } else {
        tableData.push({
          file: filePath.split('/').slice(-2).join('/'),
          name: auditLog?.options?.event || 'undefined',
          valid: '❌',
        });
        logger.warn(`Audit log file ${filePath} is missing data or execute`);
      }
    }),
  );

  const endTime = performance.now();
  logger.info(
    `Loaded ${filePaths.length} audit log${filePaths.length > 1 || filePaths.length === 0 ? 's' : ''} in ${Math.floor(endTime - startTime)}ms\n${table(tableData)}`,
  );
}

function isValidAuditLog(auditLog: unknown): auditLog is AuditLog {
  return (
    typeof auditLog === 'object' &&
    auditLog !== null &&
    'options' in auditLog &&
    typeof auditLog.options === 'object' &&
    auditLog.options !== null &&
    'event' in auditLog.options &&
    'execute' in auditLog.options
  );
}
