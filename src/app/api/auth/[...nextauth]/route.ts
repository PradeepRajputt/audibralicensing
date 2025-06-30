
import NextAuth, { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from "next-auth/providers/credentials";
import { getUserByEmail } from '@/lib/firebase/firestore';
import { verifyPassword } from '@/lib/auth';
import { User } from '@/lib/firebase/types';


// --- STARTUP VALIDATION ---
if (!process.env.NEXTAUTH_SECRET) {
  throw new Error("Missing NEXTAUTH_SECRET environment variable");
}

if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
    console.warn("Firebase Admin credentials are not set. Authentication will not work.");
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
          return null;
        }
        
        // This function needs to handle a potential server cold start
        // so we check for the required env vars again
        if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
            console.error("Firebase Admin credentials missing. Cannot authorize user.");
            throw new Error("Server is not configured for authentication.");
        }
        
        const user = await getUserByEmail(credentials.email);
        
        if (!user || !user.passwordHash) {
          return null;
        }

        const isValid = await verifyPassword(credentials.password, user.passwordHash);

        if (!isValid) {
          return null;
        }

        // Return a serializable user object
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
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
