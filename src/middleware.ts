
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import type { DecodedJWT } from './lib/types';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);
const AUTH_COOKIE_NAME = 'auth_token';

const PROTECTED_ROUTES = {
  creator: ['/dashboard'],
  admin: ['/admin']
};

export async function middleware(req: NextRequest) {
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  const { pathname } = req.nextUrl;
  
  const loginUrl = new URL('/login', req.url);
  
  if (!token) {
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }
  
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET) as { payload: DecodedJWT };
    const userRole = payload.role;

    if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
      const redirectUrl = userRole === 'admin' ? new URL('/admin', req.url) : new URL('/dashboard', req.url);
      return NextResponse.redirect(redirectUrl);
    }

    if (pathname.startsWith('/admin') && userRole !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    
    if (pathname.startsWith('/dashboard') && userRole !== 'creator') {
       return NextResponse.redirect(new URL('/admin', req.url));
    }

    return NextResponse.next();

  } catch (err) {
    console.error('JWT verification failed in middleware:', err);
    // Token is invalid, clear it and redirect to login
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete(AUTH_COOKIE_NAME);
    return response;
  }
}

export const config = {
  matcher: ['/((?!api/webhooks|_next/static|_next/image|favicon.ico).*)'],
};
