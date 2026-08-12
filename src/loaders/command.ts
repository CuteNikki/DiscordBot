import { performance } from 'perf_hooks';

import type { ExtendedClient } from 'classes/base/client';
import type { Command } from 'classes/base/command';

import { getCommandFiles } from 'utility/files';
import { logger, table } from 'utility/logger';

export async function loadCommands(client: ExtendedClient) {
  client.commands.clear();

  const tableData: { file: string; name: string; valid: string }[] = [];
  const startTime = performance.now();
  const filePaths = await getCommandFiles();

  await Promise.all(
    filePaths.map(async (filePath) => {
      const shortPath = filePath.split('/').slice(-2).join('/');

      try {
        const command = (await import(`${filePath}?update=${Date.now()}`)).default;

        if (isValidCommand(command)) {
          const commandData = command.options.builder.toJSON();

          client.commands.set(commandData.name, command);
          tableData.push({
            file: shortPath,
            name: commandData.name,
            valid: '✅',
          });
          logger.debug(`Loaded command file ${shortPath} (${commandData.name})`);
        } else {
          tableData.push({
            file: shortPath,
            name: command?.options?.builder?.name || 'undefined',
            valid: '❌',
          });
          logger.warn(`Command file ${filePath} is missing data or execute`);
        }
      } catch (error) {
        logger.error(`❌ Failed to load command at file: ${shortPath}`);
        tableData.push({
          file: shortPath,
          name: 'ERROR',
          valid: '❌',
        });
        throw error;
      }
    }),
  );

  const endTime = performance.now();
  logger.info(
    `Loaded ${filePaths.length} command${filePaths.length > 1 || filePaths.length === 0 ? 's' : ''} in ${Math.floor(endTime - startTime)}ms\n${table(tableData)}`,
  );
}

function isValidCommand(command: unknown): command is Command {
  return (
    typeof command === 'object' &&
    command !== null &&
    'options' in command &&
    typeof command.options === 'object' &&
    command.options !== null &&
    'builder' in command.options &&
    'execute' in command.options
  );
}
