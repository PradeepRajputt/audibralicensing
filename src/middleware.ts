
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// With the removal of the real authentication system, the middleware's role is simplified.
// It no longer needs to check for tokens or roles.
// We keep the file for potential future use (e.g., logging, rate limiting).
export function middleware(req: NextRequest) {
  // Allow all requests to proceed.
  return NextResponse.next();
}

// The matcher is kept to demonstrate where route protection *would* apply.
export const config = {
  matcher: ['/((?!api/webhooks|_next/static|_next/image|favicon.ico).*)'],
};
