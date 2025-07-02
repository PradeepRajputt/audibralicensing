
import type { NextAuthConfig } from 'next-auth';
 
export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const role = auth?.user?.role;
      const { pathname } = nextUrl;

      const isProtectedRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/admin');
      const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register');
      
      if (isProtectedRoute) {
        if (!isLoggedIn) {
            // Redirect unauthenticated users to login page
            let from = pathname;
            if (nextUrl.search) {
              from += nextUrl.search;
            }
            const loginUrl = new URL('/login', nextUrl);
            loginUrl.searchParams.set('from', encodeURIComponent(from));
            
            return Response.redirect(loginUrl);
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
            // Redirect logged-in users away from auth routes
            const targetPath = role === 'admin' ? '/admin' : '/dashboard';
            return Response.redirect(new URL(targetPath, nextUrl));
        }
      }

      // Allow all other routes
      return true;
    },
    jwt({ token, user }) {
        if (user) {
          token.id = user.id;
          // @ts-ignore
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
  providers: [], // Providers are not to be included in auth.config
} satisfies NextAuthConfig;
