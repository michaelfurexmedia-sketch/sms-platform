import ts from "typescript-eslint";
import a11y from "eslint-plugin-jsx-a11y";
export default [
  { ignores: ["dist/**", ".next/**", "node_modules/**"] },
  ...ts.configs.recommended,
  { files: ["**/*.tsx"], plugins: { "jsx-a11y": a11y }, rules: {
    ...a11y.configs.recommended.rules,
    "jsx-a11y/no-noninteractive-tabindex": ["error", { roles: ["tabpanel", "region"] }]
  }},
  { files: ["src/components/**/*.{ts,tsx}", "src/config/**/*.{ts,tsx}"], rules: {
    "no-restricted-imports": ["error", { patterns: ["@/server/*", "**/server/*"], paths: ["bullmq", "ioredis"] }]
  }}
];
