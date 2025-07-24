import connectToDatabase from './mongodb';
import Creator from '@/models/Creator';
import Strike from '@/models/Strike';
import Report from '@/models/Report';
import Reactivation from '@/models/Reactivation';
import Scan from '@/models/Scan';
import Admin from '@/models/Admin';

export async function getAdminOverviewStats() {
  try {
    await connectToDatabase();

    // Total creators
    const totalCreators = await Creator.countDocuments({});

    // New signups in last 24 hours
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const newSignups = await Creator.countDocuments({ createdAt: { $gte: last24h, $lte: now } });

    // Total scans (sum of all Scan.scans array lengths)
    const allScanDocs = await Scan.find({}, { scans: 1 });
    let totalScans = 0;
    for (const doc of allScanDocs) {
      if (Array.isArray(doc.scans)) {
        totalScans += doc.scans.length;
      }
    }

    return {
      totalCreators,
      newSignups,
      totalScans,
    };
  } catch (error) {
    console.error('Error in getAdminOverviewStats:', error);
    throw error;
  }
}

export async function getAdminProfile() {
  await connectToDatabase();
  // For now, just return the first admin found
  const admin = await Admin.findOne({}).lean();
  return admin;
} 