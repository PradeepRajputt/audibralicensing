
import type { DefaultSession, User } from 'next-auth';
import type { JWT } from "next-auth/jwt"

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role?: string;
      youtubeChannelId?: string;
    } & DefaultSession['user'];
  }

  interface User {
      role?: string;
      youtubeChannelId?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    youtubeChannelId?: string;
  }
}
