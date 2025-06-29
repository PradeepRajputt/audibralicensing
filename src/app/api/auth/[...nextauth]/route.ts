
import NextAuth, { type NextAuthOptions } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import GoogleProvider from 'next-auth/providers/google';
import { google } from 'googleapis';

// --- STARTUP VALIDATION ---
// This is the critical fix. We check for the required environment variables when the server starts.
// If they are missing, we throw a clear error instead of letting the server crash later.
if (!process.env.GOOGLE_CLIENT_ID) {
  throw new Error('Missing GOOGLE_CLIENT_ID in .env file');
}
if (!process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error('Missing GOOGLE_CLIENT_SECRET in .env file');
}
if (!process.env.NEXTAUTH_SECRET) {
  throw new Error('Missing NEXTAUTH_SECRET in .env file');
}
if (!process.env.NEXTAUTH_URL) {
  // This is crucial for deployment, so NextAuth knows its public URL
  throw new Error('Missing NEXTAUTH_URL in .env file');
}
// --- END STARTUP VALIDATION ---


// This oAuth2Client will be used to refresh the access token.
const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

/**
 * Takes a token, and returns a new token with updated
 * `accessToken` and `accessTokenExpires`. If an error occurs,
 * returns the original token and an error property
 */
async function refreshAccessToken(token: JWT): Promise<JWT> {
  if (!token.refreshToken) {
    console.error('No refresh token available.');
    return { ...token, error: 'RefreshAccessTokenError' };
  }

  try {
    oAuth2Client.setCredentials({
      refresh_token: token.refreshToken,
    });

    const { credentials } = await oAuth2Client.refreshAccessToken();

    if (!credentials || !credentials.access_token) {
        throw new Error("Failed to refresh access token, credentials missing.");
    }
    
    return {
      ...token,
      accessToken: credentials.access_token,
      accessTokenExpires: credentials.expiry_date ? credentials.expiry_date : Date.now() + 3600 * 1000,
      refreshToken: credentials.refresh_token ?? token.refreshToken, // Fall back to old refresh token
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
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
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
        return {
            ...token,
            accessToken: account.access_token,
            accessTokenExpires: account.expires_at ? account.expires_at * 1000 : 0,
            refreshToken: account.refresh_token,
        };
      }

      // Return previous token if the access token has not expired yet
      if (token.accessTokenExpires && Date.now() < token.accessTokenExpires) {
        return token;
      }

      // Access token has expired, try to update it
      console.log('Access token expired, refreshing...');
      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.error = token.error;

      // Fetch YouTube channel ID here to keep JWT callback simple and stable
      if (session.accessToken && !session.user.youtubeChannelId) {
          try {
            const auth = new google.auth.OAuth2();
            auth.setCredentials({ access_token: session.accessToken });
            const youtube = google.youtube({ version: 'v3', auth });

            const response = await youtube.channels.list({
              mine: true,
              part: ['id'],
            });
            const channelId = response.data.items?.[0]?.id;
            if (channelId) {
              session.user.youtubeChannelId = channelId;
            }
          } catch (error) {
              console.error("Could not fetch YouTube Channel ID for session.", error);
              // Don't fail the session, just note the error.
          }
      }

      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
