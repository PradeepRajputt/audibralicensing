import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public, auth, and static files
  if (
    pathname.startsWith('/auth') ||
    pathname === '/' ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/logo') ||
    pathname.startsWith('/public') ||
    pathname.startsWith('/api')
  ) {
    return NextResponse.next();
  }

  // Check for JWT in cookies (for SSR) or fallback to client-side check
  const jwt = request.cookies.get('creator_jwt')?.value;
  if (!jwt) {
    const loginUrl = new URL('/auth/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next|favicon.ico|logo.png|logo.svg|public|api|auth|$).*)',
  ],
}; 