FROM node:22-bookworm-slim AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
FROM base AS deps
COPY package*.json ./
RUN npm ci
FROM deps AS build
COPY . .
RUN npm run build && npm run build:worker
FROM base AS web
ENV NODE_ENV=production APP_MODE=demo HOSTNAME=0.0.0.0 PORT=3000
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public
USER node
EXPOSE 3000
CMD ["node", "server.js"]
FROM deps AS worker-build
COPY . .
RUN npm run build:worker && npm prune --omit=dev
FROM base AS worker
ENV NODE_ENV=production APP_MODE=demo
COPY --from=worker-build --chown=node:node /app/node_modules ./node_modules
COPY --from=worker-build --chown=node:node /app/dist/worker ./dist/worker
USER node
EXPOSE 3001
CMD ["node", "dist/worker/apps/worker/index.js"]
