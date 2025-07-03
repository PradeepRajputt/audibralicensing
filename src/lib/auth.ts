
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import clientPromise from "./mongodb"
import { getUserByEmail } from "./users-store"
import { NextResponse } from 'next/server'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: MongoDBAdapter(clientPromise, { databaseName: "creator_shield_db" }),
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (typeof credentials.email !== 'string' || typeof credentials.password !== 'string') {
          return null;
        }

        const user = await getUserByEmail(credentials.email);
        
        // This is a mock password check. In a real app, use a library like bcrypt to compare hashes.
        if (user && user.passwordHash === credentials.password) {
          // Return a user object that NextAuth can use
          return {
            id: user.uid,
            name: user.displayName,
            email: user.email,
            role: user.role,
            image: user.avatar,
            youtubeChannelId: user.youtubeChannelId,
          } as any;
        }

        return null;
      },
    }),
  ],
  callbacks: {
    authorized({ request: req, auth: session }) {
      const { nextUrl } = req;
      const isLoggedIn = !!session?.user;

      const isAdminRoute = nextUrl.pathname.startsWith('/admin');
      const isDashboardRoute = nextUrl.pathname.startsWith('/dashboard');

      if (isLoggedIn) {
        if (isAdminRoute && session.user.role !== 'admin') {
          return NextResponse.redirect(new URL('/dashboard', req.url));
        }
        if (isDashboardRoute && session.user.role === 'admin') {
          return NextResponse.redirect(new URL('/admin', req.url));
        }
        return true;
      }

      // If not logged in, `authorized` returns false by default,
      // which redirects to the login page.
      return false;
    },
    async jwt({ token, user }) {
        if (user) {
            token.uid = user.id;
            // @ts-ignore
            token.role = user.role;
            // @ts-ignore
            token.youtubeChannelId = user.youtubeChannelId;
        }
        return token;
    },
    async session({ session, token }) {
        if (session.user) {
            session.user.id = token.uid as string;
            // @ts-ignore
            session.user.role = token.role;
            // @ts-ignore
            session.user.youtubeChannelId = token.youtubeChannelId;
        }
        return session;
    },
  },
  pages: {
    signIn: '/login',
  },
});
