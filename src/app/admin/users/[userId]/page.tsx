
import DetailsClientPage from './details-client-page';
import { getUserById } from '@/lib/users-store';

export default async function UserDetailsPage({ params }: { params: { userId: string } }) {
  const user = await getUserById(params.userId);

  return <DetailsClientPage initialUser={user} userId={params.userId} />;
}
