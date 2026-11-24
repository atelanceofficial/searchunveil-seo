# SearchUnveil with its server: reviews web pages by their address.
# No API keys, no accounts, no data kept. Build: docker build -t searchunveil .
# Run: docker run -p 8080:8080 searchunveil, then open http://localhost:8080

FROM node:24.22.3-alpine AS build
WORKDIR /app
# Dependencies first, so they are cached until the lockfile changes.
COPY package.json package-lock.json .npmrc ./
COPY packages/core/package.json packages/core/
COPY apps/web/package.json apps/web/
COPY apps/server/package.json apps/server/
RUN npm ci
COPY . .
RUN npm run build:server

FROM node:24.22.3-alpine AS runtime
ENV NODE_ENV=production HOST=0.0.0.0 PORT=8080
WORKDIR /app
# The server runs its TypeScript directly (Node's type stripping) and needs no dependency but
# the engine, which it finds through the workspace link recreated here.
COPY --from=build /app/package.json ./
COPY --from=build /app/packages/core/package.json packages/core/
COPY --from=build /app/packages/core/src packages/core/src
COPY --from=build /app/apps/server/package.json apps/server/
COPY --from=build /app/apps/server/src apps/server/src
COPY --from=build /app/apps/web/dist-server apps/web/dist-server
RUN mkdir -p node_modules/@searchunveil \
  && ln -s ../../packages/core node_modules/@searchunveil/core \
  && find packages apps -name '*.test.ts' -delete
USER node
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s CMD wget -qO- "http://127.0.0.1:${PORT}/api/health" || exit 1
CMD ["node", "apps/server/src/main.ts"]
