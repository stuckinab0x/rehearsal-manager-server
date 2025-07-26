import { defineConfig } from "eslint/config";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default defineConfig([{
    extends: compat.extends("airbnb-base", "airbnb-typescript/base"),

    plugins: {
        "@typescript-eslint": typescriptEslint,
    },

    languageOptions: {
        globals: {
            ...globals.node,
        },

        parser: tsParser,
        ecmaVersion: "latest",
        sourceType: "module",

        parserOptions: {
            project: "./tsconfig.json",
        },
    },

    settings: {
        "import/resolver": {
            node: {
                extensions: [".js", ".ts"],
            },
        },
    },

    rules: {
        "arrow-parens": ["error", "as-needed"],
        curly: ["error", "multi", "consistent"],
        "nonblock-statement-body-position": "off",

        "max-len": ["error", {
            code: 200,
        }],

        "object-curly-newline": ["error", {
            multiline: true,
        }],

        "no-underscore-dangle": "off",
        "class-methods-use-this": "off",
        "max-classes-per-file": "off",
        "template-curly-spacing": ["error", "always"],
        "no-nested-ternary": "off",
        "implicit-arrow-linebreak": "off",
        "no-confusing-arrow": "off",
        "linebreak-style": "off",
        "lines-between-class-members": "off",
        "@typescript-eslint/lines-between-class-members": "off",
        "no-continue": "off",
    },
}]);