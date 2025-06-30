
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
          throw new Error("Please provide both email and password.");
        }
        
        const user = await getUserByEmail(credentials.email);
            
        if (!user) {
          console.log('No user found with email:', credentials.email);
          throw new Error("No user found with this email.");
        }

        const isValid = await verifyPassword(credentials.password, user.passwordHash);

        if (!isValid) {
          console.log('Invalid password for user:', credentials.email);
          throw new Error("Invalid credentials. Please check your email and password.");
        }

        if (user.status !== 'active') {
          console.log(`Login attempt for disabled account: ${user.email} (${user.status})`);
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
