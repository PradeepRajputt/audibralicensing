
import { withAuth, type NextRequestWithAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(request: NextRequestWithAuth) {
    const { token } = request.nextauth;
    const { pathname } = request.nextUrl;

    if (pathname.startsWith('/admin') && token?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    if (pathname.startsWith('/dashboard') && token?.role !== 'creator') {
        // Allow admins to see creator dashboard, or redirect if not
        if (token?.role !== 'admin') {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
     pages: {
      signIn: '/login',
    },
  }
);

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*'],
};
