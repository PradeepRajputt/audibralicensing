
import NextAuth, { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { getUserById } from '@/lib/users-store';

// --- STARTUP VALIDATION ---
if (!process.env.NEXTAUTH_SECRET) {
  throw new Error('Missing NEXTAUTH_SECRET in .env file');
}
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.warn("Missing Google OAuth credentials in .env file. Google login will be disabled.");
}
// --- END STARTUP VALIDATION ---

const providers = [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // This is a mock authorization for demo purposes.
        // In a real app, you would look up the user in your database.
        if (credentials?.email === "creator@example.com" && credentials.password === "password") {
           return getUserById("user_creator_123") || null;
        }
        if (credentials?.email === "admin@creatorshield.com" && credentials.password === "password") {
           return { id: "admin_user_001", name: "Admin User", email: "admin@creatorshield.com", role: "admin" } as any;
        }
        // Return null if user data could not be retrieved
        return null
      }
    })
];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    providers.push(
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        })
    );
}

export const authOptions: NextAuthOptions = {
  providers,
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async session({ session, token }) {
      if (token?.role) {
        session.user.role = token.role as string;
      }
       if (token?.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user?.role) {
        token.role = user.role;
      }
      return token;
    }
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
