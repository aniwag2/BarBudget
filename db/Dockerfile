# Postgres for BarBudget: official image + pg_cron (scheduling) + pg_net (HTTP
# calls out to the app's /api/cron endpoints) + pg_trgm (fuzzy price matching,
# ships in contrib). pg_trgm needs no build step; it's created via init SQL.
#
# pg_cron and pg_net must be in shared_preload_libraries. We append that to the
# postgresql.conf *sample* so initdb bakes it into the generated config BEFORE
# the first (init-time) server starts — which is what lets `CREATE EXTENSION
# pg_cron` succeed inside the init scripts.
FROM postgres:16-bookworm

ARG PG_NET_VERSION=v0.14.0

RUN set -eux; \
    apt-get update; \
    apt-get install -y --no-install-recommends \
      postgresql-${PG_MAJOR}-cron \
      build-essential \
      git \
      ca-certificates \
      libcurl4-openssl-dev \
      postgresql-server-dev-${PG_MAJOR}; \
    # Build pg_net from source (not packaged in PGDG apt).
    git clone --depth 1 --branch "${PG_NET_VERSION}" https://github.com/supabase/pg_net.git /tmp/pg_net; \
    cd /tmp/pg_net; \
    make; \
    make install; \
    cd /; \
    rm -rf /tmp/pg_net; \
    # Trim build toolchain to keep the image lean.
    apt-get purge -y --auto-remove build-essential git postgresql-server-dev-${PG_MAJOR}; \
    rm -rf /var/lib/apt/lists/*; \
    # Preload both extensions + point pg_cron at the app database.
    echo "shared_preload_libraries='pg_cron,pg_net'" >> /usr/share/postgresql/${PG_MAJOR}/postgresql.conf.sample; \
    echo "cron.database_name='barbudget'" >> /usr/share/postgresql/${PG_MAJOR}/postgresql.conf.sample

# Init scripts run alphabetically on first cluster creation.
COPY init/ /docker-entrypoint-initdb.d/
