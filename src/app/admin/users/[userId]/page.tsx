
import DetailsClientPage from './details-client-page';
import { getUserById } from '@/lib/users-store';

export default async function UserDetailsPage({ params }: { params: { userId: string } }) {
  const dbUser = await getUserById(params.userId);
  // Sanitize data before passing to client component
  const user = dbUser ? JSON.parse(JSON.stringify(dbUser)) : undefined;

  return <DetailsClientPage initialUser={user} userId={params.userId} />;
}
