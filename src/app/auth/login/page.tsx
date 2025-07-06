'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const role = searchParams.get('role') || 'creator';

  const handleGoogleLogin = () => {
    const redirectAfterLogin = role === 'admin' ? '/admin/dashboard' : '/dashboard/overview'; // 🔁 updated
    router.push(`/api/auth/google?state=${encodeURIComponent(redirectAfterLogin)}`);
  };

  return (
    <div className="flex items-center justify-center h-screen bg-background text-foreground">
      <div className="text-center p-16 border-2 rounded-lg border-primary shadow-2xl max-w-lg w-full scale-110">
        <div className="flex items-center justify-center mb-6">
          {/* Shield icon SVG */}
          <span className="mr-3">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 3L4 6V11C4 16.52 7.82 21.13 12 22C16.18 21.13 20 16.52 20 11V6L12 3Z" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="text-4xl font-extrabold tracking-wide">CreatorShield</span>
        </div>
        <p className="mb-10 text-xl text-muted-foreground">
          Sign in with your Google account to access your {role} dashboard.
        </p>
        <Button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-2 py-6 text-base font-semibold bg-white text-black rounded-lg shadow hover:bg-blue-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
        >
          <img
            src="https://developers.google.com/identity/images/g-logo.png"
            alt="Google logo"
            width={24}
            height={24}
            className="ml-2 mr-4"
          />
          Sign in with Google
        </Button>
      </div>
    </div>
  );
}