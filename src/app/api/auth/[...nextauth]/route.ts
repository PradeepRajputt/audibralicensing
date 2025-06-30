
import NextAuth, { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from "next-auth/providers/credentials";
import { getUserByEmail } from '@/lib/users';
import { verifyPassword } from '@/lib/auth';

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<any> {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        
        try {
            const user = await getUserByEmail(credentials.email);
            
            // Check if user exists first
            if (!user || !user.passwordHash) {
              console.log('No user found with email:', credentials.email);
              return null;
            }

            // Then check if the account is active
            if (user.status !== 'active') {
              console.log(`Login attempt for disabled account: ${user.email} (${user.status})`);
              // Throwing a specific error that NextAuth can catch and display
              throw new Error(`Your account is currently ${user.status}. Please contact support.`);
            }

            // Finally, verify password
            const isValid = await verifyPassword(credentials.password, user.passwordHash);

            if (!isValid) {
              console.log('Invalid password for user:', credentials.email);
              return null;
            }

            // Return a serializable user object for the session token on success
            return {
              id: user.uid,
              email: user.email,
              name: user.displayName,
              role: user.role,
              youtubeChannelId: user.youtubeChannelId,
            };
        } catch (error) {
            console.error("Authorize Error:", error);
            // Re-throw the error to be handled by NextAuth's error page
            // This ensures specific messages (like 'account suspended') are shown.
            if (error instanceof Error) {
              throw new Error(error.message);
            }
            throw new Error('An unexpected error occurred during authentication.');
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
        if (user) {
            token.id = user.id;
            token.role = user.role;
            token.youtubeChannelId = (user as any).youtubeChannelId;
        }
        return token;
    },
    session({ session, token }) {
        if (session.user) {
            session.user.id = token.id as string;
            session.user.role = token.role as string;
            session.user.youtubeChannelId = token.youtubeChannelId as string | undefined;
        }
        return session;
    },
  },
   pages: {
    signIn: '/login',
    error: '/login', // Redirect to login page on credentials error, shows error in URL
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
