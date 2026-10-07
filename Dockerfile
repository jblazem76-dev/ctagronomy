# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# ctagronomy-app — container image for Azure Container Apps
#
# Azure Container Apps injects the listening port via the $PORT environment
# variable (commonly 8080). Your application MUST bind to process.env.PORT on
# host 0.0.0.0. Most Node frameworks already do the right thing:
#   - Next.js:  `next start` honors $PORT and $HOSTNAME
#   - Express:  `app.listen(process.env.PORT || 8080, '0.0.0.0')`
#   - Vite:     `vite preview --host 0.0.0.0 --port $PORT`
#
# This is a general-purpose Node.js build. The repo did not yet contain
# application code when this file was generated, so once your real app is in
# place, confirm the assumptions marked "ADAPT" below and adjust if needed.
# (If the stack turns out NOT to be Node — e.g. Python/FastAPI — replace this
# file entirely; see the notes at the bottom.)
# ---------------------------------------------------------------------------

ARG NODE_VERSION=22

# ---- deps: install ALL dependencies (incl. dev) for the build ----
FROM node:${NODE_VERSION}-alpine AS deps
WORKDIR /app
# ADAPT: uses npm + package-lock.json. Switch to yarn/pnpm if that's your tool.
COPY package.json package-lock.json* ./
RUN npm ci

# ---- build: compile the app (no-op if there is no "build" script) ----
FROM node:${NODE_VERSION}-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build --if-present

# ---- runtime: production-only dependencies + build output ----
FROM node:${NODE_VERSION}-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
# Container Apps overrides $PORT at runtime; 8080 is the default for local runs.
ENV PORT=8080
# Bind to all interfaces (Next.js standalone and many servers read $HOSTNAME).
ENV HOSTNAME=0.0.0.0

COPY --from=build --chown=node:node /app /app
# Drop dev dependencies from the image.
RUN npm prune --omit=dev && npm cache clean --force

USER node
EXPOSE 8080
# `npm start` runs server.mjs, which serves dist/ on $PORT.
CMD ["npm", "start"]

# ---------------------------------------------------------------------------
# Adaptation notes
#
# Next.js (recommended: standalone output for a much smaller image):
#   In next.config.js set `output: 'standalone'`, then in the runtime stage
#   copy only .next/standalone, .next/static and public, and run
#   `CMD ["node", "server.js"]` (server.js reads $PORT and $HOSTNAME).
#
# Static SPA (Vite/CRA build served by nginx):
#   Build in a node stage, then serve /dist from nginx:alpine. Note nginx must
#   be templated to listen on $PORT — Container Apps will not use 80 by
#   default. Alternatively serve with `npx serve -l $PORT dist`.
#
# Python (FastAPI/Flask/Django):
#   Replace with a python:3.12-slim base, `pip install -r requirements.txt`,
#   and CMD `uvicorn app:app --host 0.0.0.0 --port $PORT` (or gunicorn).
# ---------------------------------------------------------------------------
