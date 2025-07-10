import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { NextAuthOptions } from "next-auth";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          scope:
            "openid email profile https://www.googleapis.com/auth/youtube.readonly",
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, user }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      // Add email and id to token
      if (user?.email) token.email = user.email;
      if (user?.id) token.sub = user.id;
      return token;
    },
    async session({ session, token, user }) {
      if (token?.accessToken) {
        session.user.accessToken = token.accessToken;
      }
      // Ensure email and id are always present
      if (token?.email) session.user.email = token.email;
      if (token?.sub) session.user.id = token.sub;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
