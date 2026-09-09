-- Runs once, on first cluster init, connected to POSTGRES_DB (barbudget).
-- shared_preload_libraries (pg_cron, pg_net) is already set via the image's
-- postgresql.conf.sample, so these CREATE EXTENSION calls succeed here.

-- Fuzzy matching of affiliate feed product names against catalog bottles.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Job scheduler. Its bookkeeping tables live in the `cron` schema of the
-- database named by cron.database_name (set to 'barbudget' in the image).
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- HTTP client so scheduled SQL can POST to the app's internal cron endpoints.
CREATE EXTENSION IF NOT EXISTS pg_net;
