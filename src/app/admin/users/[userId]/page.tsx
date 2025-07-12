import { getUserById } from '@/lib/users-store';
import DetailsClientPage from './details-client-page';
import type { User } from '@/lib/types';

export default async function UserDetailsPage({ params }: { params: { userId: string } }) {
  const userId = params.userId;
  let user: User | undefined = undefined;

  if (userId) {
    const userData = await getUserById(userId);
    // Convert MongoDB document to plain object for client component
    user = userData ? JSON.parse(JSON.stringify(userData)) : undefined;
  }

  return <DetailsClientPage initialUser={user} />;
}
