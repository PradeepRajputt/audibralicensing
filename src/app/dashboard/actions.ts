
'use server';

// Mock data generation functions to simulate fetching from a real API like YouTube's.

/**
 * Generates semi-random but consistent analytics data based on a YouTube ID.
 * This ensures that the same ID will always produce the same "fetched" data.
 * @param youtubeId - The ID of the YouTube channel.
 * @returns A full suite of mock analytics data.
 */
const generateAnalytics = (youtubeId: string) => {
  const seed = youtubeId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const random = (multiplier = 1) => (Math.sin(seed * multiplier) + 1) / 2;

  const subscribers = Math.floor(random(1) * 150000) + 5000;
  const views = Math.floor(random(2) * 20000000) + 100000;

  const mostViewedVideos = [
    { title: 'My Most Epic Adventure Yet!', views: Math.floor(random(3) * 200000) + 50000 },
    { title: 'Baking the Perfect Sourdough', views: Math.floor(random(4) * 150000) + 40000 },
    { title: 'Unboxing the New Tech Gadget', views: Math.floor(random(5) * 300000) + 60000 },
  ];

  const monthlyViewsData = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, i) => ({
    month,
    views: Math.floor(random(6 + i) * 40000) + 10000,
  }));

  const subscriberData = Array.from({ length: 6 }).map((_, i) => ({
    date: `2024-0${i + 1}-01`,
    count: Math.floor(subscribers * (0.8 + (i * 0.04) + (random(12 + i) * 0.1))),
  }));

  return {
    subscribers,
    views,
    mostViewedVideo: mostViewedVideos.sort((a,b) => b.views - a.views)[0],
    monthlyViewsData,
    subscriberData,
  };
};


/**
 * Generates a semi-random but consistent list of recent activities based on a YouTube ID.
 * @param youtubeId - The ID of the YouTube channel.
 * @returns An array of mock recent activity items.
 */
const generateActivity = (youtubeId: string) => {
  const seed = youtubeId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const random = (multiplier = 1) => (Math.sin(seed * multiplier) + 1) / 2;

  const activities = [
    {
      type: "New Infringement Detected",
      details: "On website 'stolencontent.com/my-video'",
      status: "Action Required",
      date: `${Math.floor(random(1) * 5) + 1} hours ago`,
      variant: "destructive"
    },
    {
      type: "YouTube Scan Complete",
      details: `Channel '${youtubeId}' scanned.`,
      status: "No Issues",
      date: "1 day ago",
      variant: "default"
    },
    {
      type: "Strike Submitted",
      details: "Claim #CS-12345 to YouTube.",
      status: "Pending",
      date: "3 days ago",
      variant: "secondary"
    },
    {
      type: "Analytics Updated",
      details: "Your monthly analytics are ready.",
      status: "Success",
      date: "5 days ago",
      variant: "default"
    }
  ] as const;
  return activities.slice(0, Math.floor(random(2) * 3) + 2);
};

/**
 * Server action to fetch all dashboard data for a given YouTube ID.
 * Returns both analytics and recent activity.
 * @param youtubeId The ID of the connected YouTube account.
 * @returns An object containing analytics and activity data, or null if no ID is provided.
 */
export async function getDashboardData(youtubeId: string | null) {
  if (!youtubeId) {
    return { analytics: null, activity: [] };
  }

  // Simulate network delay to show loading states
  await new Promise(resolve => setTimeout(resolve, 1000));

  const analytics = generateAnalytics(youtubeId);
  const activity = generateActivity(youtubeId);

  return { analytics, activity };
}
