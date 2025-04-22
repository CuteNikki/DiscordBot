import { performance } from 'perf_hooks';

import type { ExtendedClient } from 'classes/base/client';
import type { Command } from 'classes/base/command';

import { getCommandFiles } from 'utility/files';
import logger from 'utility/logger';

export async function loadCommands(client: ExtendedClient) {
  logger.debug('Loading command files');

  const startTime = performance.now();
  const filePaths = await getCommandFiles();

  await Promise.all(
    filePaths.map(async (filePath) => {
      const command = (await import(filePath)).default;

      if (isValidCommand(command)) {
        client.commands.set(command.options.builder.name, command);

        logger.debug(`Loaded command file ${filePath.split('/').slice(-2).join('/')} (${command.options.builder.name})`);
      } else {
        logger.warn(`Command file ${filePath} is missing data or execute`);
      }
    }),
  );

  const endTime = performance.now();
  logger.info(
    `Loaded ${filePaths.length} command${filePaths.length > 1 || filePaths.length === 0 ? 's' : ''} in ${Math.floor(endTime - startTime)}ms`,
  );
}

function isValidCommand(command: Command): command is Command {
  return (
    typeof command === 'object' &&
    command !== null &&
    typeof command.options === 'object' &&
    command.options !== null &&
    'builder' in command.options &&
    'execute' in command.options
  );
}
