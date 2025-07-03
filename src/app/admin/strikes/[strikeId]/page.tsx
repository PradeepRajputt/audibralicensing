
import StrikeDetailsClientPage from './details-client-page';
import { getReportById } from '@/lib/reports-store';
import type { Report } from '@/lib/types';

export default async function StrikeDetailsPage({ params }: { params: { strikeId: string } }) {
  const strikeData = await getReportById(params.strikeId);
  // Sanitize data before passing to client component
  const strike = strikeData ? JSON.parse(JSON.stringify(strikeData)) as Report : undefined;

  return <StrikeDetailsClientPage initialStrike={strike} />;
}
