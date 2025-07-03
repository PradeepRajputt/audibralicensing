
'use client';
import { useEffect, useState } from 'react';
import DetailsClientPage from './details-client-page';
import { getUserById } from '@/lib/users-store';
import type { User } from '@/lib/types';

export default function UserDetailsPage({ params }: { params: { userId: string } }) {
  const [user, setUser] = useState<User | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getUserById(params.userId).then(userData => {
      setUser(userData ?? undefined);
      setIsLoading(false);
    });
  }, [params.userId]);

  if (isLoading) {
    return <div>Loading user details...</div>; // Or a skeleton loader
  }

  return <DetailsClientPage initialUser={user} userId={params.userId} />;
}
