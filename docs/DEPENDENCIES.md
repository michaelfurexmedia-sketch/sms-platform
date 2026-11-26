# Dependency snapshot

Resolved from the fresh CI-generated npm lockfile; install with npm ci.

| Dependency                      | Version | Package license metadata |
| ------------------------------- | ------- | ------------------------ |
| @fontsource/bricolage-grotesque | 5.3.0   | OFL-1.1                  |
| @fontsource/geist               | 5.3.0   | OFL-1.1                  |
| bullmq                          | 5.81.6  | MIT                      |
| ioredis                         | 5.11.1  | MIT                      |
| lucide-react                    | 0.468.0 | ISC                      |
| next                            | 16.4.6  | MIT                      |
| react                           | 19.3.1  | MIT                      |
| react-dom                       | 19.3.1  | MIT                      |
| @axe-core/playwright            | 4.14.1  | MPL-2.0                  |
| @playwright/test                | 1.65.1  | Apache-2.0               |
| @tailwindcss/postcss            | 4.3.5   | MIT                      |
| @types/node                     | 22.20.7 | MIT                      |
| @types/react                    | 19.3.3  | MIT                      |
| @types/react-dom                | 19.3.0  | MIT                      |
| eslint                          | 9.39.5  | MIT                      |
| eslint-plugin-jsx-a11y          | 6.10.2  | MIT                      |
| prettier                        | 3.10.1  | MIT                      |
| tailwindcss                     | 4.3.5   | MIT                      |
| tsx                             | 4.23.15 | MIT                      |
| typescript                      | 5.9.3   | Apache-2.0               |
| typescript-eslint               | 8.74.0  | MIT                      |

Node 22 is the tested baseline. Valkey 8.1.4 (BSD-3-Clause) and PostgreSQL 17 (PostgreSQL License) are infrastructure services. Runtime packages are open source; no paid dependency was added. Licenses require their notices to remain with distributions. Lock metadata is not a legal review.

ESLint 9 is deprecated upstream; retained for current jsx-a11y peer compatibility. The npm audit during initial CI reported zero vulnerabilities. Recheck dependencies at release boundaries; do not infer perpetual safety.
