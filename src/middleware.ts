import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const session = await auth();
  const { pathname } = req.nextUrl;

  const isAdminRoute = pathname.startsWith('/admin');
  const isDashboardRoute = pathname.startsWith('/dashboard');

  if (!session) {
    if (isAdminRoute || isDashboardRoute) {
      return NextResponse.redirect(new URL('/', req.url));
    }
    return NextResponse.next();
  }

  const userRole = session.user?.role;
  
  if (isAdminRoute && userRole !== 'admin') {
     return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  if (isDashboardRoute && userRole !== 'creator') {
     return NextResponse.redirect(new URL('/admin', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
