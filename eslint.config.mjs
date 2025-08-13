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
      }
    }
  },
  [{
    rules : {
      indent: ["error", 2],
      '@stylistic/semi': "error",
      '@typescript-eslint/no-unsafe-assignment': "off",
    }
  }]
);

// rules: {
//         "arrow-parens": ["error", "as-needed"],
//         curly: ["error", "multi", "consistent"],
//         "nonblock-statement-body-position": "off",
//         "max-len": ["error", {
//             code: 200,
//         }],
//         "object-curly-newline": ["error", {
//             multiline: true,
//         }],
//         "no-underscore-dangle": "off",
//         "class-methods-use-this": "off",
//         "max-classes-per-file": "off",
//         "template-curly-spacing": ["error", "always"],
//         "no-nested-ternary": "off",
//         "implicit-arrow-linebreak": "off",
//         "no-confusing-arrow": "off",
//         "linebreak-style": "off",
//         "lines-between-class-members": "off",
//         "@typescript-eslint/lines-between-class-members": "off",
//         "no-continue": "off",
//         "semi": "error",
//     },