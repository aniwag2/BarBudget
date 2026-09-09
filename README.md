# BarBudget

A self-hosted site that helps people **build a home bar on a budget** and browse
cocktails by the spirits they already own — and doubles as a price-comparison /
trending view for commercial bar managers.

BarBudget does **not** sell alcohol. It makes money via display ads (Google
AdSense) and outbound retailer **affiliate links**; all purchases happen on the
retailer's own site.

- **Framework:** Next.js (App Router, TypeScript), `output: 'standalone'`
- **DB:** self-hosted Postgres (Docker) via Prisma, with `pg_cron`, `pg_net`, `pg_trgm`
- **Auth:** NextAuth credentials provider (single admin)
- **Styling:** Tailwind CSS
- **Hosting:** Docker Compose (app + db only) behind a host-level Cloudflare Tunnel

---

## Architecture at a glance

```
Internet ── Cloudflare (TLS, public hostname)
              │
        cloudflared  (runs on the HOST, outside this stack — not managed here)
              │  http://localhost:3000
   ┌──────────┴───────────── docker compose ─────────────────────┐
   │  app  (Next.js standalone)  ── 127.0.0.1:3000 only           │
   │    │  internal docker network                                │
   │  db  (Postgres + pg_cron + pg_net + pg_trgm)  ── no host port │
   └──────────────────────────────────────────────────────────────┘
```

The `app` container publishes **only** to `127.0.0.1:3000`, so it is reachable by
the host's existing `cloudflared` process but not exposed to the LAN/internet.
The `db` container publishes **no** host port at all.

### Scheduled jobs

`pg_cron` can only run SQL, so the jobs schedule the work in Postgres but the
actual HTTP work lives in the app:

| Job | Schedule | What runs |
|-----|----------|-----------|
| `price-feed-sync` | daily 03:00 UTC | `pg_cron` → `pg_net` POST → `/api/cron/price-sync` → download affiliate feeds, fuzzy-match (`pg_trgm`), update prices |
| `ingredient-cache-refresh` | weekly Mon 04:00 UTC | `pg_cron` → `pg_net` POST → `/api/cron/ingredient-refresh` → walk TheCocktailDB ingredient list, refresh alcohol flags |
| `cocktail-cache-prune` | hourly | pure SQL cleanup of stale cached API responses |
| **backup** (`pg_dump`) | host crontab | `scripts/backup.sh` — *not* pg_cron; see [Backups](#backups) |

The cron endpoints are protected by a bearer `CRON_SECRET`. The app URL + secret
are read at run time from database GUCs set by `npm run cron:setup` (below), so
**no secret is baked into the image**.

---

## Quick start (local)

Requires Docker + Docker Compose.

```bash
cp .env.example .env
# Edit .env: set strong POSTGRES_PASSWORD, NEXTAUTH_SECRET (openssl rand -base64 32),
# CRON_SECRET (openssl rand -hex 32), ADMIN_EMAIL/ADMIN_PASSWORD.
# Keep POSTGRES_DB=barbudget (pg_cron is pinned to that database name).

docker compose up -d --build
```

On first boot the `db` container creates the extensions and schedules the cron
jobs; the `app` container runs `prisma migrate deploy` automatically (see
`scripts/docker-entrypoint.sh`) and then starts.

Then, one time:

```bash
# Seed sample data (categories, ~18 bottles, ingredient cache, admin user):
docker compose exec app npm run prisma:seed

# Inject the pg_cron runtime settings (app URL + CRON_SECRET) from env:
docker compose exec app npm run cron:setup
```

Open **http://localhost:3000**. Admin is at **/admin/login** (use
`ADMIN_EMAIL` / `ADMIN_PASSWORD`).

### Local development without Docker

```bash
npm install
# Point DATABASE_URL at a local Postgres, then:
npm run prisma:migrate:dev
npm run prisma:seed
npm run dev
```

For full functionality (`pg_cron`, `pg_net`, `pg_trgm`) use the Docker `db`
service — a stock local Postgres won't have those extensions. `pg_trgm` is the
only one the app queries directly (in price-sync).

---

## Pointing your domain at it (Cloudflare Tunnel)

Cloudflared is **not** part of this stack — it already runs on the host. To route
your custom domain to the app:

1. Cloudflare Zero Trust dashboard → **Networks → Tunnels** → your tunnel →
   **Public hostname**.
2. Add a hostname (e.g. `barbudget.example.com`) → Service `HTTP` →
   URL `http://localhost:3000`.
3. Set `NEXTAUTH_URL=https://barbudget.example.com` in `.env` and
   `docker compose up -d` to restart the app.

Cloudflare terminates TLS; the app only ever speaks plain HTTP on loopback.

---

## Environment variables

See [`.env.example`](.env.example) for the full annotated list. Highlights:

- `DATABASE_URL` — app → db connection (host is the compose service name `db`).
- `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`.
- `CRON_SECRET`, `APP_INTERNAL_URL` (`http://app:3000` inside the network).
- `NEXT_PUBLIC_ADSENSE_CLIENT_ID` + slot IDs (in-feed / sidebar / calculator).
- `COCKTAILDB_API_KEY` (falls back to public test key `1`), `COCKTAILDB_BASE_URL`.
  > The premium/supporter base URL + key path can differ from the free-tier
  > `/api/json/v1/1/` form — confirm the exact format in your account dashboard
  > and adjust `COCKTAILDB_BASE_URL` if needed.
- `AFFILIATE_FEEDS` — `retailer|network|format|url` entries, comma-separated.
  `AFFILIATE_FEED_AUTH_HEADER`, `PRICE_MATCH_THRESHOLD`.

---

## Affiliate price feeds

1. Apply to the retailers' affiliate programs. Total Wine and Wine.com both run
   programs, commonly via **FlexOffers** or **Rakuten** — confirm the current
   network + application details when you apply.
2. Once approved, add each product feed to `AFFILIATE_FEEDS`, e.g.:

   ```
   AFFILIATE_FEEDS=Total Wine|flexoffers|csv|https://feeds.example/tw.csv,Wine.com|rakuten|xml|https://feeds.example/wc.xml
   ```

3. The daily `price-sync` job downloads each feed into `price_feed_items`,
   fuzzy-matches product names to `bottles` with `pg_trgm`, updates prices for
   confident matches (`price_source = 'feed'`), and leaves the rest for
   **Admin → Review price feed**.

Feed field names vary a lot between networks; the parser in
[`src/lib/feeds.ts`](src/lib/feeds.ts) is tolerant/best-effort — expect to tune
the header/tag mapping once you see real feed data. Retailers without a feed
stay on manual pricing (`price_source = 'manual'`).

You can trigger a sync manually:

```bash
docker compose exec db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
  -c "SELECT cron.schedule('now-price', '* * * * *', $$SELECT 1$$);"  # or just call the endpoint:
curl -X POST http://127.0.0.1:3000/api/cron/price-sync -H "Authorization: Bearer $CRON_SECRET"
```

---

## Backups

`pg_dump` is a shell tool, not SQL, so it runs from the **host**, not pg_cron.

```bash
# add to the host crontab (host already runs cloudflared, so host cron is fine):
0 2 * * *  cd /path/to/BarBudget && ./scripts/backup.sh >> ./backups/backup.log 2>&1
```

`scripts/backup.sh` execs `pg_dump` inside the `db` container, writes a gzipped
dump to `./backups`, and prunes dumps older than `RETENTION_DAYS` (default 7).
Uncomment one line in the script's **OFFSITE COPY** section (rclone/rsync/scp)
to push dumps offsite — strongly recommended, since there's no managed-DB safety
net here.

Restore:

```bash
gunzip -c backups/barbudget-YYYYMMDD-HHMMSS.sql.gz \
  | docker compose exec -T db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"
```

---

## Migrations & seed

- Initial migration lives in `prisma/migrations/0000000000000_init`.
- `prisma migrate deploy` runs automatically on app container start.
- Create new migrations in dev with `npm run prisma:migrate:dev`.
- Re-seed (idempotent upserts) with `docker compose exec app npm run prisma:seed`.

---

## Data model

`categories`, `bottles`, `affiliate_links`, `price_feed_items` (feed staging),
`ingredient_cache` (TheCocktailDB alcohol flags), `ratings` (anonymous audience
scores, one vote per browser), `cocktail_api_cache` (server-side API cache), and
`admin_users`. See [`prisma/schema.prisma`](prisma/schema.prisma).

Audience score on a bottle = average of its `ratings` rows, to one decimal.

---

## Features

1. **Build-my-bar calculator** (`/`) — budget tier + owned categories → shopping
   list (essentials first, extras if budget allows) with a live running total.
2. **Cocktail search & ingredient filter** (`/cocktails`) — search by name; on a
   cocktail, alcoholic ingredients are clickable chips (checked against
   `ingredient_cache`), non-alcoholic ones are plain text; multi-select for an
   AND filter (`filter.php?i=A,B,C`); "shop this bottle" where an ingredient maps
   to a catalog bottle.
3. **Browse/filter catalog** (`/catalog`) — filter by category/tier/trending,
   sort by price/expert/audience.
4. **Bottle detail** (`/bottles/[id]`) — expert summary + score, audience rating
   form, retailer links, last price-check date, "used in these cocktails".
5. **Age gate** — cookie-based self-declared 21+ check.
6. **Automated price updates** — affiliate feed sync (above).
7. **Admin/curation** (`/admin`) — add/edit bottles & scores, review unmatched
   feed rows, override prices.
8. **Ads** — AdSense script in the root layout + in-feed / sidebar / calculator
   slots (env-configured; render as placeholders until IDs are set).

---

## Notes / deviations from a vanilla setup

- The `db` image is the **official `postgres:16` image plus** `pg_cron` (apt) and
  `pg_net` (compiled) — stock `postgres` ships none of these. If the `pg_net`
  build ever fails on your host, you can drop `pg_net` from
  `shared_preload_libraries`, remove the two HTTP cron jobs, and instead POST to
  the cron endpoints from the host crontab with `curl` (same auth header as the
  manual trigger above). `pg_net` version is pinned via the `PG_NET_VERSION`
  build arg in `db/Dockerfile`.
- Not in scope (by design): scraping retailer sites or review text, any
  alcohol checkout/payment flow, geolocated store-inventory lookup.
