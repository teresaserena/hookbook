import js from "@eslint/js";
import globals from "globals";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import prettier from "eslint-config-prettier";
import { defineConfig } from "eslint/config";

export default defineConfig([
  { ignores: ["dist/", "node_modules/", "client/**/*.js", "client/**/*.d.ts", "src/stories/"] },
  // Server (Node.js)
  {
    files: ["src/**/*.ts"],
    plugins: { js, "@typescript-eslint": tseslint },
    extends: ["js/recommended"],
    languageOptions: {
      parser: tsparser,
      parserOptions: { project: "./tsconfig.json" },
      globals: globals.node,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
    },
  },
  // Client (Browser + React)
  {
    files: ["client/**/*.{ts,tsx}"],
    plugins: { js, "@typescript-eslint": tseslint },
    extends: ["js/recommended"],
    languageOptions: {
      parser: tsparser,
      parserOptions: { project: "./client/tsconfig.json" },
      globals: globals.browser,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
    },
  },
  // Prettier must come last — disables formatting rules that conflict
  prettier,
]);
