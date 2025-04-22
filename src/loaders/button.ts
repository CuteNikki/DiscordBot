import { performance } from 'perf_hooks';

import type { Button } from 'classes/base/button';
import type { ExtendedClient } from 'classes/base/client';

import { getButtonFiles } from 'utility/files';
import logger, { table } from 'utility/logger';

export async function loadButtons(client: ExtendedClient) {
  logger.debug('Loading button files');

  client.buttons.clear();

  const tableData: { file: string; customId: string; valid: string }[] = [];
  const startTime = performance.now();
  const filePaths = await getButtonFiles();

  await Promise.all(
    filePaths.map(async (filePath) => {
      const button = (await import(`${filePath}?update=${Date.now()}`)).default;

      if (isValidButton(button)) {
        client.buttons.set(button.options.customId, button);
        tableData.push({
          file: filePath.split('/').slice(-2).join('/'),
          customId: button.options.customId,
          valid: '✅',
        });
        logger.debug(`Loaded button file ${filePath.split('/').slice(-2).join('/')} (${button.options.customId})`);
      } else {
        tableData.push({
          file: filePath.split('/').slice(-2).join('/'),
          customId: button?.options?.customId || 'undefined',
          valid: '❌',
        });
        logger.warn(`Button file ${filePath} is missing data or execute`);
      }
    }),
  );

  const endTime = performance.now();
  logger.info(
    `Loaded ${filePaths.length} button${filePaths.length > 1 || filePaths.length === 0 ? 's' : ''} in ${Math.floor(endTime - startTime)}ms\n${table(tableData)}`,
  );
}

function isValidButton(button: Button): button is Button {
  return (
    typeof button === 'object' &&
    button !== null &&
    typeof button.options === 'object' &&
    button.options !== null &&
    'customId' in button.options &&
    'execute' in button.options
  );
}
