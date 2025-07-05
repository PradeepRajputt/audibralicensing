
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// No authentication system is in place, so the middleware allows all requests.
// This is ready for you to add your own auth logic in the future.
export function middleware(req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  // This matcher is kept to demonstrate where route protection *would* apply.
  matcher: ['/((?!api/webhooks|_next/static|_next/image|favicon.ico).*)'],
};
