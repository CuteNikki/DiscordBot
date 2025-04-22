import { loadButtons } from 'loaders/button';
import { loadCommands } from 'loaders/command';
import { loadEvents } from 'loaders/event';
import { loadModals } from 'loaders/modal';
import { loadSelectMenus } from 'loaders/select';

export const reloadableTypes = {
  command: loadCommands,
  button: loadButtons,
  modal: loadModals,
  select: loadSelectMenus,
  event: loadEvents,
} as const;

export const typeLabelMap = {
  command: 'commands',
  button: 'buttons',
  modal: 'modals',
  select: 'select menus',
  event: 'events',
  interaction: 'interactions',
  all: 'everything',
} as const;

export type ReloadType = keyof typeof typeLabelMap;
