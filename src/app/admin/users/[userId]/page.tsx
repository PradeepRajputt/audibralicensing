
import DetailsClientPage from './details-client-page';
import { getUserById } from '@/lib/users';
import type { User } from '@/lib/firebase/types';

export default async function UserDetailsPage({ params }: { params: { userId: string } }) {
  // This is a server component that fetches the user data initially.
  const user = await getUserById(params.userId);
  
  // The client component receives the initial data and handles all interactions.
  return <DetailsClientPage initialUser={user || undefined} userId={params.userId} />;
}
