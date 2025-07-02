
import type { DefaultSession, User } from 'next-auth';

// By declaring an empty interface, we can use module augmentation to extend
// the built-in types from NextAuth.js.
// https://next-auth.js.org/getting-started/typescript
// We are adding the 'role' and 'id' properties to the session user and the user object.

declare module 'next-auth' {
  /**
   * Returned by `auth`, `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      id: string;
      role: 'creator' | 'admin';
    } & DefaultSession['user'];
  }

  interface User {
     role: 'creator' | 'admin';
  }
}
