
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { getUserById } from '@/lib/users-store';

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        userType: { label: "User Type", type: "text" },
      },
      async authorize(credentials) {
        // This is a mock authorization flow.
        // It signs in either the admin or a sample creator based on the button clicked on the login page.
        const userId = credentials?.userType === 'admin' ? 'user_admin_001' : 'user_creator_123';
        const user = await getUserById(userId);

        if (user) {
          // Return the user object to be encoded in the JWT
          return {
            id: user.uid,
            name: user.displayName,
            email: user.email,
            image: user.avatar,
            role: user.role,
            youtubeChannelId: user.youtubeChannelId,
          };
        }
        // Return null if user data could not be retrieved
        return null;
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    // The `jwt` callback is called when a JWT is created (i.e., on sign-in) 
    // or updated (i.e., whenever a session is accessed in the client).
    async jwt({ token, user }) {
      // The user object is only passed on the first call after a successful login.
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.youtubeChannelId = user.youtubeChannelId;
      }
      return token;
    },
    // The `session` callback is called whenever a session is checked.
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.youtubeChannelId = token.youtubeChannelId;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    // error: '/auth/error', // Optional: Custom error page
  },
});

export { handler as GET, handler as POST };
