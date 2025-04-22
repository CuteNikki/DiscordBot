import { performance } from 'perf_hooks';

import type { ExtendedClient } from 'classes/base/client';
import type { SelectMenu } from 'classes/base/select';

import { getSelectFiles } from 'utility/files';
import logger, { table } from 'utility/logger';

export async function loadSelectMenus(client: ExtendedClient) {
  logger.debug('Loading select menu files');

  client.selectMenus.clear();

  const tableData: { file: string; customId: string; valid: string }[] = [];
  const startTime = performance.now();
  const files = await getSelectFiles();

  await Promise.all(
    files.map(async (filePath) => {
      const selectMenu = (await import(`${filePath}?update=${Date.now()}`)).default;

      if (isValidSelectMenu(selectMenu)) {
        client.selectMenus.set(selectMenu.options.customId, selectMenu);
        tableData.push({
          file: filePath.split('/').slice(-2).join('/'),
          customId: selectMenu.options.customId,
          valid: '✅',
        });
        logger.debug(`Loaded select menu file ${filePath.split('/').slice(-2).join('/')} (${selectMenu.options.customId})`);
      } else {
        tableData.push({
          file: filePath.split('/').slice(-2).join('/'),
          customId: selectMenu?.options?.customId || 'undefined',
          valid: '❌',
        });
        logger.warn(`Select menu file ${filePath} is missing data or execute`);
      }
    }),
  );

  const endTime = performance.now();
  logger.info(
    `Loaded ${files.length} select menu${files.length > 1 || files.length === 0 ? 's' : ''} in ${Math.floor(endTime - startTime)}ms\n${table(tableData)}`,
  );
}

function isValidSelectMenu(selectMenu: SelectMenu): selectMenu is SelectMenu {
  return (
    typeof selectMenu === 'object' &&
    selectMenu !== null &&
    typeof selectMenu.options === 'object' &&
    selectMenu.options !== null &&
    'customId' in selectMenu.options &&
    'execute' in selectMenu.options
  );
}
