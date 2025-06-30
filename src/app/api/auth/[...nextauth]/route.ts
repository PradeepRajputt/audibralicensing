
import NextAuth, { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from "next-auth/providers/credentials";
import { getUserByEmail } from '@/lib/users';
import { verifyPassword } from '@/lib/auth';
import { config } from 'dotenv';

config();

// --- STARTUP VALIDATION ---
if (!process.env.NEXTAUTH_SECRET) {
  console.error("CRITICAL: Missing NEXTAUTH_SECRET environment variable");
  throw new Error("Missing NEXTAUTH_SECRET environment variable. The application cannot start securely.");
}
// --- END STARTUP VALIDATION ---


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
          // Returning null is the standard way to indicate failed authentication
          return null;
        }
        
        const user = getUserByEmail(credentials.email);
        
        if (!user || !user.passwordHash) {
          // User not found or has no password. Do not specify which for security.
          return null;
        }

        const isValid = await verifyPassword(credentials.password, user.passwordHash);

        if (!isValid) {
          // Incorrect password
          return null;
        }

        // Return a serializable user object for the session token on success
        return {
          id: user.uid,
          email: user.email,
          name: user.displayName,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
        if (user) {
            token.id = user.id;
            token.role = user.role;
        }
        return token;
    },
    session({ session, token }) {
        if (session.user) {
            session.user.id = token.id as string;
            session.user.role = token.role as string;
        }
        return session;
    },
  },
   pages: {
    signIn: '/login',
    error: '/login', // Redirect to login page on other errors
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
