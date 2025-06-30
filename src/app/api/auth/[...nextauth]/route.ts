
import NextAuth, { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from "next-auth/providers/credentials";

// --- STARTUP VALIDATION ---
// This ensures the server fails with a clear error message if critical 
// environment variables are not set.
if (!process.env.NEXTAUTH_SECRET) {
  throw new Error('Missing NEXTAUTH_SECRET in .env file');
}
if (!process.env.NEXTAUTH_URL) {
  throw new Error('Missing NEXTAUTH_URL in .env file');
}
// --- END STARTUP VALIDATION ---

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "test@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        // This is a mock authorization. 
        // In a real app, you would look up the user in your database.
        if (
            (credentials?.email === "creator@example.com" && credentials.password === "password") ||
            (credentials?.email === "admin@creatorshield.com" && credentials.password === "password")
        ) {
          const is_admin = credentials.email.startsWith('admin');
          return { 
            id: is_admin ? "user_admin_xyz" : "user_creator_123", 
            name: is_admin ? "Admin User" : "Sample Creator", 
            email: credentials.email,
            role: is_admin ? "admin" : "creator",
          }
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
        session.user.role = token.role;
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
