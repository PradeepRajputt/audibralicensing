
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-for-prototype-at-least-32-chars-long');

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  const { pathname } = req.nextUrl;

  const isAuthRoute = pathname === '/login' || pathname === '/register';
  const isApiAuthRoute = pathname.startsWith('/api/auth');
  const isProtectedRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/admin');

  // Allow API auth routes to be accessed without a token
  if (isApiAuthRoute) {
    return NextResponse.next();
  }

  if (!token) {
    if (isProtectedRoute) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
        algorithms: ['HS256']
    });
    const userRole = payload.role as 'creator' | 'admin';

    if (isAuthRoute) {
        const redirectUrl = userRole === 'admin' ? '/admin' : '/dashboard';
        return NextResponse.redirect(new URL(redirectUrl, req.url));
    }

    if (pathname.startsWith('/admin') && userRole !== 'admin') {
      // Creator trying to access admin pages
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    if (pathname.startsWith('/dashboard') && userRole === 'admin') {
      // Admin trying to access creator dashboard
      return NextResponse.redirect(new URL('/admin', req.url));
    }
    
    return NextResponse.next();

  } catch (err) {
    // If token is invalid (expired, malformed, etc.), clear cookies and redirect to login
    const response = NextResponse.redirect(new URL('/login', req.url));
    response.cookies.delete('token');
    response.cookies.delete('user-data');
    return response;
  }
}

export const config = {
  matcher: ['/((?!api/webhooks|_next/static|_next/image|favicon.ico|models).*)'],
};
