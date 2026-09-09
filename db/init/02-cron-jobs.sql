-- Scheduled jobs (price-feed sync + ingredient-cache refresh).
--
-- pg_cron can only run SQL, so the actual HTTP work (downloading feeds, calling
-- TheCocktailDB, fuzzy matching) lives in the Next.js app. These jobs use pg_net
-- to POST to the app's internal /api/cron/* endpoints.
--
-- The app URL and shared secret are read at *run time* from database-level GUCs
-- (`app.internal_url`, `app.cron_secret`). They are NOT set here so no secret is
-- baked into the image; inject them once after the stack is up with:
--
--     docker compose exec app npm run cron:setup
--
-- which runs `ALTER DATABASE barbudget SET app.internal_url = ...` etc. from env.
-- current_setting() is evaluated when the job fires, so scheduling first / setting
-- the GUCs afterward is fine.

-- Daily 03:00 UTC — download affiliate feeds, fuzzy-match, update prices.
SELECT cron.schedule(
  'price-feed-sync',
  '0 3 * * *',
  $job$
    SELECT net.http_post(
      url     := current_setting('app.internal_url', true) || '/api/cron/price-sync',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || coalesce(current_setting('app.cron_secret', true), '')
      ),
      body    := '{}'::jsonb,
      timeout_milliseconds := 120000
    );
  $job$
);

-- Weekly Monday 04:00 UTC — refresh ingredient_cache from TheCocktailDB.
SELECT cron.schedule(
  'ingredient-cache-refresh',
  '0 4 * * 1',
  $job$
    SELECT net.http_post(
      url     := current_setting('app.internal_url', true) || '/api/cron/ingredient-refresh',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || coalesce(current_setting('app.cron_secret', true), '')
      ),
      body    := '{}'::jsonb,
      timeout_milliseconds := 120000
    );
  $job$
);

-- Hourly cleanup of stale cocktail API cache rows (older than 24h).
SELECT cron.schedule(
  'cocktail-cache-prune',
  '17 * * * *',
  $job$ DELETE FROM cocktail_api_cache WHERE fetched_at < now() - interval '24 hours'; $job$
);

-- NOTE: the nightly pg_dump backup is NOT a pg_cron job — pg_dump is a shell
-- tool, not SQL. It runs from the host via scripts/backup.sh (see README).
