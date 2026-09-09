#!/bin/sh
set -e

# Apply any pending migrations before the server accepts traffic. The db
# service is gated by a healthcheck in compose, so it's reachable by now.
echo "[entrypoint] Applying database migrations (prisma migrate deploy)..."
node node_modules/prisma/build/index.js migrate deploy

echo "[entrypoint] Starting Next.js standalone server on ${HOSTNAME}:${PORT}..."
exec node server.js
