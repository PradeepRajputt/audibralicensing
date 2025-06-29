
import NextAuth, { type NextAuthOptions } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import GoogleProvider from 'next-auth/providers/google';
import { google } from 'googleapis';

// Configure the Google OAuth2 client
const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.NEXTAUTH_URL
    ? `${process.env.NEXTAUTH_URL}/api/auth/callback/google`
    : 'http://localhost:9002/api/auth/callback/google'
);

/**
 * Uses the googleapis library to refresh the access token.
 * This is a more robust method than manual fetching.
 */
async function refreshAccessToken(token: JWT): Promise<JWT> {
  if (!token.refreshToken) {
    console.error('No refresh token available for refreshing.');
    return { ...token, error: 'RefreshAccessTokenError' };
  }

  try {
    // Use the oAuth2Client to refresh the token
    oAuth2Client.setCredentials({
      refresh_token: token.refreshToken,
    });

    const { credentials } = await oAuth2Client.refreshAccessToken();
    
    // Check if we received the new credentials
    if (!credentials || !credentials.access_token || !credentials.expiry_date) {
        throw new Error("Failed to refresh access token, credentials missing.");
    }

    return {
      ...token,
      accessToken: credentials.access_token,
      accessTokenExpires: credentials.expiry_date,
      refreshToken: credentials.refresh_token ?? token.refreshToken, // Use new refresh token if provided
      error: undefined,
    };
  } catch (error) {
    console.error('Error refreshing access token:', error);
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
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
      // Initial sign in
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.accessTokenExpires = account.expires_at ? account.expires_at * 1000 : undefined;

        // Fetch YouTube channel ID only on initial sign in
        if (account.access_token) {
            try {
              // Use the configured oAuth2Client
              oAuth2Client.setCredentials({ access_token: account.access_token });
              const youtube = google.youtube({ version: 'v3', auth: oAuth2Client });
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
                // Don't block sign-in if this fails, just log it.
            }
        }
        return token;
      }

      // Return previous token if the access token has not expired yet
      if (token.accessTokenExpires && Date.now() < token.accessTokenExpires) {
        return token;
      }

      // Access token has expired, try to update it
      console.log('Access token has expired, refreshing...');
      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      if (token.youtubeChannelId) {
        session.user.youtubeChannelId = token.youtubeChannelId;
      }
      session.error = token.error;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
