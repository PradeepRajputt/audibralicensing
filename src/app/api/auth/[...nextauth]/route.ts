
import NextAuth, { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from "next-auth/providers/credentials";
import { getUserByEmail, verifyPassword } from '@/lib/auth';

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || 'your_default_secret_for_development_ creatorshield',
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
          // Returning null is the standard way to indicate a failed login attempt to NextAuth
          return null;
        }
        
        const user = await getUserByEmail(credentials.email);
            
        if (!user) {
          console.log('No user found with email:', credentials.email);
          return null; // User not found
        }

        const isValid = await verifyPassword(credentials.password, user.passwordHash);

        if (!isValid) {
          console.log('Invalid password for user:', credentials.email);
          return null; // Invalid credentials
        }

        if (user.status !== 'active') {
          console.log(`Login attempt for disabled account: ${user.email} (${user.status})`);
          // Throw a specific error for non-active accounts to provide better user feedback
          throw new Error(`Your account is currently ${user.status}. Please contact support or request reactivation.`);
        }

        // Return a serializable user object for the session token on success
        return {
          id: user.uid,
          email: user.email,
          name: user.displayName,
          role: user.role,
          youtubeChannelId: user.youtubeChannelId,
        };
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
