
import DetailsClientPage from './details-client-page';
import { getUserById } from '@/lib/users-store';

export default function UserDetailsPage({ params }: { params: { userId: string } }) {
  const user = getUserById(params.userId);

  // We find the user on the server and pass the data to the client component.
  // This avoids accessing `params` directly in a client component, resolving a hydration warning.
  return <DetailsClientPage user={user} />;
}
