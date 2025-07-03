
import { NextResponse, type NextRequest } from 'next/server';
import { admin } from '@/lib/firebase-admin';
import { getUserById } from '@/lib/users-store';

const SESSION_COOKIE_NAME = 'session';

async function verifySession(request: NextRequest) {
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionCookie) {
    return null;
  }

  try {
    const decodedToken = await admin.auth().verifySessionCookie(sessionCookie, true);
    const userRecord = await getUserById(decodedToken.uid);
    if (!userRecord) return null;
    return userRecord; // Return the full user object from Firestore
  } catch (error) {
    console.warn('Invalid session cookie:', error);
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const user = await verifySession(request);
  const isProtected = pathname.startsWith('/admin') || pathname.startsWith('/dashboard');

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('callbackUrl', request.nextUrl.href);
    return NextResponse.redirect(url);
  }

  if (user) {
    if (pathname.startsWith('/admin') && user.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    if (pathname.startsWith('/dashboard') && user.role !== 'creator') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    if (pathname === '/login' || pathname === '/register') {
        const redirectPath = user.role === 'admin' ? '/admin' : '/dashboard';
        return NextResponse.redirect(new URL(redirectPath, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
