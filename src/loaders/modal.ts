import { performance } from 'perf_hooks';

import type { ExtendedClient } from 'classes/base/client';
import type { Modal } from 'classes/base/modal';

import { getModalFiles } from 'utility/files';
import logger from 'utility/logger';

export async function loadModals(client: ExtendedClient) {
  logger.debug('Loading modal files');

  const startTime = performance.now();
  const filePaths = await getModalFiles();

  await Promise.all(
    filePaths.map(async (filePath) => {
      const modal = (await import(filePath)).default;

      if (isValidModal(modal)) {
        client.modals.set(modal.options.customId, modal);
        logger.debug(`Loaded modal file ${filePath.split('/').slice(-2).join('/')} (${modal.options.customId})`);
      } else {
        logger.warn(`Modal file ${filePath} is missing data or execute`);
      }
    }),
  );

  const endTime = performance.now();

  logger.info(
    `Loaded ${filePaths.length} modal${filePaths.length > 1 || filePaths.length === 0 ? 's' : ''} in ${Math.floor(endTime - startTime)}ms`,
  );
}

function isValidModal(modal: Modal): modal is Modal {
  return (
    typeof modal === 'object' &&
    modal !== null &&
    typeof modal.options === 'object' &&
    modal.options !== null &&
    'customId' in modal.options &&
    'execute' in modal.options
  );
}
