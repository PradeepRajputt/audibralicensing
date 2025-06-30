
import NextAuth, { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from "next-auth/providers/credentials";
import { getUserByEmail } from '@/lib/firebase/firestore';
import { verifyPassword } from '@/lib/auth';


// --- STARTUP VALIDATION ---
if (!process.env.NEXTAUTH_SECRET) {
  throw new Error("Missing NEXTAUTH_SECRET environment variable");
}

// In a real production environment, you would want to ensure NEXTAUTH_URL is set.
// if (process.env.NODE_ENV === "production" && !process.env.NEXTAUTH_URL) {
//   throw new Error("Missing NEXTAUTH_URL environment variable for production");
// }

if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
    console.warn("Firebase Admin credentials are not fully set. Authentication will not work. Please check your .env file.");
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
        
        // This function needs to handle a potential server cold start
        // so we check for the required env vars again
        if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
            console.error("Firebase Admin credentials missing. Cannot authorize user.");
            throw new Error("Authentication is not configured on the server.");
        }
        
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
