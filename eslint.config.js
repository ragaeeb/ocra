import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import prettier from 'eslint-plugin-prettier';
import pluginReact from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import sortDestructureKeys from 'eslint-plugin-sort-destructure-keys';
import sortKeysFix from 'eslint-plugin-sort-keys-fix';
import globals from 'globals';

export default [
    {
        ignores: ['dist', 'src/public/*', '**/public/*', 'node_modules/*', '**/node_modules/*', '.ebextensions/*'],
    },
    {
        files: ['**/*.{js,mjs,cjs,jsx,ts,tsx}'],
        languageOptions: {
            ecmaVersion: 'latest',
            globals: {
                ...globals.browser,
            },
            sourceType: 'module',
        },
        plugins: {
            prettier,
            react: pluginReact,
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh,
            'simple-import-sort': simpleImportSort,
            'sort-destructure-keys': sortDestructureKeys,
            'sort-keys-fix': sortKeysFix,
        },
        rules: {
            ...js.configs.recommended.rules, // ESLint recommended rules
            ...pluginReact.configs.recommended.rules, // React specific rules
            ...pluginReact.configs['jsx-runtime'].rules, // React JSX runtime rules
            ...reactHooks.configs.recommended.rules,
            'prettier/prettier': 'error',

            'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
            // React hooks rules
            'react/jsx-no-target-blank': 'off',
            // Enforce import sorting
            'simple-import-sort/exports': 'warn',
            // Prettier formatting as ESLint errors
            'simple-import-sort/imports': 'warn', // Enforce export sorting
            'sort-destructure-keys/sort-destructure-keys': 'warn', // Sort destructured keys
            'sort-keys-fix/sort-keys-fix': 'warn', // Enforce sorted object keys
        },
        settings: {
            react: { version: '18.3' }, // React version setting
        },
    },
    eslintConfigPrettier,
];
