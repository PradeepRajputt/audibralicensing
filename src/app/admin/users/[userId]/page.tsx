
'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import DetailsClientPage from './details-client-page';
import { getUserById } from '@/lib/users-store';
import type { User } from '@/lib/types';
import { Loader2 } from 'lucide-react';

export default function UserDetailsPage() {
  const params = useParams();
  const userId = params.userId as string;

  const [user, setUser] = useState<User | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      getUserById(userId).then(userData => {
        setUser(userData);
        setIsLoading(false);
      });
    } else {
        setIsLoading(false);
    }
  }, [userId]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-full py-10"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
  }

  return <DetailsClientPage initialUser={user} />;
}
