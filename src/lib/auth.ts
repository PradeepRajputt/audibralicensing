
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import clientPromise from "./mongodb"
import { getUserByEmail, getUserById } from "./users-store"
import type { User } from './types';

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
          } as any; // Cast to `any` to satisfy NextAuth's User type, we'll add custom fields in callbacks
        }

        return null;
      },
    }),
  ],
  callbacks: {
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
