// ESLint 9 usa "flat config": o .eslintrc.json antigo não é mais lido.
// (o antigo, aliás, estava com vírgula sobrando e o lint nunca rodava —
// `eslint src` quebrava antes de olhar um arquivo)
import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'public'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.es2021 },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      ...react.configs.flat.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],

      // JSX runtime automático (vite plugin-react): não precisa importar React
      'react/react-in-jsx-scope': 'off',
      // tipos vêm do TypeScript, não de propTypes
      'react/prop-types': 'off',
      'react/jsx-pascal-case': 'off',

      // tsc já reprova com noUnusedLocals/noUnusedParameters; aqui fica como
      // aviso e ignora args prefixados com _
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      // a base atual usa `any` em vários pontos: aviso, não erro
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-empty-object-type': 'warn',

      'no-use-before-define': 'off',
      '@typescript-eslint/no-use-before-define': 'error',
    },
  },
  // desliga as regras de formatação que colidem com o prettier — precisa ser
  // o último item
  prettier
);
