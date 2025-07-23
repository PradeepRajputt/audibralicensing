"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { jwtDecode } from "jwt-decode";

const PLANS = [
  { id: "free", name: "Free Trial", price: 0, period: "7 days", disabled: false },
  { id: "monthly", name: "Monthly", price: 50, period: "per month", disabled: false },
  { id: "yearly", name: "Yearly", price: 400, period: "per year", disabled: false },
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
    // Find the selected plan object here and capture it in closure
    const planObj = PLANS.find(p => p.id === selectedPlan);
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
        // Use planObj instead of looking up again
        const expiryDate = new Date(Date.now() + (planObj?.id === "monthly" ? 30 : 365) * 24 * 60 * 60 * 1000).toLocaleDateString();

        document.body.innerHTML = `
          <div class="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#232946] to-[#18181b] text-white px-4">
            <div class="fixed inset-0 z-10 pointer-events-none">
              <canvas id="confetti-canvas"></canvas>
            </div>
            <div class="flex flex-col items-center bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-10 border border-white/20 max-w-lg w-full relative z-20">
              <div class="w-24 h-24 flex items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500 shadow-lg mb-4 border-4 border-white/20">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" fill="#22c55e" opacity="0.2"/><path d="M7 13l3 3 7-7" stroke="#22c55e" stroke-width="2.5"/></svg>
              </div>
              <h1 class="text-4xl font-extrabold mb-2 text-white tracking-tight drop-shadow">Payment Successful!</h1>
              <p class="text-lg text-gray-300 mb-2 text-center max-w-xl">
                Thank you, <b>${user?.name || "Creator"}</b>, for subscribing to the <b>${planObj?.name || ""}</b> plan.
              </p>
              <div class="text-lg text-gray-400 mb-2">
                Amount Paid: <b class="text-green-400">₹${planObj?.price ? Math.round(planObj.price * 83) : ""}</b>
              </div>
              <div class="text-lg text-gray-400 mb-4">
                Plan Expiry Date: <b class="text-blue-400">${expiryDate}</b>
              </div>
              <div class="flex gap-2 mt-2">
                <span class="inline-flex items-center gap-1 bg-green-700/20 text-green-300 px-3 py-1 rounded-full text-xs font-semibold">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Trusted by creators
                </span>
                <span class="inline-flex items-center gap-1 bg-blue-700/20 text-blue-300 px-3 py-1 rounded-full text-xs font-semibold">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8 12l2 2 4-4" />
                  </svg>
                  Secure Payment
                </span>
              </div>
              <div class="text-sm text-gray-500 mt-4">
                Redirecting you to login...
              </div>
            </div>
          </div>
          <script>
            // Confetti effect
            (function() {
              var canvas = document.getElementById('confetti-canvas');
              if (canvas) {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
                var ctx = canvas.getContext('2d');
                var pieces = [];
                for (var i = 0; i < 150; i++) {
                  pieces.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height - canvas.height,
                    r: Math.random() * 6 + 4,
                    d: Math.random() * 50 + 50,
                    color: 'hsl(' + Math.floor(Math.random() * 360) + ',70%,60%)',
                    tilt: Math.random() * 10 - 10
                  });
                }
                function draw() {
                  ctx.clearRect(0, 0, canvas.width, canvas.height);
                  for (var i = 0; i < pieces.length; i++) {
                    var p = pieces[i];
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2, false);
                    ctx.fillStyle = p.color;
                    ctx.fill();
                  }
                  update();
                }
                function update() {
                  for (var i = 0; i < pieces.length; i++) {
                    var p = pieces[i];
                    p.y += Math.cos(p.d) + 2 + p.r / 2;
                    p.x += Math.sin(0) * 2;
                    if (p.y > canvas.height) {
                      pieces[i] = {
                        x: Math.random() * canvas.width,
                        y: -10,
                        r: p.r,
                        d: p.d,
                        color: p.color,
                        tilt: p.tilt
                      };
                    }
                  }
                }
                setInterval(draw, 20);
              }
            })();
          </script>
        `;
        setTimeout(() => {
          window.location.href = "/auth/login";
        }, 3000);
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