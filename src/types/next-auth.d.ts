
import type { DefaultSession, User as DefaultUser } from 'next-auth';
import type { JWT as DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      id: string;
      role: 'creator' | 'admin';
      youtubeChannelId?: string;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
      role: 'creator' | 'admin';
      youtubeChannelId?: string;
  }
}

declare module 'next-auth/jwt' {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT extends DefaultJWT {
    id: string;
    role: 'creator' | 'admin';
    youtubeChannelId?: string;
  }
}
