
import DetailsClientPage from './details-client-page';
import { getUserById } from '@/lib/users-store';

export default function UserDetailsPage({ params }: { params: { userId: string } }) {
  // This is now a lightweight Server Component that fetches the initial data.
  // The client component will handle state and updates.
  const user = getUserById(params.userId);

  return <DetailsClientPage initialUser={user || undefined} userId={params.userId} />;
}
