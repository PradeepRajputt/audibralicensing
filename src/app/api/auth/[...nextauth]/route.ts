
import NextAuth, { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from "next-auth/providers/credentials";
import { getUserById } from '@/lib/users-store';

// --- STARTUP VALIDATION ---
if (!process.env.NEXTAUTH_SECRET) {
  throw new Error('Missing NEXTAUTH_SECRET in .env file');
}
// --- END STARTUP VALIDATION ---

export const authOptions: NextAuthOptions = {
  providers: [
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
  ],
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
