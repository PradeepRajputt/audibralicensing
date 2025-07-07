"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

type Channel = {
  id: string;
  snippet: {
    title: string;
    thumbnails: {
      default: {
        url: string;
      };
    };
  };
};

type SessionUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  accessToken?: string | null;
};

type Session = {
  user?: SessionUser;
};

export default function Dashboard() {
  const { data: session } = useSession() as { data: Session | null };
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.accessToken) {
      console.log("⛔ No access token in session");
      setLoading(false);
      return;
    }

    const fetchChannels = async () => {
      try {
        console.log("🔐 Access token:", session?.user?.accessToken);

        const res = await fetch(
          `https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true`,
          {
            headers: {
              Authorization: `Bearer ${session?.user?.accessToken}`,
            },
          }
        );

        const data = await res.json();
        console.log("📺 YouTube API Response:", data);

        if (data?.items?.length > 0) {
          setChannels(data.items);
        } else {
          console.warn("⚠️ No channels found for this account");
        }
      } catch (err) {
        console.error("❌ Failed to fetch YouTube channels:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchChannels();
  }, [session]);

const saveChannel = async (channel: any) => {
  const location = "India"; // You can later replace with dynamic geolocation

  const res = await fetch("/api/save-user", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: session?.user?.name,
      email: session?.user?.email,
      channel,
      location,
    }),
  });

  const data = await res.json();
  console.log("✅ Channel saved:", data);
};

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">
        Welcome {session?.user?.name || "User"}
      </h1>

      <h2 className="mt-6 text-xl font-semibold">
        Select a YouTube Channel:
      </h2>

      {loading ? (
        <p className="mt-4 text-gray-500">Loading channels...</p>
      ) : channels.length === 0 ? (
        <p className="text-red-500 mt-4">
          No YouTube channels found. Please ensure this Google account has an active channel.
        </p>
      ) : (
        <ul className="space-y-4 mt-4">
          {channels.map((ch) => (
            <li key={ch.id} className="border p-4 rounded shadow-sm">
              <img
                src={ch.snippet.thumbnails.default.url}
                alt="Channel Logo"
                className="w-16 h-16 rounded-full"
              />
              <p className="mt-2 font-medium">{ch.snippet.title}</p>
              <button
                className="mt-3 bg-blue-600 text-white px-4 py-1 rounded"
                onClick={() => saveChannel(ch.snippet)}
              >
                Select
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
