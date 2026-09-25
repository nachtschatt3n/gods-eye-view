# cberg packaging branch

This fork's default branch `cberg` carries only container packaging for
[bilawalsidhu/gods-eye-view](https://github.com/bilawalsidhu/gods-eye-view):

- `docker/Dockerfile`, `docker/.dockerignore` — overlaid onto an upstream release checkout
- `.github/workflows/container.yml` — weekly + manual build of the latest upstream
  release → `ghcr.io/nachtschatt3n/gods-eye-view:<version>` and `:<version>-b<YYYYMMDD>`

Deployed by `cberg-home-nextgen` at `kubernetes/apps/ai/gods-eye-view/`.
