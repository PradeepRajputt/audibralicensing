
import NextAuth, { type NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { google } from 'googleapis';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
          scope:
            'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/youtube.readonly',
        },
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, account }) {
      if (account?.access_token) {
        token.accessToken = account.access_token;
        
        // Fetch YouTube channel ID after successful login
        try {
          const auth = new google.auth.OAuth2();
          auth.setCredentials({ access_token: account.access_token });
          const youtube = google.youtube({ version: 'v3', auth });
          const response = await youtube.channels.list({
            mine: true,
            part: ['id'],
          });
          const channelId = response.data.items?.[0]?.id;
          if (channelId) {
            token.youtubeChannelId = channelId;
          }
        } catch (error) {
            console.error("Error fetching YouTube channel ID:", error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token.accessToken) {
        session.accessToken = token.accessToken;
      }
      if (token.youtubeChannelId) {
        session.user.youtubeChannelId = token.youtubeChannelId;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
