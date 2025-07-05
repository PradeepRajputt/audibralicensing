
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This middleware is now mostly a pass-through.
// Auth-based routing logic has been moved to client components and layouts
// using the `useAuth` hook, which is compatible with a client-side Firebase Auth.
export function middleware(req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  // Match all routes except for API, static files, and image optimization
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
