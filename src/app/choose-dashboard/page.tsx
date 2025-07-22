"use client";
import { useRouter } from "next/navigation";
import { FaUser, FaUserShield } from "react-icons/fa";
import { useEffect } from "react";

export default function ChooseDashboard() {
  const router = useRouter();

  // Helper to get user role from localStorage (client-side only)
  const getUserRole = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('userRole');
    }
    return null;
  };

  // Enhanced card click handlers
  const handleCreatorClick = () => {
    const role = getUserRole();
    if (role === 'creator') {
      router.push('/dashboard'); // or '/dashboard/overview' if that's your main dashboard
    } else {
      router.push('/auth/register');
    }
  };

  const handleAdminClick = () => {
    const role = getUserRole();
    if (role === 'admin') {
      router.push('/admin');
    } else {
      router.push('/auth/login');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#1a223f] to-[#232946] text-white px-4">
      <h1 className="text-4xl md:text-5xl font-extrabold mb-10 drop-shadow-xl text-center tracking-tight">Choose Your Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full max-w-3xl">
        {/* Creator Card */}
        <button
          onClick={handleCreatorClick}
          className="group bg-[#232946]/90 rounded-3xl shadow-2xl p-12 flex flex-col items-center transition-transform transform hover:-translate-y-2 hover:scale-105 focus:scale-105 focus:outline-none border-2 border-purple-500 hover:border-purple-400 relative overflow-hidden ring-0 hover:ring-4 hover:ring-purple-300/30"
        >
          <span className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          <FaUser className="text-7xl text-purple-300 mb-6 group-hover:animate-pulse drop-shadow-lg" />
          <h2 className="text-3xl font-bold mb-3 tracking-tight">Creator Dashboard</h2>
          <p className="text-lg text-gray-300 mb-4 text-center">For content creators. Access analytics, monitor your content, and manage copyright claims.</p>
          <span className="mt-6 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold py-3 px-10 rounded-full shadow-lg text-xl group-hover:shadow-2xl transition-all duration-200 group-hover:scale-105">Go to Creator Dashboard</span>
        </button>
        {/* Admin Card */}
        <button
          onClick={handleAdminClick}
          className="group bg-[#232946]/90 rounded-3xl shadow-2xl p-12 flex flex-col items-center transition-transform transform hover:-translate-y-2 hover:scale-105 focus:scale-105 focus:outline-none border-2 border-blue-500 hover:border-blue-400 relative overflow-hidden ring-0 hover:ring-4 hover:ring-blue-300/30"
        >
          <span className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          <FaUserShield className="text-7xl text-blue-300 mb-6 group-hover:animate-pulse drop-shadow-lg" />
          <h2 className="text-3xl font-bold mb-3 tracking-tight">Admin Dashboard</h2>
          <p className="text-lg text-gray-300 mb-4 text-center">For platform administrators. Manage users, review copyright strikes, and oversee the platform.</p>
          <span className="mt-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold py-3 px-10 rounded-full shadow-lg text-xl group-hover:shadow-2xl transition-all duration-200 group-hover:scale-105">Go to Admin Dashboard</span>
        </button>
      </div>
    </div>
  );
} 