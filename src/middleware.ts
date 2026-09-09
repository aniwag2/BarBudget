export { default } from 'next-auth/middleware';

// Protect the admin area + admin APIs. /admin/login is deliberately NOT matched
// so unauthenticated users can reach it; next-auth redirects here on failure
// (pages.signIn = '/admin/login').
export const config = {
  matcher: [
    '/admin',
    '/admin/bottles/:path*',
    '/admin/price-feed/:path*',
    '/api/admin/:path*',
  ],
};
