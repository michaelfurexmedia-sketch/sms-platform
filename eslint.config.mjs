import js from "@eslint/js";
import tseslint from "typescript-eslint";
import a11y from "eslint-plugin-jsx-a11y";
export default tseslint.config(
  { ignores: [".next/**", "out/**", "dist/**", ".openai/**", "test-results/**", "playwright-report/**", "next-env.d.ts"] },
  { files: ["**/*.{ts,tsx}"], extends: [js.configs.recommended, ...tseslint.configs.recommended],
    plugins: { "jsx-a11y": a11y },
    rules: {
      ...a11y.configs.recommended.rules,
      "jsx-a11y/no-noninteractive-tabindex": ["error", { roles: ["tabpanel", "region"] }],
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "error",
      "no-empty": ["error", { allowEmptyCatch: true }]
    }
  },
  { files: ["src/components/**/*.{ts,tsx}", "src/lib/**/*.{ts,tsx}", "src/config/**/*.{ts,tsx}"],
    rules: { "no-restricted-imports": ["error", {
      patterns: [{ group: ["@/server/*", "**/server/*", "bullmq", "ioredis"], message: "Server infrastructure must not enter client/demo modules." }]
    }] }
  }
);
