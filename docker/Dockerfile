# Container packaging for upstream bilawalsidhu/gods-eye-view (cberg fork).
# Build context = an upstream checkout at a release tag; this file is overlaid
# by .github/workflows/container.yml. Upstream ships no image of its own.
#
# Runtime is the Vite DEV server on purpose: in v0.1.x most /api/* providers
# register only configureServer, so `vite preview` would drop them. Switch to
# build + preview once a release carries the server/ refactor (every provider
# gains configurePreviewServer there).
#
# No API keys at build time: GOOGLE_MAPS_API_KEY / CESIUM_ION_TOKEN are baked
# into the client by Vite `define`, so they must only ever come from the pod env.
FROM docker.io/library/node:24.21.0-bookworm-slim@sha256:0e0ff40c39bc087845bfb27465a0df4ea419520094bc35842ff83dd8cbe6f9b6 AS runtime

ENV NODE_ENV=development \
    PUPPETEER_SKIP_DOWNLOAD=1 \
    HOST=0.0.0.0 \
    PORT=4173

RUN apt-get update \
    && apt-get upgrade -y --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --chown=node:node package.json package-lock.json ./
# Drop dev-only tooling (sharp/puppeteer/prettier) and lift vulnerable
# transitive deps within their major — see docker/harden-deps.mjs. The lockfile
# is re-resolved, so this is `npm install`, not `npm ci`; the resolved tree is
# printed for the build log.
COPY .cberg/harden-deps.mjs /tmp/harden-deps.mjs
RUN node /tmp/harden-deps.mjs \
    && npm install --no-audit --no-fund \
    && (npm ls vite ws nanoid postcss --all || true) \
    && rm /tmp/harden-deps.mjs \
    && npm cache clean --force \
    # the base image's GLOBAL npm is not touched by npm ci (self-built SOP trap 3)
    && npm install -g npm@latest \
    && npm cache clean --force

COPY --chown=node:node . .
RUN rm -rf .git .github .cberg pinokio .env .env.* \
    && mkdir -p .gev-cache .gev-logs node_modules/.vite node_modules/.vite-temp \
    && chown -R node:node .gev-cache .gev-logs node_modules/.vite node_modules/.vite-temp

USER node
EXPOSE 4173
CMD ["node", "node_modules/vite/bin/vite.js", "--host", "0.0.0.0", "--port", "4173", "--strictPort"]
