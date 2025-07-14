import connectToDatabase from './mongodb';
import Creator from '@/models/Creator';
import Strike from '@/models/Strike';
import Report from '@/models/Report';
import Reactivation from '@/models/Reactivation';
import Scan from '@/models/Scan';
import Admin from '@/models/Admin';

export async function getAdminOverviewStats(from?: Date, to?: Date) {
  await connectToDatabase();

  // Total creators
  const totalCreators = await Creator.countDocuments({});

  // Pending strikes
  const pendingStrikes = await Strike.countDocuments({ status: 'pending' });

  // Pending reactivations
  const pendingReactivations = await Reactivation.countDocuments({ status: 'pending' });

  // Total scans
  const totalScans = await Scan.countDocuments({});

  // Total signups (creators registered in the selected period)
  let totalSignups = 0;
  if (from && to) {
    totalSignups = await Creator.countDocuments({ createdAt: { $gte: from, $lte: to } });
  } else {
    totalSignups = await Creator.countDocuments({});
  }

  // Total reports
  const totalReports = await Report.countDocuments({});

  // Chart data (signups, scans, reports per day in the selected period)
  let chartData: any[] = [];
  if (from && to) {
    // Aggregate per day
    const days = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
    for (let i = 0; i <= days; i++) {
      const dayStart = new Date(from.getTime() + i * 24 * 60 * 60 * 1000);
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
      const signups = await Creator.countDocuments({ createdAt: { $gte: dayStart, $lt: dayEnd } });
      const scans = await Scan.countDocuments({ timestamp: { $gte: dayStart, $lt: dayEnd } });
      const reports = await Report.countDocuments({ submitted: { $gte: dayStart, $lt: dayEnd } });
      chartData.push({ date: dayStart.toISOString(), signups, scans, reports });
    }
  }

  return {
    totalCreators,
    pendingStrikes,
    pendingReactivations,
    totalScans,
    totalSignups,
    totalReports,
    chartData,
  };
}

export async function getAdminProfile() {
  await connectToDatabase();
  // For now, just return the first admin found
  const admin = await Admin.findOne({}).lean();
  return admin;
} 