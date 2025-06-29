
import StrikeDetailsClientPage from './details-client-page';
import { getReportById } from '@/lib/reports-store';

export default function StrikeDetailsPage({ params }: { params: { strikeId: string } }) {
  const strike = getReportById(params.strikeId);

  // By making this a Server Component, we can fetch data on the server and pass it as a prop.
  // This resolves the Next.js warning about accessing `params` directly in a Client Component.
  return <StrikeDetailsClientPage initialStrike={strike} />;
}
