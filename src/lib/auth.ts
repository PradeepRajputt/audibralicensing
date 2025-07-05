
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import type { NextAuthConfig } from "next-auth"
import { getUserByEmail, createUser, linkAccount, getUserById } from './users-store';

export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: "openid https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/youtube.readonly"
        }
      }
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!account || !profile || !profile.email) {
        return false;
      }
      
      try {
        let dbUser = await getUserByEmail(profile.email);
        
        if (!dbUser) {
          // If no user, create one.
          const userRole = profile.email === 'admin@creatorshield.com' ? 'admin' : 'creator';
          dbUser = await createUser({
            name: profile.name,
            displayName: profile.name,
            email: profile.email,
            image: profile.picture,
            role: userRole,
          });
        }
        
        // Link the OAuth account to our user record
        await linkAccount({
          userId: dbUser.id,
          provider: account.provider,
          type: account.type,
          providerAccountId: account.providerAccountId,
          access_token: account.access_token,
          expires_at: account.expires_at,
          token_type: account.token_type,
          scope: account.scope,
          id_token: account.id_token,
          refresh_token: account.refresh_token
        });

        return true;

      } catch (error) {
        console.error("Error in signIn callback:", error);
        return false;
      }
    },
    async jwt({ token, user, account, profile }) {
        if (account && user) {
            // This is the initial sign-in
            token.accessToken = account.access_token;
            token.refreshToken = account.refresh_token;

            // Fetch user from our DB to get role and internal ID
            const dbUser = await getUserByEmail(user.email!);
            if (dbUser) {
                token.id = dbUser.id;
                token.role = dbUser.role;
                // Add any other user properties you want in the token
                token.youtubeChannelId = dbUser.youtubeChannelId;
            }
        }
        return token;
    },
    async session({ session, token }) {
        // Add custom properties to the session object
        session.user.id = token.id as string;
        session.user.role = token.role as 'creator' | 'admin';
        session.accessToken = token.accessToken as string;
        // Add any other user properties from the token to the session
        (session.user as any).youtubeChannelId = token.youtubeChannelId;
        return session;
    }
  },
  pages: {
    signIn: '/',
    error: '/', // Error code passed in query string
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
