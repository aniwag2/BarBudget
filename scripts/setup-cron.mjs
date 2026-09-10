// One-time (idempotent) injection of pg_cron runtime settings.
//
// The cron job definitions in db/init/02-cron-jobs.sql read the app URL and
// shared secret from database-level GUCs at run time. This script sets those
// GUCs from environment variables so no secret is baked into the image.
//
// Run after the stack is up:  docker compose exec app npm run cron:setup
import { PrismaClient } from '@prisma/client';
import { resolveDatabaseUrl } from './db-url.mjs';

// Ensure a correctly-encoded connection string before the client connects.
process.env.DATABASE_URL = resolveDatabaseUrl();
const prisma = new PrismaClient();

function dbNameFromUrl(url) {
  try {
    const u = new URL(url);
    return decodeURIComponent(u.pathname.replace(/^\//, '')) || null;
  } catch {
    return null;
  }
}

async function main() {
  const dbName =
    process.env.POSTGRES_DB || dbNameFromUrl(process.env.DATABASE_URL || '') || 'barbudget';
  const internalUrl = process.env.APP_INTERNAL_URL || 'http://app:3000';
  const cronSecret = process.env.CRON_SECRET || '';

  if (!cronSecret) {
    console.warn('[cron:setup] WARNING: CRON_SECRET is empty — cron calls will be unauthenticated.');
  }

  // Identifiers can't be parameterized; dbName comes from our own env, and we
  // quote it. Values use pg's quote_literal via format() to stay injection-safe.
  const q = (s) => '"' + String(s).replace(/"/g, '""') + '"';

  await prisma.$executeRawUnsafe(
    `ALTER DATABASE ${q(dbName)} SET app.internal_url = ${escapeLiteral(internalUrl)}`,
  );
  await prisma.$executeRawUnsafe(
    `ALTER DATABASE ${q(dbName)} SET app.cron_secret = ${escapeLiteral(cronSecret)}`,
  );

  console.log(`[cron:setup] Set app.internal_url and app.cron_secret on database "${dbName}".`);
  console.log('[cron:setup] New cron job executions will use these values.');
}

function escapeLiteral(value) {
  return "'" + String(value).replace(/'/g, "''") + "'";
}

main()
  .catch((e) => {
    console.error('[cron:setup] Failed:', e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
