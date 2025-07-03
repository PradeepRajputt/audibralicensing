
import DetailsClientPage from './details-client-page';
import { getUserById } from '@/lib/users-store';
import type { User } from '@/lib/types';

export default async function UserDetailsPage({ params }: { params: { userId: string } }) {
  const dbUser = await getUserById(params.userId);
  
  // Sanitize data before passing to client component by creating a plain object
  const user = dbUser ? JSON.parse(JSON.stringify(dbUser)) as User : undefined;

  return <DetailsClientPage initialUser={user} userId={params.userId} />;
}
