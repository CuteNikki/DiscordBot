import { globby } from 'globby';

export const getFilesFrom = (relativePath: string, ignore?: string) =>
  globby([`${relativePath}/**/*{.ts,.js}`], {
    absolute: true,
    ignore: ignore ? [`${ignore}/**`] : [],
  });

export const getEventFiles = () => getFilesFrom('src/events', 'src/events/auditLog');
export const getAuditLogFiles = () => getFilesFrom('src/events/auditLog');
export const getButtonFiles = () => getFilesFrom('src/interactions/buttons');
export const getCommandFiles = () => getFilesFrom('src/interactions/commands');
export const getModalFiles = () => getFilesFrom('src/interactions/modals');
export const getSelectFiles = () => getFilesFrom('src/interactions/selects');
