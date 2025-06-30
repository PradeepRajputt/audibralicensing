
export type User = {
    uid: string;
    displayName: string;
    email: string;
    joinDate: string;
    avatar: string;
    platformsConnected: string[];
    youtubeChannelId?: string;
    status: 'active' | 'suspended' | 'deactivated';
};

// In a real app, this data would come from Firestore.
// We're using a static array here for demonstration.
// The YouTube Channel IDs are for real, well-known channels for testing.
const users: User[] = [
  {
    uid: "user_creator_123",
    displayName: "Sample Creator",
    email: "creator@example.com",
    joinDate: "2024-01-15",
    avatar: "https://placehold.co/128x128.png",
    platformsConnected: ["youtube", "web"],
    youtubeChannelId: "UC-lHJZR3Gqxm24_Vd_AJ5Yw", // Google Developers channel
    status: "active",
  },
  {
    uid: "user_creator_456",
    displayName: "Alice Vlogs",
    email: "alice@example.com",
    joinDate: "2024-02-20",
    avatar: "https://placehold.co/128x128.png",
    platformsConnected: ["youtube", "instagram"],
    youtubeChannelId: "UC4QobU6STFB0P71PMvOGN5A", // Firebase channel
    status: "active",
  },
  {
    uid: "user_creator_789",
    displayName: "Bob Builds",
    email: "bob@example.com",
    joinDate: "2024-03-10",
    avatar: "https://placehold.co/128x128.png",
    platformsConnected: ["web"],
    youtubeChannelId: "invalid-channel-id-for-testing", // This one should fail
    status: "active",
  },
];

export function getAllUsers(): User[] {
    return users;
}

export function getUserById(uid: string): User | undefined {
    return users.find(u => u.uid === uid);
}
