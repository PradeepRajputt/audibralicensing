
import { auth } from '@/auth';
 
// The `auth` middleware is the simplest way to protect pages.
// It will automatically redirect users to the login page if they are not authenticated.
export default auth;
 
// The matcher configures which routes the middleware will run on.
export const config = {
  // We are using the recommended matcher from the NextAuth.js documentation.
  // This will protect all routes except for those starting with /api, /_next/static,
  // /_next/image, and favicon.ico.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
