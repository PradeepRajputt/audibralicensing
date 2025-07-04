
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This middleware is now simplified to allow all requests through
// without authentication checks, as requested for testing purposes.
export function middleware(req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  // This will run the middleware on all routes except for static assets
  // and internal Next.js paths.
  matcher: ['/((?!api/webhooks|_next/static|_next/image|favicon.ico).*)'],
};
