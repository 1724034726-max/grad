import js from '@eslint/js'
import globals from 'globals'
import vue from 'eslint-plugin-vue'
import tseslint from 'typescript-eslint'
import vueParser from 'vue-eslint-parser'

export default [
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'coverage/**',
      '*.min.*',
      '**/*.d.ts',
      '*.log',
      'pnpm-lock.yaml',
      'package-lock.json',
      'yarn.lock',
      '.vscode/**',
      '.idea/**',
      '**/*.{svg,png,jpg,jpeg,gif,webp}',
    ],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  // Vue SFC
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
        ecmaVersion: 'latest',
        sourceType: 'module',
        extraFileExtensions: ['.vue'],
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: { vue },
    rules: {
      ...vue.configs['flat/recommended'].rules,
      'vue/multi-word-component-names': 'off',
      'vue/no-v-html': 'off',
    },
  },

  // TS/JS files
  {
    files: ['**/*.{js,cjs,mjs,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
]
