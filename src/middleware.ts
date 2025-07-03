
import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};

export default auth((req) => {
  const { nextUrl } = req;
  const session = req.auth;

  const isApiRoute = nextUrl.pathname.startsWith('/api');
  const isAdminRoute = nextUrl.pathname.startsWith('/admin');
  const isDashboardRoute = nextUrl.pathname.startsWith('/dashboard');

  if (isApiRoute) {
    return NextResponse.next();
  }

  if (!session?.user) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminRoute && session.user.role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  if (isDashboardRoute && session.user.role === 'admin') {
     return NextResponse.redirect(new URL('/admin/users', req.url));
  }
  
  return NextResponse.next();
});
