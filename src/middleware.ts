
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This middleware is a pass-through as auth is removed.
export function middleware(req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  // Match all routes except for API, static files, and image optimization
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
