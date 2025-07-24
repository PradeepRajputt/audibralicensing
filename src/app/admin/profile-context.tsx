import React, { createContext, useContext, useState } from 'react';

interface AdminProfile {
  displayName: string;
  avatar: string;
}

const mockAdminUser: AdminProfile = {
  displayName: 'Admin User',
  avatar: 'https://placehold.co/128x128.png',
};

interface AdminProfileContextType {
  profile: AdminProfile;
  setProfile: (profile: AdminProfile) => void;
}

const AdminProfileContext = createContext<AdminProfileContextType | undefined>(undefined);

export function AdminProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<AdminProfile>(mockAdminUser);

  React.useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch('/api/settings/admin-profile');
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setProfile({
          displayName: data.name || 'Admin User',
          avatar: data.avatar || mockAdminUser.avatar,
        });
      } catch {
        // fallback to mock
        setProfile(mockAdminUser);
      }
    }
    fetchProfile();
  }, []);

  return (
    <AdminProfileContext.Provider value={{ profile, setProfile }}>
      {children}
    </AdminProfileContext.Provider>
  );
}

export function useAdminProfile() {
  const ctx = useContext(AdminProfileContext);
  if (!ctx) throw new Error('useAdminProfile must be used within an AdminProfileProvider');
  return ctx;
} 