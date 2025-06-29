import DetailsClientPage from './details-client-page';

// Mock user data. In a real application, this would be fetched from a database.
const users = [
  {
    uid: "user_creator_123",
    displayName: "Sample Creator",
    email: "creator@example.com",
    role: "creator",
    joinDate: "2024-01-15",
    avatar: "https://placehold.co/128x128.png",
    platformsConnected: ["youtube", "web"],
    youtubeId: "UC-lHJZR3Gqxm24_Vd_AJ5Yw",
    status: "active",
  },
  {
    uid: "user_creator_456",
    displayName: "Alice Vlogs",
    email: "alice@example.com",
    role: "creator",
    joinDate: "2024-02-20",
    avatar: "https://placehold.co/128x128.png",
    platformsConnected: ["youtube", "instagram"],
    youtubeId: "UC-sample-channel-id",
    status: "active",
  },
  {
    uid: "user_creator_789",
    displayName: "Bob Builds",
    email: "bob@example.com",
    role: "creator",
    joinDate: "2024-03-10",
    avatar: "https://placehold.co/128x128.png",
    platformsConnected: ["web"],
    status: "active",
  },
];

export default function UserDetailsPage({ params }: { params: { userId: string } }) {
  const user = users.find(u => u.uid === params.userId);

  // We find the user on the server and pass the data to the client component.
  // This avoids accessing `params` directly in a client component, resolving the hydration warning.
  return <DetailsClientPage user={user} />;
}
