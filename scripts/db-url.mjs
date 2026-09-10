// Single source of truth for the Prisma connection string.
//
// Building the URL from the individual POSTGRES_* vars (with proper percent-
// encoding) avoids the #1 self-hosting foot-gun: a special character in the
// password (@ : / # ? etc.) that breaks a hand-written DATABASE_URL and yields
// "invalid port number in database URL".
//
// Precedence:
//   1. If POSTGRES_USER/PASSWORD/DB are set (the Docker case), build + encode.
//   2. Otherwise fall back to a pre-set DATABASE_URL (non-Docker local dev).
export function resolveDatabaseUrl() {
  const { POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB } = process.env;

  if (POSTGRES_USER && POSTGRES_PASSWORD && POSTGRES_DB) {
    const host = process.env.DB_HOST || 'db';
    const port = process.env.DB_PORT || '5432';
    const user = encodeURIComponent(POSTGRES_USER);
    const pass = encodeURIComponent(POSTGRES_PASSWORD);
    const db = encodeURIComponent(POSTGRES_DB);
    return `postgresql://${user}:${pass}@${host}:${port}/${db}?schema=public`;
  }

  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;

  throw new Error(
    'No database config: set POSTGRES_USER/POSTGRES_PASSWORD/POSTGRES_DB (Docker) or DATABASE_URL (local dev).',
  );
}

// CLI mode: print the resolved URL so the entrypoint can `export` it.
// Use pathToFileURL for a correct cross-platform "is main module" check.
import { pathToFileURL } from 'node:url';
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.stdout.write(resolveDatabaseUrl());
}
