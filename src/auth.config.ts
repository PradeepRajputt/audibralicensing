
import type { NextAuthConfig } from 'next-auth';
 
export const authConfig = {
  pages: {
    signIn: '/login',
    error: '/login', // Redirect to login page on auth errors
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const role = auth?.user?.role;
      const { pathname } = nextUrl;

      const isApiRoute = pathname.startsWith('/api/');
      const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register');
      const isProtectedRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/admin');

      if (isApiRoute) {
        return true;
      }
      
      if (isProtectedRoute) {
        if (!isLoggedIn) {
            // Redirect unauthenticated users to login page, preserving the return URL
            const callbackUrl = nextUrl.pathname + nextUrl.search;
            const encodedCallbackUrl = encodeURIComponent(callbackUrl);
            return Response.redirect(new URL(`/login?callbackUrl=${encodedCallbackUrl}`, nextUrl));
        }
        
        // Role-based access control
        if (pathname.startsWith('/admin') && role !== 'admin') {
            return Response.redirect(new URL('/dashboard', nextUrl));
        }
        if (pathname.startsWith('/dashboard') && role !== 'creator') {
            return Response.redirect(new URL('/admin', nextUrl));
        }

        // User is logged in and has the correct role
        return true;
      } 
      
      if (isAuthRoute) {
        if (isLoggedIn) {
            // Redirect logged-in users away from auth routes to their respective dashboards
            const targetPath = role === 'admin' ? '/admin' : '/dashboard';
            return Response.redirect(new URL(targetPath, nextUrl));
        }
      }

      // Allow all other public routes
      return true;
    },
    jwt({ token, user }) {
        if (user) {
          token.id = user.id;
          token.role = user.role;
        }
        return token;
      },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as 'creator' | 'admin';
      }
      return session;
    },
  },
  providers: [], // Providers are defined in the main auth.ts file
} satisfies NextAuthConfig;
