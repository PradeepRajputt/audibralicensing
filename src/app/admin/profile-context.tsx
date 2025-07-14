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