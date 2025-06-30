
import NextAuth, { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from "next-auth/providers/credentials";
import { getUserByEmail } from '@/lib/users';
import { verifyPassword } from '@/lib/auth';


// --- STARTUP VALIDATION ---
if (!process.env.NEXTAUTH_SECRET) {
  console.error("CRITICAL: Missing NEXTAUTH_SECRET environment variable");
  // In a real production environment, you might want the app to fail hard.
  // For this context, we'll throw to make it clear during development.
  throw new Error("Missing NEXTAUTH_SECRET environment variable. The application cannot start securely.");
}
// --- END STARTUP VALIDATION ---


export const authOptions: NextAuthOptions = {
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
          throw new Error("Please enter your email and password.");
        }
        
        const user = getUserByEmail(credentials.email);
        
        if (!user) {
          throw new Error("No user found with this email.");
        }

        if (!user.passwordHash) {
            throw new Error("This account does not have a password set. Please use a different login method.");
        }

        const isValid = await verifyPassword(credentials.password, user.passwordHash);

        if (!isValid) {
          throw new Error("Incorrect password.");
        }

        // Return a serializable user object for the session token
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
    error: '/login', // Redirect to login page on error
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
