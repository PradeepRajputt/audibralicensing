
import DetailsClientPage from './details-client-page';

export default function UserDetailsPage({ params }: { params: { userId: string } }) {
  // We pass the userId to the client component, which will fetch and manage its own state.
  return <DetailsClientPage userId={params.userId} />;
}
