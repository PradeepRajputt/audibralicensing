
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import { getUserByEmail } from '@/lib/users-store';
import bcrypt from 'bcryptjs';
import { authConfig } from './auth.config';

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const validatedCredentials = z
          .object({ email: z.string().email(), password: z.string() })
          .safeParse(credentials);

        if (validatedCredentials.success) {
          const { email, password } = validatedCredentials.data;
          const user = await getUserByEmail(email);
          
          if (!user || !user.passwordHash) return null;

          // Add a check for user status
          if (user.status !== 'active') {
            // Returning null will cause a CredentialsSignin error,
            // which we can catch to provide a specific message.
            // We can throw a custom error here to be more specific.
            if (user.status === 'deactivated') {
                throw new Error('Your account has been deactivated. Please contact support.');
            }
            if (user.status === 'suspended') {
                 throw new Error('Your account is temporarily suspended.');
            }
          }

          const passwordsMatch = await bcrypt.compare(password, user.passwordHash);
          
          if (passwordsMatch) {
            return { id: user.uid, name: user.displayName, email: user.email, role: user.role, image: user.avatar };
          }
        }
        return null;
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  secret: process.env.AUTH_SECRET,
});
