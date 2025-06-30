
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
          return null; // Basic validation
        }
        
        try {
            const user = await getUserByEmail(credentials.email);
            
            if (!user || !user.passwordHash) {
              // No user found or user has no password (e.g. social login in future)
              return null;
            }

            // Prevent login for non-active users
            if (user.status !== 'active') {
              console.log(`Login attempt for disabled account: ${user.email} (${user.status})`);
              // You can throw a specific error here to show a custom message on the login page
              // For now, returning null will result in a generic "Invalid credentials" error.
              return null;
            }

            const isValid = await verifyPassword(credentials.password, user.passwordHash);

            if (!isValid) {
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
            // Log any other unexpected errors during authorization
            console.error("Authorize Error:", error);
            return null;
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
    error: '/login', // Redirect to login page on credentials error
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
