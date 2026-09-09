#!/bin/sh
# Nightly Postgres backup for BarBudget.
#
# pg_dump is a shell tool (not SQL), so this runs from the HOST, not pg_cron.
# It execs pg_dump inside the running `db` container and writes a gzipped dump
# to ./backups, keeping the last N days. Add to the host crontab, e.g.:
#
#   0 2 * * *  cd /path/to/BarBudget && ./scripts/backup.sh >> ./backups/backup.log 2>&1
#
# For offsite safety, extend the "OFFSITE COPY" section below (rclone/rsync/scp).
set -eu

RETENTION_DAYS="${RETENTION_DAYS:-7}"
BACKUP_DIR="${BACKUP_DIR:-./backups}"
COMPOSE="${COMPOSE:-docker compose}"

# Load POSTGRES_* from .env if present.
if [ -f .env ]; then
  # shellcheck disable=SC1091
  . ./.env
fi
DB_USER="${POSTGRES_USER:-barbudget}"
DB_NAME="${POSTGRES_DB:-barbudget}"

mkdir -p "$BACKUP_DIR"
STAMP="$(date +%Y%m%d-%H%M%S)"
OUT="$BACKUP_DIR/barbudget-$STAMP.sql.gz"

echo "[backup] Dumping $DB_NAME -> $OUT"
$COMPOSE exec -T db pg_dump -U "$DB_USER" -d "$DB_NAME" --no-owner --clean --if-exists \
  | gzip -9 > "$OUT"

echo "[backup] Pruning dumps older than ${RETENTION_DAYS} days"
find "$BACKUP_DIR" -name 'barbudget-*.sql.gz' -type f -mtime "+${RETENTION_DAYS}" -delete

# ── OFFSITE COPY (uncomment + configure one) ─────────────────────────────────
# rclone copy "$OUT" remote:barbudget-backups/
# rsync -az "$OUT" user@offsite-host:/backups/barbudget/
# scp "$OUT" user@offsite-host:/backups/barbudget/

echo "[backup] Done."
