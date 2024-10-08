import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import perfectionist from 'eslint-plugin-perfectionist';
import prettier from 'eslint-plugin-prettier';
import pluginReact from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';

export default [
    perfectionist.configs['recommended-natural'],
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
        },
        settings: {
            react: { version: '18.3' }, // React version setting
        },
    },
    eslintConfigPrettier,
];
