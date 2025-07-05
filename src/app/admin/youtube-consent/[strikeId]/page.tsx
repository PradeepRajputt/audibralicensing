
import { getReportById } from '@/lib/reports-store';
import { getUserById } from '@/lib/users-store';
import ConsentFormClient from './consent-form-client';
import type { Report, User } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function YouTubeConsentPage({ params }: { params: { strikeId: string } }) {
  // Although reports are from a mock store now, it's good practice to serialize
  const reportData = await getReportById(params.strikeId);
  const report = reportData ? JSON.parse(JSON.stringify(reportData)) as Report : undefined;


  if (!report || report.platform !== 'youtube') {
    return (
        <div className="p-4 md:p-6">
            <h1 className="text-xl font-bold">Invalid Request</h1>
            <p className="text-muted-foreground">This report is either not found or is not for the YouTube platform.</p>
        </div>
    )
  }

  const creatorData = await getUserById(report.creatorId);
  const creator = creatorData ? {
    id: creatorData.id,
    uid: creatorData.id,
    displayName: creatorData.displayName,
    email: creatorData.email,
    role: creatorData.role,
    joinDate: creatorData.joinDate,
    platformsConnected: creatorData.platformsConnected,
    youtubeChannelId: creatorData.youtubeChannelId,
    status: creatorData.status,
    avatar: creatorData.avatar,
    legalFullName: creatorData.legalFullName,
    address: creatorData.address,
    phone: creatorData.phone,
  } as User : undefined;

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
