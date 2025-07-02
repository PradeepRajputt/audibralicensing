
import { getReportById } from '@/lib/reports-store';
import { getUserById } from '@/lib/users-store';
import ConsentFormClient from './consent-form-client';

export const dynamic = 'force-dynamic';

export default async function YouTubeConsentPage({ params }: { params: { strikeId: string } }) {
  const report = await getReportById(params.strikeId);

  if (!report || report.platform !== 'youtube') {
    return (
        <div className="p-4 md:p-6">
            <h1 className="text-xl font-bold">Invalid Request</h1>
            <p className="text-muted-foreground">This report is either not found or is not for the YouTube platform.</p>
        </div>
    )
  }

  const creator = await getUserById(report.creatorId);

  if (!creator) {
     return (
        <div className="p-4 md:p-6">
            <h1 className="text-xl font-bold">Creator Not Found</h1>
            <p className="text-muted-foreground">The creator associated with this report could not be found.</p>
        </div>
    )
  }
  
  return <ConsentFormClient report={report} creator={creator} />;
}

