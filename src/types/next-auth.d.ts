
import type { DefaultSession, DefaultUser } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: 'creator' | 'admin';
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
     role: 'creator' | 'admin';
  }
}
