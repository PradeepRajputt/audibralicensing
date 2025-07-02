
import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register');
  const isProtectedRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/admin');

  if (isAuthRoute && isLoggedIn) {
    const targetPath = req.auth?.user.role === 'admin' ? '/admin' : '/dashboard';
    return NextResponse.redirect(new URL(targetPath, req.url));
  }

  if (isProtectedRoute && !isLoggedIn) {
    let from = pathname;
    if (req.nextUrl.search) {
      from += req.nextUrl.search;
    }
 
    return NextResponse.redirect(
      new URL(`/login?from=${encodeURIComponent(from)}`, req.url)
    );
  }

  return NextResponse.next();
});

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
