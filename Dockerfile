# syntax=docker/dockerfile:1.7

# Build the Vinext/Cloudflare Worker output in a Linux environment so the
# runtime image never depends on the host's node_modules directory.
FROM node:22-bookworm-slim AS build

WORKDIR /app

ENV npm_config_audit=false \
    npm_config_fund=false \
    npm_config_update_notifier=false

COPY package.json package-lock.json .npmrc ./
RUN npm ci

COPY . ./
RUN npm run build

# The application is a Cloudflare Worker. Wrangler + Miniflare provide the
# local Worker runtime, D1 and R2 implementation inside the container.
FROM node:22-bookworm-slim AS runtime

WORKDIR /app

ENV NODE_ENV=production \
    PORT=8787 \
    APP_ROOT=/app \
    STATE_DIR=/var/lib/4l-chapeau \
    RUNTIME_DIR=/tmp/4l-chapeau-runtime \
    CLOUDFLARE_CF_FETCH_ENABLED=false \
    WRANGLER_SEND_METRICS=false \
    WRANGLER_WRITE_LOGS=false \
    WRANGLER_LOG_PATH=/tmp/wrangler/logs \
    WRANGLER_REGISTRY_PATH=/tmp/wrangler/dev-registry \
    MINIFLARE_REGISTRY_PATH=/tmp/wrangler/registry \
    WRANGLER_CACHE_DIR=/tmp/wrangler/cache \
    WRANGLER_DISABLE_CONFIG_WATCHING=true \
    HOME=/tmp/4l-chapeau-home \
    XDG_CONFIG_HOME=/tmp/4l-chapeau-home/.config \
    XDG_DATA_HOME=/tmp/4l-chapeau-home/.local/share \
    XDG_STATE_HOME=/tmp/4l-chapeau-home/.local/state \
    XDG_CACHE_HOME=/tmp/4l-chapeau-home/.cache

RUN groupadd --system app && useradd --system --gid app --create-home app \
    && mkdir -p /var/lib/4l-chapeau /tmp/wrangler /tmp/4l-chapeau-home \
    && chown -R app:app /app /var/lib/4l-chapeau /tmp/wrangler /tmp/4l-chapeau-home

# Keep only the generated Worker, its runtime dependencies and D1 migrations.
# The build-only .openai metadata is deliberately not copied into this stage.
COPY --from=build --chown=app:app /app/node_modules ./node_modules
COPY --from=build --chown=app:app /app/dist ./dist
COPY --from=build --chown=app:app /app/drizzle ./drizzle
COPY --chown=app:app wrangler.docker.json ./wrangler.docker.json
COPY --chown=app:app docker/entrypoint.mjs /usr/local/bin/4l-chapeau-entrypoint.mjs

RUN rm -rf ./dist/.openai

USER app

EXPOSE 8787
VOLUME ["/var/lib/4l-chapeau"]

HEALTHCHECK --interval=30s --timeout=5s --start-period=35s --retries=3 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:8787/').then((response) => process.exit(response.ok ? 0 : 1)).catch(() => process.exit(1))"]

ENTRYPOINT ["node", "/usr/local/bin/4l-chapeau-entrypoint.mjs"]
