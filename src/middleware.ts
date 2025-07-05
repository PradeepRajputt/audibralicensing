
import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const session = await auth();
  const { pathname } = req.nextUrl;

  const isAuthRoute = pathname === '/';
  const isAdminRoute = pathname.startsWith('/admin');
  const isDashboardRoute = pathname.startsWith('/dashboard');

  if (session) {
    const userRole = session.user?.role;
    
    // If logged in and on the landing page, redirect to the appropriate dashboard
    if (isAuthRoute) {
        const redirectUrl = userRole === 'admin' ? '/admin' : '/dashboard';
        return NextResponse.redirect(new URL(redirectUrl, req.url));
    }

    // If an admin is trying to access a creator route, redirect them
    if (isDashboardRoute && userRole !== 'creator') {
        return NextResponse.redirect(new URL('/admin', req.url));
    }

    // If a creator is trying to access an admin route, redirect them
    if (isAdminRoute && userRole !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  } else {
    // If not logged in and trying to access a protected route, redirect to home
    if (isAdminRoute || isDashboardRoute) {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  // Match all routes except for API, static files, and image optimization
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
