import pluginJs from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [
  // Base JavaScript rules
  { languageOptions: { globals: globals.node } },
  pluginJs.configs.recommended,

  // TypeScript rules
  ...tseslint.configs.recommended,

  // Prettier rules
  eslintConfigPrettier,

  // Custom rules
  {
    rules: {
      'no-warning-comments': [
        'warn',
        {
          terms: ['todo', 'fixme', 'eslint-disable', 'eslint-disable-next-line', 'eslint-disable-line'],
          location: 'anywhere',
        },
      ],
    },
  },
];
