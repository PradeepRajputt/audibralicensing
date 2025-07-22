"use client";
import { useState } from "react";
import { FaCrown, FaGem, FaRocket, FaExclamationTriangle } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const PLANS = [
  {
    id: "free",
    name: "Free Trial",
    price: 0,
    desc: "7 days access to all features.",
    icon: <FaCrown className="text-5xl text-purple-400 mb-4" />,
    color: "purple",
  },
  {
    id: "monthly",
    name: "Monthly",
    price: 50,
    desc: "$50 per month, billed monthly.",
    icon: <FaGem className="text-5xl text-blue-400 mb-4" />,
    color: "blue",
  },
  {
    id: "yearly",
    name: "Yearly",
    price: 100,
    desc: "$100 per year, billed yearly.",
    icon: <FaRocket className="text-5xl text-green-400 mb-4" />,
    color: "green",
  },
];

export default function PlansPage() {
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("creator_jwt");
      if (!token) {
        setLoading(false);
      } else {
        setLoading(false);
      }
    }
  }, [router]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a223f] to-[#232946] text-white text-2xl">Loading...</div>;
  }

  const handleSelect = (planId: string) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("creator_jwt");
      if (!token) {
        localStorage.setItem("postAuthRedirect", "/plans");
        setShowAuthModal(true);
        setTimeout(() => {
          router.push("/auth/register");
        }, 3000);
        return;
      }
      // Only logged-in users can proceed to payment
      router.push(`/payment?plan=${planId}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#1a223f] to-[#232946] text-white px-4 py-16">
      {/* Warning for existing creators */}
      <div className="w-full max-w-2xl mb-8">
        <div className="flex items-center gap-4 bg-yellow-100/90 border border-yellow-400 text-yellow-900 rounded-xl px-6 py-4 shadow-md">
          <FaExclamationTriangle className="text-2xl text-yellow-500" />
          <div className="flex-1">
            <div className="font-bold text-lg mb-1">Already a Creator?</div>
            <div className="text-sm">If you have already chosen a plan and are an existing CreatorShield user, please log in to your account instead of selecting a new plan.</div>
          </div>
          <button
            onClick={() => router.push('/auth/login')}
            className="ml-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-md shadow transition-all duration-150"
          >
            Login
          </button>
        </div>
      </div>
      {showAuthModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/60">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full flex flex-col items-center">
            <h2 className="text-2xl font-bold text-blue-700 mb-2">Registration Required</h2>
            <p className="text-gray-700 text-center mb-4">You need to <b>register</b> and <b>login</b> before you can choose a plan and start your CreatorShield subscription.</p>
            <div className="text-blue-500 font-semibold text-lg animate-pulse">Redirecting you to registration page...</div>
          </div>
        </div>
      )}
      <h1 className="text-4xl md:text-5xl font-extrabold mb-10 drop-shadow-xl text-center">Choose Your Plan</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 w-full max-w-6xl mb-10">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            onClick={() => handleSelect(plan.id)}
            className="relative group rounded-3xl shadow-2xl p-12 flex flex-col items-center bg-white/10 backdrop-blur-lg border-2 border-blue-500 transition-all duration-300 overflow-hidden min-h-[380px] max-w-md mx-auto cursor-pointer hover:scale-105"
          >
            <div className="mb-4 text-5xl">{plan.icon}</div>
            <h2 className="text-2xl font-bold mb-2 text-white">{plan.name}</h2>
            <div className="text-3xl font-extrabold text-blue-300 mb-2">
              {plan.price === 0 ? "Free" : `$${plan.price}`}
              {plan.id === "monthly" && <span className="text-base font-medium text-gray-300">/mo</span>}
              {plan.id === "yearly" && <span className="text-base font-medium text-gray-300">/yr</span>}
            </div>
            <p className="text-gray-200 mb-4 text-center">{plan.desc}</p>
            <ul className="mb-6 space-y-2 w-full">
              <li className="flex items-center text-gray-100 text-base"><span className="mr-2 text-green-400">✔️</span> All premium features</li>
              <li className="flex items-center text-gray-100 text-base"><span className="mr-2 text-green-400">✔️</span> Priority support</li>
              <li className="flex items-center text-gray-100 text-base"><span className="mr-2 text-green-400">✔️</span> Secure payments</li>
            </ul>
            <span className="mt-auto bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold py-2 px-8 rounded-full shadow-lg text-lg group-hover:shadow-xl transition">
              Choose {plan.name}
            </span>
          </div>
        ))}
      </div>
      <div className="text-gray-400 text-sm mt-8">Please register or login to select a plan and access premium features.</div>
    </div>
  );
} 