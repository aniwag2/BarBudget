import { getServerSession } from 'next-auth';
import { authOptions } from './auth';

// Defense-in-depth alongside middleware: route handlers call this and bail with
// 401 if the caller isn't the authenticated admin.
export async function isAdmin(): Promise<boolean> {
  const session = await getServerSession(authOptions);
  return (session?.user as { role?: string } | undefined)?.role === 'admin';
}
