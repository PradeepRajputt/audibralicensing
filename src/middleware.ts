import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import type { DecodedJWT } from './lib/types';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);
const AUTH_COOKIE_NAME = 'auth_token';

const PROTECTED_ROUTES = {
  creator: '/dashboard',
  admin: '/admin'
};

const PUBLIC_ROUTES = ['/login', '/register', '/'];

export async function middleware(req: NextRequest) {
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  const { pathname } = req.nextUrl;

  const isProtectedRoute = Object.values(PROTECTED_ROUTES).some(route => pathname.startsWith(route));
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  if (!token) {
    if (isProtectedRoute) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    return NextResponse.next();
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET) as { payload: DecodedJWT };
    const userRole = payload.role;

    if (isPublicRoute) {
      const redirectUrl = userRole === 'admin' ? new URL(PROTECTED_ROUTES.admin, req.url) : new URL(PROTECTED_ROUTES.creator, req.url);
      return NextResponse.redirect(redirectUrl);
    }

    if (pathname.startsWith(PROTECTED_ROUTES.admin) && userRole !== 'admin') {
      return NextResponse.redirect(new URL(PROTECTED_ROUTES.creator, req.url));
    }
    
    if (pathname.startsWith(PROTECTED_ROUTES.creator) && userRole !== 'creator') {
       return NextResponse.redirect(new URL(PROTECTED_ROUTES.admin, req.url));
    }

    return NextResponse.next();

  } catch (err) {
    console.error('JWT verification failed in middleware:', err);
    const response = NextResponse.redirect(new URL('/login', req.url));
    response.cookies.delete(AUTH_COOKIE_NAME);
    return response;
  }
}

export const config = {
  matcher: ['/((?!api/webhooks|_next/static|_next/image|favicon.ico).*)'],
};
