import { performance } from 'perf_hooks';

import type { ExtendedClient } from 'classes/base/client';
import type { Event } from 'classes/base/event';

import { getEventFiles } from 'utility/files';
import logger, { table } from 'utility/logger';

export async function loadEvents(client: ExtendedClient) {
  client.removeAllListeners();

  const tableData: { file: string; name: string; valid: string }[] = [];
  const startTime = performance.now();
  const filePaths = await getEventFiles();

  await Promise.all(
    filePaths.map(async (filePath) => {
      const event = (await import(`${filePath}?update=${Date.now()}`)).default;

      if (isValidEvent(event)) {
        const handler = (...args: unknown[]) => event.options.execute(client, ...args);

        client[event.options.once ? 'once' : 'on'](event.options.name, handler);

        tableData.push({
          file: filePath.split('/').slice(-2).join('/'),
          name: event.options.name,
          valid: '✅',
        });
        logger.debug(`Loaded event file ${filePath.split('/').slice(-2).join('/')} (${event.options.name})`);
      } else {
        tableData.push({
          file: filePath.split('/').slice(-2).join('/'),
          name: event?.options?.name || 'undefined',
          valid: '❌',
        });
        logger.warn(`Event file ${filePath} is missing name or execute`);
      }
    }),
  );

  const endTime = performance.now();
  logger.info(
    `Loaded ${filePaths.length} event${filePaths.length > 1 || filePaths.length === 0 ? 's' : ''} in ${Math.floor(endTime - startTime)}ms\n${table(tableData)}`,
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isValidEvent(event: Event<any>): event is Event<any> {
  return (
    typeof event === 'object' &&
    event !== null &&
    typeof event.options === 'object' &&
    event.options !== null &&
    'name' in event.options &&
    'execute' in event.options
  );
}
