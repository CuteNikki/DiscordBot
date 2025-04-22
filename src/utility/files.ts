import { globby } from 'globby';

export const getFilesFrom = (relativePath: string) => globby([`${relativePath}/**/*{.ts,.js}`], { absolute: true });

export const getEventFiles = () => getFilesFrom('src/events');
export const getButtonFiles = () => getFilesFrom('src/interactions/buttons');
export const getCommandFiles = () => getFilesFrom('src/interactions/commands');
export const getModalFiles = () => getFilesFrom('src/interactions/modals');
export const getSelectFiles = () => getFilesFrom('src/interactions/selects');
