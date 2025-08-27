import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import stylistic from '@stylistic/eslint-plugin';

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.strict,
  tseslint.configs.stylistic,
  tseslint.configs.recommendedTypeChecked,
  {
    plugins : {
      '@stylistic': stylistic,
    },
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules : {
      indent: ['error', 2],
      '@stylistic/jsx-closing-bracket-location': 'error',
      '@stylistic/jsx-closing-tag-location': ['error', 'line-aligned'],
      '@stylistic/comma-dangle': ['error', 'always-multiline'],
      '@stylistic/object-curly-newline': ['error', { 'multiline': true, 'consistent': true }],
      '@stylistic/object-property-newline': ['error', { 'allowAllPropertiesOnSameLine': true }],
      '@stylistic/semi': 'error',
      '@stylistic/quotes': ['error', 'single'],
      '@typescript-eslint/no-unsafe-assignment': 'off',
      'arrow-parens': ['error', 'as-needed'],
      'curly': ['error', 'multi', 'consistent'],
      'max-len': ['error', {
        code: 200,
      }],
      'template-curly-spacing': ['error', 'always'],
    },
  },
);
