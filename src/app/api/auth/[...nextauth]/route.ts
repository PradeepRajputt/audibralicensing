
import NextAuth, { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from "next-auth/providers/credentials";
import { getUserByEmail } from '@/lib/firebase/firestore';
import { verifyPassword } from '@/lib/auth';


// --- STARTUP VALIDATION ---
if (!process.env.NEXTAUTH_SECRET) {
  throw new Error("Missing NEXTAUTH_SECRET environment variable");
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
        
        try {
            const user = await getUserByEmail(credentials.email);
            
            if (!user || !user.passwordHash) {
              throw new Error("No user found with this email or user has no password set.");
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
        } catch (error) {
            console.error("Login authorization failed:", error);
            // This will now catch the specific error from getFirebaseAdmin or other issues
            if (error instanceof Error) {
                throw new Error(error.message);
            }
            
            // Fallback for any other unexpected errors
            throw new Error('An unexpected error occurred during login.');
        }
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
