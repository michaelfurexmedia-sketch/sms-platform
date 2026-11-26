FROM node:22-bookworm-slim AS dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM dependencies AS build
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV APP_MODE=demo
RUN npm run build && npm run build:worker

FROM node:22-bookworm-slim AS web
WORKDIR /app
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
ENV APP_MODE=demo
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=build --chown=node:node /app/.next/standalone ./
USER node
EXPOSE 3000
CMD ["node", "server.js"]

FROM build AS production-dependencies
RUN npm prune --omit=dev

FROM node:22-bookworm-slim AS worker
WORKDIR /app
ENV NODE_ENV=production
ENV APP_MODE=demo
COPY --from=build --chown=node:node /app/dist/worker ./dist/worker
COPY --from=production-dependencies --chown=node:node /app/node_modules ./node_modules
USER node
EXPOSE 3001
CMD ["node", "dist/worker/apps/worker/index.js"]
