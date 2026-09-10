#!/bin/sh
set -e

# Derive a correctly-encoded DATABASE_URL from POSTGRES_* so a special character
# in the password can never break the connection string. This becomes the URL
# used by both `prisma migrate deploy` and the Next.js server below.
DATABASE_URL="$(node scripts/db-url.mjs)"
export DATABASE_URL

# Apply any pending migrations before the server accepts traffic. The db
# service is gated by a healthcheck in compose, so it's reachable by now.
echo "[entrypoint] Applying database migrations (prisma migrate deploy)..."
node node_modules/prisma/build/index.js migrate deploy

echo "[entrypoint] Starting Next.js standalone server on ${HOSTNAME}:${PORT}..."
exec node server.js
