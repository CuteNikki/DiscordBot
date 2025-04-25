import type {
  APIApplicationCommandSubcommandGroupOption,
  APIApplicationCommandSubcommandOption,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord.js';
import { t, use } from 'i18next';
import I18NextFsBackend from 'i18next-fs-backend';

import { KEYS } from 'utility/keys';
import { logger } from 'utility/logger';

export async function initializeI18N(defaultNameSpace?: string) {
  await use(I18NextFsBackend).init({
    debug: process.argv.includes('--debug-lang'),
    defaultNS: defaultNameSpace ?? 'messages',
    ns: ['messages', 'commands'],
    preload: KEYS.LOCALES_SUPPORTED,
    fallbackLng: KEYS.LOCALES_FALLBACK,
    interpolation: {
      escapeValue: false,
    },
    backend: {
      loadPath: './src/locales/{{lng}}/{{ns}}.json',
    },
  });
  logger.info(`i18next initialized! Languages loaded: ${KEYS.LOCALES_SUPPORTED.join(', ')}`);
}

function translateLocalizationPath(commandName: string, pathParts: (string | number)[]): string {
  return `${commandName}.${pathParts.join('.')}`;
}

export function translateCommand(
  command:
    | APIApplicationCommandSubcommandGroupOption
    | APIApplicationCommandSubcommandOption
    | RESTPostAPIChatInputApplicationCommandsJSONBody,
) {
  if (t(`${command.name}.name`) === `${command.name}.name`) {
    // If the translation key does not exist, return the command as is
    return command;
  }

  const setLocalization = (key: string): Record<string, string> => {
    return KEYS.LOCALES_SUPPORTED.reduce(
      (acc, locale) => {
        acc[locale] = t(`${key}`, { lng: locale });
        return acc;
      },
      {} as Record<string, string>,
    );
  };

  // Translating main command name and description
  if ('name' in command) {
    command.name_localizations = setLocalization(translateLocalizationPath(command.name, ['name']));
  }

  if ('description' in command) {
    command.description_localizations = setLocalization(translateLocalizationPath(command.name, ['description']));
  }

  // Translating options
  if ('options' in command && command.options?.length) {
    command.options.forEach((option, index) => {
      if ('name' in option) {
        option.name_localizations = setLocalization(translateLocalizationPath(command.name, ['options', index, 'name']));
      }

      if ('description' in option) {
        option.description_localizations = setLocalization(translateLocalizationPath(command.name, ['options', index, 'description']));
      }

      if ('choices' in option && option.choices?.length) {
        option.choices.forEach((choice, choiceIndex) => {
          if ('name' in choice) {
            choice.name_localizations = setLocalization(
              translateLocalizationPath(command.name, ['options', index, 'choices', choiceIndex]),
            );
          }
        });
      }

      if ('options' in option && option.options?.length) {
        option.options.forEach((subOption, subOptionIndex) => {
          if ('name' in subOption) {
            subOption.name_localizations = setLocalization(
              translateLocalizationPath(command.name, ['options', index, 'options', subOptionIndex, 'name']),
            );
          }

          if ('description' in subOption) {
            subOption.description_localizations = setLocalization(
              translateLocalizationPath(command.name, ['options', index, 'options', subOptionIndex, 'description']),
            );
          }

          if ('choices' in subOption && subOption.choices?.length) {
            subOption.choices.forEach((choice, choiceIndex) => {
              if ('name' in choice) {
                choice.name_localizations = setLocalization(
                  translateLocalizationPath(command.name, ['options', index, 'options', subOptionIndex, 'choices', choiceIndex]),
                );
              }
            });
          }

          if ('options' in subOption && subOption.options?.length) {
            subOption.options.forEach((nestedSubOption, nestedSubOptionIndex) => {
              if ('name' in nestedSubOption) {
                nestedSubOption.name_localizations = setLocalization(
                  translateLocalizationPath(command.name, [
                    'options',
                    index,
                    'options',
                    subOptionIndex,
                    'options',
                    nestedSubOptionIndex,
                    'name',
                  ]),
                );
              }

              if ('description' in nestedSubOption) {
                nestedSubOption.description_localizations = setLocalization(
                  translateLocalizationPath(command.name, [
                    'options',
                    index,
                    'options',
                    subOptionIndex,
                    'options',
                    nestedSubOptionIndex,
                    'description',
                  ]),
                );
              }

              if ('choices' in nestedSubOption && nestedSubOption.choices?.length) {
                nestedSubOption.choices.forEach((choice, choiceIndex) => {
                  if ('name' in choice) {
                    choice.name_localizations = setLocalization(
                      translateLocalizationPath(command.name, [
                        'options',
                        index,
                        'options',
                        subOptionIndex,
                        'options',
                        nestedSubOptionIndex,
                        'choices',
                        choiceIndex,
                      ]),
                    );
                  }
                });
              }
            });
          }
        });
      }
    });
  }

  return command;
}
