
import StrikeDetailsClientPage from './details-client-page';
import { getReportById } from '@/lib/reports-store';

export default async function StrikeDetailsPage({ params }: { params: { strikeId: string } }) {
  const strike = await getReportById(params.strikeId);

  return <StrikeDetailsClientPage initialStrike={strike} />;
}
