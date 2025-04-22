import { performance } from 'perf_hooks';

import type { ExtendedClient } from 'classes/base/client';
import type { Command } from 'classes/base/command';

import { getCommandFiles } from 'utility/files';
import logger, { table } from 'utility/logger';

export async function loadCommands(client: ExtendedClient) {
  logger.debug('Loading command files');

  client.commands.clear();

  const tableData: { file: string; name: string; valid: string }[] = [];
  const startTime = performance.now();
  const filePaths = await getCommandFiles();

  await Promise.all(
    filePaths.map(async (filePath) => {
      const command = (await import(`${filePath}?update=${Date.now()}`)).default;

      if (isValidCommand(command)) {
        client.commands.set(command.options.builder.name, command);
        tableData.push({
          file: filePath.split('/').slice(-2).join('/'),
          name: command.options.builder.name,
          valid: '✅',
        });
        logger.debug(`Loaded command file ${filePath.split('/').slice(-2).join('/')} (${command.options.builder.name})`);
      } else {
        tableData.push({
          file: filePath.split('/').slice(-2).join('/'),
          name: command?.options?.builder?.name || 'undefined',
          valid: '❌',
        });
        logger.warn(`Command file ${filePath} is missing data or execute`);
      }
    }),
  );

  const endTime = performance.now();
  logger.info(
    `Loaded ${filePaths.length} command${filePaths.length > 1 || filePaths.length === 0 ? 's' : ''} in ${Math.floor(endTime - startTime)}ms\n${table(tableData)}`,
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
