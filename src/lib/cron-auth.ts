import { NextRequest } from 'next/server';

// Cron endpoints are called by pg_cron (via pg_net) with a bearer token that
// must match CRON_SECRET. Constant-time-ish compare on already-short strings.
export function isAuthorizedCron(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false; // fail closed if unconfigured
  const header = req.headers.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (token.length !== secret.length) return false;
  let mismatch = 0;
  for (let i = 0; i < secret.length; i++) mismatch |= token.charCodeAt(i) ^ secret.charCodeAt(i);
  return mismatch === 0;
}
