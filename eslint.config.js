import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  // Mechanical rules, kept here rather than in CODING_STANDARDS.md. Config files need default exports, so these cover src only.
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-non-null-assertion": "error",
      "no-restricted-syntax": ["error", { selector: "TSEnumDeclaration", message: "Use a string-literal union or an `as const` object." }],
      "no-restricted-exports": [
        "error",
        { restrictDefaultExports: { direct: true, named: true, defaultFrom: true, namedFrom: true, namespaceFrom: true } },
      ],
    },
  },
);
