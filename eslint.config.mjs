import { defineConfig } from 'eslint/config';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FlatCompat } from '@eslint/eslintrc';
import { includeIgnoreFile, fixupPluginRules } from '@eslint/compat';
import eslint from '@eslint/js';
import pluginFilenames from 'eslint-plugin-filenames';
import pluginJest from 'eslint-plugin-jest';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';


const gitignorePath = fileURLToPath(
  new URL('.gitignore', import.meta.url),
);

const compat = new FlatCompat();
// https://github.com/selaux/eslint-plugin-filenames/issues/54
pluginFilenames.rules['match-regex'].schema = [
  {
    type: ['string', 'null'],
  },
  {
    type: ['boolean', 'null'],
  },
];

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.strictTypeChecked,
  reactHooks.configs['recommended-latest'],
  {
    plugins: {
      filenames: fixupPluginRules(pluginFilenames),
    },
  },
  ...(compat.extends('plugin:n/recommended')),
  pluginJest.configs['flat/recommended'],
  ...(tseslint.configs.recommended.map(config => ({
    files: ['**/*.ts', '**/*.tsx'],
    ...config,
  }))),
  ...(compat.extends('plugin:prettier/recommended')),
  {
    settings: {
      node: {
        tryExtensions: ['.ts', '.js', '.json', '.tsx', '.d.ts'],
        resolverConfig: {
          mainFiles: ['index', 'index.ts', 'index.js'],
        },
      },
    },

    rules: {
      'n/no-unsupported-features/es-syntax': 'off',
      'n/no-unpublished-import': 'off',
      'n/no-missing-import': [
        'error',
        {
          tryExtensions: ['.ts', '.js', '.json', '.tsx', '.d.ts'],
        },
      ],
      'jest/expect-expect': 'off',
      'jest/no-restricted-matchers': [
        'error',
        {
          toThrow: 'Use .toMatchError() instead of .toThrow()',
          toThrowError: 'Use .toMatchError() instead of .toThrowError()',
        },
      ],
      'no-empty-pattern': 'off',
      'no-console': 'error',
      'no-duplicate-imports': 'error',
      'no-restricted-imports': [
        'error',
        {
          patterns: ['**/out/**', '**/dist/**'],
        },
      ],
      'filenames/match-regex': ['error', '^[0-9a-z-.]+$'],
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-use-before-define': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          ignoreRestSiblings: true,
        },
      ],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/no-require-imports': 'error',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'variable',
          format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
        },
      ],
    },
  },
  {
    rules: {
      'no-console': 'warn',
      'react-hooks/rules-of-hooks': 'error',
      'jest/no-deprecated-functions': 'off',
    },
  },
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: dirname(import.meta.dirname),
        sourceType: 'module',
        ecmaVersion: 2020,
      },
    },
  },
  defineConfig([
    includeIgnoreFile(gitignorePath),
    {
      ignores: ['eslint.config.mjs']
    }
  ]),
);
