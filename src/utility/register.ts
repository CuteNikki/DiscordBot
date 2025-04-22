import {
  REST,
  Routes,
  type APIApplicationCommandSubcommandGroupOption,
  type APIApplicationCommandSubcommandOption,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord.js';
import { performance } from 'perf_hooks';

import type { Command } from 'classes/base/command';

import { getCommandFiles } from 'utility/files';
import { KEYS } from 'utility/keys';
import logger, { table } from 'utility/logger';
import { initializeI18N, translateCommand } from 'utility/translation';

await initializeI18N('commands');

const commands: (
  | RESTPostAPIChatInputApplicationCommandsJSONBody
  | APIApplicationCommandSubcommandOption
  | APIApplicationCommandSubcommandGroupOption
)[] = [];
const tableData: { file: string; name: string; valid: string }[] = [];
const startTime = performance.now();
const filePaths = await getCommandFiles();

await Promise.all(
  filePaths.map(async (filePath) => {
    const command = (await import(`${filePath}?update=${Date.now()}`)).default;

    if (isValidCommand(command)) {
      commands.push(command.options.builder.toJSON());
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

const rest = new REST().setToken(KEYS.DISCORD_BOT_TOKEN);

(async () => {
  try {
    logger.info(`Starting to reload application (/) commands.`);

    const deployStartTime = performance.now();
    const commandsWithTranslation = commands.map(translateCommand);

    await rest.put(Routes.applicationCommands(KEYS.DISCORD_BOT_ID), {
      body: commandsWithTranslation,
    });

    if (KEYS.DISCORD_DEV_GUILD_ID) {
      await rest.put(Routes.applicationGuildCommands(KEYS.DISCORD_BOT_ID, KEYS.DISCORD_DEV_GUILD_ID), {
        body: commandsWithTranslation,
      });
    }

    const deployEndTime = performance.now();

    logger.info(`Successfully reloaded application (/) commands in ${Math.floor(deployEndTime - deployStartTime)}ms!`);
  } catch (error) {
    logger.error({ err: error }, 'Failed to refresh application (/) commands.');
  }
})();

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
