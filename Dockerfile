# ── deps ──────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
# libc6-compat helps some native/musl edge cases; openssl lets Prisma detect the
# OpenSSL 3.x version and pick the correct musl engine.
RUN apk add --no-cache libc6-compat openssl
COPY package.json package-lock.json ./
RUN npm ci

# ── builder ───────────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache openssl
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Generate the Prisma client, then build the standalone Next.js server.
RUN npx prisma generate
ENV NEXT_TELEMETRY_DISABLED=1

# NEXT_PUBLIC_* are inlined into the client bundle at build time, so they must be
# present now (passed as build args from compose). AdSense publisher/slot IDs are
# public, not secrets.
ARG NEXT_PUBLIC_ADSENSE_CLIENT_ID=""
ARG NEXT_PUBLIC_ADSENSE_SLOT_INFEED=""
ARG NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR=""
ARG NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR=""
ENV NEXT_PUBLIC_ADSENSE_CLIENT_ID=$NEXT_PUBLIC_ADSENSE_CLIENT_ID \
    NEXT_PUBLIC_ADSENSE_SLOT_INFEED=$NEXT_PUBLIC_ADSENSE_SLOT_INFEED \
    NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR=$NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR \
    NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR=$NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR
RUN npm run build

# ── runner ────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN apk add --no-cache openssl && \
    addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

# Standalone server output (small: only traced runtime deps).
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Prisma client + engine + CLI so the container can run migrations & seed.
# Owned by nextjs so the CLI never hits a permission error at runtime.
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# The seed script needs bcryptjs. Next bundles it into the server chunks so it's
# not left as a resolvable package in the standalone node_modules; copy it back
# for the maintenance scripts (it has no dependencies of its own).
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/bcryptjs ./node_modules/bcryptjs

# Maintenance scripts (seed lives under prisma/; setup-cron lives here).
COPY --from=builder --chown=nextjs:nodejs /app/scripts ./scripts

COPY --chmod=755 scripts/docker-entrypoint.sh ./docker-entrypoint.sh

USER nextjs
EXPOSE 3000

# Applies `prisma migrate deploy`, then launches the standalone server.
ENTRYPOINT ["./docker-entrypoint.sh"]
