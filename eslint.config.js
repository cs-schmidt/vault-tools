import { join } from 'node:path';

import { includeIgnoreFile } from '@eslint/compat';
import pluginJs from '@eslint/js';
import globals from 'globals';

const IGNORE_FILE_PATH = join(import.meta.dirname, '.toolignore');

export default [
  // Global/Default options
  includeIgnoreFile(IGNORE_FILE_PATH),
  pluginJs.configs.recommended,

  // Source code linting
  {
    files: ['src/**/*.{js,mjs,cjs}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        app: 'readonly',
      },
    },
  },

  // Config file linting
  {
    files: ['*.{js,mjs,cjs}'],
    languageOptions: {
      globals: globals.node,
    },
  },
];
