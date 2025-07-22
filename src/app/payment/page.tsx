"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { jwtDecode } from "jwt-decode";

const PLANS = [
  { id: "free", name: "Free Trial", price: 0, period: "7 days", disabled: false },
  { id: "plan_QvemyKdfzVGTLc", name: "Monthly", price: 1000, period: "per month", disabled: false },
  { id: "plan_Qvenh9X4D8ggzw", name: "Yearly", price: 12000, period: "per year", disabled: false },
];

export default function PaymentPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState<any>(null);
  const [currentPlan, setCurrentPlan] = useState<string>("");
  const [planExpiry, setPlanExpiry] = useState<string>("");
  const searchParams = useSearchParams();
  const selectedPlan = searchParams ? searchParams.get("plan") : null;
  const [debug, setDebug] = useState("");

  useEffect(() => {
    async function fetchUser() {
      let email = null;
      // Try to get email from JWT in localStorage
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("creator_jwt");
        if (token) {
          try {
            const decoded: any = jwtDecode(token);
            email = decoded.email;
          } catch {}
        }
      }
      // Fallback: try session.user.email if you use next-auth
      // Removed window.session access as it does not exist on Window type
      if (!email) {
        setError("Could not determine user email. Please log in again.");
        return;
      }
      const res = await fetch(`/api/get-user?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      setUser(data);
      setCurrentPlan(data.plan || "free");
      setPlanExpiry(data.planExpiry ? new Date(data.planExpiry).toLocaleString() : "");
    }
    fetchUser();
  }, []);

  useEffect(() => {
    if (selectedPlan && selectedPlan !== "free" && user && user._id) {
      setLoading(true);
      setTimeout(() => {
        setDebug(`window.Razorpay: ${typeof (window as any).Razorpay}`);
        if (!(window as any).Razorpay) {
          setError("Razorpay script not loaded. Please check your internet connection or try again later.");
          setLoading(false);
          return;
        }
        handleSubscribe(selectedPlan);
      }, 3000);
    }
    // eslint-disable-next-line
  }, [selectedPlan, user]);

  const handleSubscribe = async (planId: string) => {
    setError("");
    // Find the real planId from PLANS array
    const plan = PLANS.find(p => p.id === planId || p.name.toLowerCase() === planId.toLowerCase());
    const realPlanId = plan?.id || planId;
    try {
      const res = await fetch("/api/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: realPlanId, userId: user._id }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      if (!data.subscriptionId) {
        setError("No subscriptionId returned from backend. Check your Razorpay test planId and credentials.");
        setLoading(false);
        return;
      }
      openRazorpayCheckout(data.subscriptionId);
    } catch (err: any) {
      setError(err.message || "Payment failed");
      setLoading(false);
    }
  };

  function openRazorpayCheckout(subscriptionId: string) {
    if (!(window as any).Razorpay) {
      setError("Razorpay script not loaded. Please check your internet connection or try again later.");
      setLoading(false);
      return;
    }
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      subscription_id: subscriptionId,
      name: "Creators Shield",
      description: "Unlock premium copyright protection & real-time alerts.",
      image: "/favicon.ico",
      theme: {
        color: "#6D28D9",
        backdrop_color: "#18181b",
        hide_topbar: false,
      },
      prefill: {
        email: user?.email || "",
        name: user?.name || "",
        contact: user?.phone || "",
      },
      modal: {
        ondismiss: function () {},
        escape: true,
        backdropclose: false,
        confirm_close: true,
        animation: true,
      },
      method: {
        netbanking: true,
        card: true,
        upi: true,
        wallet: true,
        emi: true,
        paylater: true,
      },
      international: true,
      handler: function (response: any) {
        document.body.innerHTML = '<div style="color:green;text-align:center;font-size:2rem;margin-top:20vh;">Payment Successful! Redirecting...</div>';
        setTimeout(() => {
          window.location.href = "/register";
        }, 2000);
      },
    };
    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  }

  if (selectedPlan && selectedPlan !== "free") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#232946] to-[#18181b] px-4">
        <div className="flex flex-col items-center mb-8">
          <img src="/logo.png" alt="Creator Shield Logo" className="w-20 h-20 rounded-full shadow-lg mb-4 border-4 border-white/20 bg-white/10" />
          <h1 className="text-3xl font-extrabold mb-2 text-white tracking-tight drop-shadow">Complete Your Payment</h1>
          <p className="text-lg text-gray-300 mb-2 text-center max-w-xl">You are subscribing to <b>Creators Shield</b> premium plan.<br/>Enjoy real-time copyright protection, priority support, and more.</p>
          <div className="flex gap-2 mt-2">
            <span className="inline-flex items-center gap-1 bg-green-700/20 text-green-300 px-3 py-1 rounded-full text-xs font-semibold"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> Trusted by creators</span>
            <span className="inline-flex items-center gap-1 bg-blue-700/20 text-blue-300 px-3 py-1 rounded-full text-xs font-semibold"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path strokeLinecap="round" strokeLinejoin="round" d="M8 12l2 2 4-4" /></svg> Secure Payment</span>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center min-h-[40vh] w-full max-w-lg bg-white/5 rounded-2xl shadow-xl p-8 border border-white/10">
          <div className="text-2xl font-bold mb-4 text-white">Processing Payment...</div>
          {error && <div className="text-red-500 mb-4">{error}</div>}
          {loading && <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mb-4" />}
          <div className="text-gray-400">Please wait, payment window will open automatically.</div>
          <div className="mt-4 text-xs text-yellow-400">Debug: {debug}</div>
        </div>
        <div className="mt-10 flex flex-col items-center gap-2">
          <div className="flex gap-2">
            <img src="https://razorpay.com/favicon.png" alt="Razorpay" className="w-6 h-6 rounded" />
            <span className="text-gray-400 text-sm">Payments secured by <b>Razorpay</b></span>
          </div>
          <div className="text-xs text-gray-500">SSL 256-bit encrypted • PCI DSS compliant</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">Choose Your Plan</h1>
      <div className="mb-6">
        <div className="mb-2">Current Plan: <b>{currentPlan}</b></div>
        {planExpiry && <div>Expiry: <b>{planExpiry}</b></div>}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {PLANS.map((plan) => (
          <div key={plan.id} className={`border rounded p-4 ${plan.disabled ? 'opacity-50' : ''}`}>
            <div className="font-bold text-lg mb-2">{plan.name}</div>
            <div className="text-2xl mb-2">{plan.price === 0 ? 'Free' : `$${plan.price}`}</div>
            <div className="mb-4">{plan.period}</div>
            {plan.id === "free" ? (
              <button className="btn btn-disabled w-full" disabled>
                Free Trial (7 days)
              </button>
            ) : (
              <button
                className="btn btn-primary w-full"
                disabled={loading || currentPlan === plan.name.toLowerCase()}
                onClick={() => handleSubscribe(plan.id)}
              >
                {loading ? "Processing..." : currentPlan === plan.name.toLowerCase() ? "Current Plan" : `Subscribe`}
              </button>
            )}
          </div>
        ))}
      </div>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <div className="text-sm text-gray-500 mt-8">
        After payment, your subscription will be activated instantly. If your plan expires or is cancelled, you will be redirected here to renew.
      </div>
    </div>
  );
} 