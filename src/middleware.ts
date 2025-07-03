
import { auth } from '@/lib/auth';

export const runtime = "nodejs";

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};

export default auth;
