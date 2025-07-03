
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-for-prototype');

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  const { pathname } = req.nextUrl;

  const isAuthRoute = pathname === '/login' || pathname === '/register';
  const isProtectedRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/admin');

  if (!token) {
    if (isProtectedRoute) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    return NextResponse.next();
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userRole = payload.role as 'creator' | 'admin';

    if (isAuthRoute) {
        const redirectUrl = userRole === 'admin' ? '/admin' : '/dashboard';
        return NextResponse.redirect(new URL(redirectUrl, req.url));
    }

    if (pathname.startsWith('/admin') && userRole !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    if (pathname.startsWith('/dashboard') && userRole === 'admin') {
      return NextResponse.redirect(new URL('/admin', req.url));
    }
    
    return NextResponse.next();

  } catch (err) {
    // If token is invalid, redirect to login
    const response = NextResponse.redirect(new URL('/login', req.url));
    if (isProtectedRoute) {
        // Clear invalid tokens
        response.cookies.delete('token');
        response.cookies.delete('user-data');
    }
    return response;
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|models).*)'],
};
