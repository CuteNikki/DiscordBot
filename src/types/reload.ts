import type { ExtendedClient } from 'classes/base/client';

import { loadAuditLogs } from 'loaders/auditLog';
import { loadButtons } from 'loaders/button';
import { loadCommands } from 'loaders/command';
import { loadEvents } from 'loaders/event';
import { loadModals } from 'loaders/modal';
import { loadSelectMenus } from 'loaders/select';

import { deployCommands } from 'utility/register';
import { initializeI18N } from 'utility/translation';

/**
 * Enum representing the different types of reloadable components.
 */
export enum ReloadTypeEnum {
  Commands = 'commands',
  Buttons = 'buttons',
  Modals = 'modals',
  Selects = 'selects',
  Events = 'events',
  Locales = 'locales',
  All = 'everything',
  Interactions = 'interactions',
  AuditLogs = 'auditlogs',
  DeployCommands = 'deploy',
}

/**
 * Type guard to check if a value is a valid ReloadTypeEnum.
 * @param value - The value to check.
 * @returns True if the value is a valid ReloadTypeEnum, false otherwise.
 */
export function isReloadable(value: string): value is ReloadTypeEnum {
  return Object.values(ReloadTypeEnum).includes(value as ReloadTypeEnum);
}

/**
 * Map of reloadable components and their corresponding reload functions.
 */
export const reloadMap: { [key in ReloadTypeEnum]: (client: ExtendedClient) => Promise<unknown> } = {
  everything: async (client: ExtendedClient) =>
    await Promise.all([
      initializeI18N(),
      loadCommands(client),
      loadButtons(client),
      loadModals(client),
      loadSelectMenus(client),
      loadEvents(client),
      loadAuditLogs(client),
    ]),
  interactions: async (client: ExtendedClient) =>
    await Promise.all([loadCommands(client), loadButtons(client), loadModals(client), loadSelectMenus(client)]),
  commands: async (client: ExtendedClient) => await loadCommands(client),
  buttons: loadButtons,
  modals: loadModals,
  selects: loadSelectMenus,
  events: loadEvents,
  auditlogs: loadAuditLogs,
  locales: () => initializeI18N(),
  deploy: () => deployCommands(),
} as const;
