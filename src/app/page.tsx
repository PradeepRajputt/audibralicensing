"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FaShieldAlt, FaRegSmile, FaRocket, FaRegLightbulb, FaStar, FaHandshake, FaLock, FaUsers, FaCrown, FaGem } from "react-icons/fa";

function useScrollFadeIn() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new window.IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => { if (ref.current) observer.unobserve(ref.current); };
  }, []);
  return [ref, visible] as const;
}

// Typing animation hook
function useTypingEffect(text: string, speed = 30) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    setDisplayed("");
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed((prev) => prev + text[i]);
      i++;
      if (i >= text.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);
  return displayed;
}

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const [heroVisible, setHeroVisible] = useState(false);
  const [showCS, setShowCS] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Animate CS character after short delay
  useEffect(() => {
    const timer = setTimeout(() => setShowCS(true), 600);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const observer = new window.IntersectionObserver(
      ([entry]) => setHeroVisible(entry.isIntersecting),
      { threshold: 0.3 }
    );
    if (heroRef.current) observer.observe(heroRef.current);
    return () => { if (heroRef.current) observer.unobserve(heroRef.current); };
  }, []);

  useEffect(() => {
    // Check for JWT or session (customize as per your auth logic)
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("creator_jwt");
      setIsLoggedIn(!!token);
    }
  }, []);

  const handlePlanClick = () => {
    if (isLoggedIn) {
      router.push("/plans");
    } else {
      router.push("/auth/register");
    }
  };

  // Section fade-in hooks
  const [whatRef, whatVisible] = useScrollFadeIn();
  const [uniqueRef, uniqueVisible] = useScrollFadeIn();
  const [featuresRef, featuresVisible] = useScrollFadeIn();
  const [plansRef, plansVisible] = useScrollFadeIn();
  const [commitRef, commitVisible] = useScrollFadeIn();
  const [collabRef, collabVisible] = useScrollFadeIn();

  // Remove useTypingEffect and typingText

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#181c2f] to-[#232946] text-white">
      {/* Hero Section - Centered, Full Width, Animated CS */}
      <div ref={heroRef} className="flex flex-col items-center justify-center min-h-[80vh] w-full px-4 py-24 relative bg-gradient-to-br from-[#1a223f]/80 to-[#232946]/90 overflow-hidden">
        {/* Animated CS Character/Icon */}
        <div className={`flex flex-col items-center mb-8 transition-all duration-700 ${showCS ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-75'}`}>
          <div className="relative flex items-center justify-center">
            {/* Glowing shadow/light effect */}
            <div className="absolute w-56 h-56 md:w-72 md:h-72 rounded-full bg-blue-500/30 blur-3xl z-0 animate-glow" />
            <div className="w-40 h-40 md:w-56 md:h-56 rounded-full bg-gradient-to-tr from-blue-500 via-light-green-500 to-red-400 shadow-2xl flex items-center justify-center animate-pulse-slow relative z-10">
              <span className="text-7xl md:text-8xl font-extrabold text-white drop-shadow-lg select-none animate-fade-in-up">CS</span>
              {/* Animated shield pulse/glow */}
              <span className="absolute inset-0 rounded-full border-4 border-blue-300/40 animate-glow" />
            </div>
            {/* Animated shield icon overlay */}
            <FaShieldAlt className="absolute bottom-2 right-2 text-4xl md:text-5xl text-blue-200 opacity-80 animate-shield-bounce z-20" />
          </div>
          <div className="mt-2 text-blue-200 text-lg font-semibold tracking-widest animate-fade-in-up delay-200">Your Content. Your Power.</div>
        </div>
        <div className={`w-full max-w-4xl text-center mx-auto transition-all duration-700 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h1 className="text-6xl md:text-7xl font-extrabold mb-6 drop-shadow-xl tracking-tight leading-tight animate-fade-in">
            Protect. Monetize. <span className="text-blue-400">Create.</span>
          </h1>
          <p className="mb-10 text-2xl md:text-3xl text-gray-200 font-medium drop-shadow animate-fade-in delay-100">
            The all-in-one platform for digital creators to secure content, grow audience, and get paid.
          </p>
          <div className="flex flex-col sm:flex-row gap-8 justify-center mb-8 animate-fade-in delay-200">
            <button onClick={() => setShowDialog(true)} className="bg-gradient-to-r from-blue-500 to-light-green-500 hover:from-blue-600 hover:to-light-green-600 text-white font-bold py-5 px-16 rounded-full text-2xl shadow-2xl transition-transform transform hover:scale-105 focus:scale-105 focus:outline-none">Get Started</button>
            <Link href="/choose-dashboard" className="bg-white/10 hover:bg-white/20 text-white font-semibold py-5 px-16 rounded-full text-2xl shadow transition-transform transform hover:scale-105 focus:scale-105 focus:outline-none">Login</Link>
            <Link href="/plans" className="bg-white/10 hover:bg-white/20 text-white font-semibold py-5 px-16 rounded-full text-2xl shadow transition-transform transform hover:scale-105 focus:scale-105 focus:outline-none">View Plans</Link>
          </div>
        </div>
      </div>

      {/* Dialog for Get Started */}
      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#232946] rounded-3xl shadow-2xl p-12 max-w-xl w-full text-center border-4 border-blue-500 animate-scale-in">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6 text-blue-300 drop-shadow-xl tracking-tight">Welcome to CreatorShield!</h2>
            <div className="text-lg md:text-2xl text-gray-200 mb-8 font-medium text-center">
              CreatorShield is your all-in-one platform for content protection, copyright management, and creator monetization.<br /><br />
              Join thousands of creators who trust us to protect and grow their digital content. <br /><br />
              AI-powered copyright monitoring, instant takedowns, analytics, and more—all in one place. <b>Your content. Your power.</b>
            </div>
            <button onClick={() => { setShowDialog(false); window.location.href = '/plans'; }} className="bg-gradient-to-r from-blue-500 to-light-green-500 hover:from-blue-600 hover:to-light-green-600 text-white font-bold py-4 px-16 rounded-full text-2xl shadow-lg transition-transform transform hover:scale-105">Continue to Plans</button>
            <button onClick={() => setShowDialog(false)} className="block mx-auto mt-6 text-gray-400 hover:text-white text-base">Cancel</button>
          </div>
        </div>
      )}

      {/* What is CreatorShield? */}
      <section ref={whatRef} className={`max-w-5xl mx-auto py-16 px-8 text-left transition-all duration-700 ${whatVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="bg-[#232946]/80 rounded-2xl shadow-2xl p-14 border border-blue-700">
          <h2 className="text-4xl font-bold mb-4 text-blue-300">What is CreatorShield?</h2>
          <p className="text-2xl text-gray-200 mb-2">
            CreatorShield is your trusted partner for content protection, copyright management, and creator monetization.
          </p>
          <p className="text-lg text-gray-300">
            We empower creators to focus on what they do best—creating—while we handle the rest.
          </p>
        </div>
      </section>

      {/* Why We're Unique - 2 columns on desktop */}
      <section ref={uniqueRef} className={`max-w-6xl mx-auto py-16 px-8 grid grid-cols-1 md:grid-cols-2 gap-14 text-left transition-all duration-700 ${uniqueVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="flex flex-col gap-10">
          <div className="flex items-center gap-8 bg-[#232946]/90 rounded-2xl shadow-2xl p-10 border border-gray-700 hover:shadow-2xl transition-transform transform hover:-translate-y-2 animate-fade-in-left delay-100">
            <FaStar className="text-6xl text-yellow-300" />
            <div>
              <h3 className="font-bold text-3xl mb-2">AI-Driven Protection</h3>
              <p className="text-gray-300 text-xl">Advanced AI to detect and stop copyright infringement across the web.</p>
            </div>
          </div>
          <div className="flex items-center gap-8 bg-[#232946]/90 rounded-2xl shadow-2xl p-10 border border-gray-700 hover:shadow-2xl transition-transform transform hover:-translate-y-2 animate-fade-in-left delay-200">
            <FaHandshake className="text-6xl text-green-300" />
            <div>
              <h3 className="font-bold text-3xl mb-2">Creator-First Commitment</h3>
              <p className="text-gray-300 text-xl">We put creators first—always. Fair pricing, transparent policies, and real support.</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-10">
          <div className="flex items-center gap-8 bg-[#232946]/90 rounded-2xl shadow-2xl p-10 border border-gray-700 hover:shadow-2xl transition-transform transform hover:-translate-y-2 animate-fade-in-right delay-100">
            <FaLock className="text-6xl text-blue-300" />
            <div>
              <h3 className="font-bold text-3xl mb-2">Privacy & Security</h3>
              <p className="text-gray-300 text-xl">Your data and content are protected with industry-leading security.</p>
            </div>
          </div>
          <div className="flex items-center gap-8 bg-[#232946]/90 rounded-2xl shadow-2xl p-10 border border-gray-700 hover:shadow-2xl transition-transform transform hover:-translate-y-2 animate-fade-in-right delay-200">
            <FaUsers className="text-6xl text-pink-300" />
            <div>
              <h3 className="font-bold text-3xl mb-2">Global Community</h3>
              <p className="text-gray-300 text-xl">Join thousands of creators and industry partners worldwide.</p>
            </div>
                  </div>
                </div>
      </section>

      {/* Features Section - 2 columns on desktop */}
      <section ref={featuresRef} className={`max-w-7xl mx-auto py-20 px-8 grid grid-cols-1 md:grid-cols-2 gap-16 transition-all duration-700 ${featuresVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="flex flex-col gap-14">
          <div className="bg-[#232946]/90 rounded-2xl shadow-2xl p-12 border border-gray-700 hover:shadow-2xl transition-transform transform hover:-translate-y-2 animate-fade-in-left delay-100">
            <FaShieldAlt className="text-7xl text-blue-400 mb-4" />
            <h3 className="font-bold text-3xl mb-2">Content Protection</h3>
            <p className="text-gray-300 text-xl">AI-powered copyright monitoring and takedown tools for your videos, music, and more.</p>
          </div>
          <div className="bg-[#232946]/90 rounded-2xl shadow-2xl p-12 border border-gray-700 hover:shadow-2xl transition-transform transform hover:-translate-y-2 animate-fade-in-left delay-200">
            <FaRocket className="text-7xl text-light-green-400 mb-4" />
            <h3 className="font-bold text-3xl mb-2">Growth Analytics</h3>
            <p className="text-gray-300 text-xl">Track your reach, audience, and engagement with beautiful dashboards.</p>
                  </div>
                </div>
        <div className="flex flex-col gap-14">
          <div className="bg-[#232946]/90 rounded-2xl shadow-2xl p-12 border border-gray-700 hover:shadow-2xl transition-transform transform hover:-translate-y-2 animate-fade-in-right delay-100">
            <FaRegSmile className="text-7xl text-pink-300 mb-4" />
            <h3 className="font-bold text-3xl mb-2">Easy Monetization</h3>
            <p className="text-gray-300 text-xl">Subscriptions, tips, and more—get paid for your creativity, instantly.</p>
          </div>
          <div className="bg-[#232946]/90 rounded-2xl shadow-2xl p-12 border border-gray-700 hover:shadow-2xl transition-transform transform hover:-translate-y-2 animate-fade-in-right delay-200">
            <FaRegLightbulb className="text-7xl text-yellow-300 mb-4" />
            <h3 className="font-bold text-3xl mb-2">Smart Automation</h3>
            <p className="text-gray-300 text-xl">Automate copyright claims, DMCA, and more with one click.</p>
          </div>
        </div>
      </section>

      {/* Subscription Plans Preview - 3 columns */}
      <section ref={plansRef} className={`max-w-6xl mx-auto py-20 px-8 text-center transition-all duration-700 ${plansVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <h2 className="text-4xl font-bold mb-10 text-blue-300">Subscription Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 justify-center mb-8">
          {[
            {
            name: "Free Trial",
            price: "$0",
            desc: "7 days access",
              color: "blue",
              icon: <FaCrown className="text-5xl text-blue-400 mb-4 mx-auto" />,
              features: [
                "All premium features",
                "Priority support",
                "Secure payments"
              ]
            },
            {
            name: "Monthly",
            price: "$50",
            desc: "per month",
              color: "light-green",
              icon: <FaGem className="text-5xl text-light-green-400 mb-4 mx-auto" />,
              features: [
                "All premium features",
                "Priority support",
                "Cancel anytime"
              ]
            },
            {
            name: "Yearly",
            price: "$50",
            desc: "per year",
              color: "red",
              icon: <FaRocket className="text-5xl text-red-400 mb-4 mx-auto" />,
              features: [
                "All premium features",
                "Priority support",
                "Best value"
              ]
            }
          ].map((plan, i) => (
            <div
              key={i}
              className={`bg-white/10 backdrop-blur-lg border-2 border-${plan.color}-500 rounded-3xl p-12 flex flex-col items-center min-w-[260px] shadow-2xl hover:shadow-3xl transition-transform transform hover:-translate-y-2 hover:scale-105 animate-fade-in-up delay-${i * 100}`}
            >
              {plan.icon}
              <div className="text-3xl font-bold mb-2 text-white">{plan.name}</div>
              <div className="text-5xl font-extrabold mb-2 text-blue-200">{plan.price}</div>
              <div className="mb-2 text-gray-300 text-xl">{plan.desc}</div>
              <ul className="mb-6 space-y-2 w-full max-w-xs mx-auto text-left">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center text-gray-100 text-base"><span className="mr-2 text-green-400">✔️</span> {feature}</li>
                ))}
              </ul>
              <Link href="/plans" className={`mt-2 inline-block bg-gradient-to-r from-${plan.color}-500 to-blue-500 hover:from-${plan.color}-600 hover:to-blue-600 text-white font-bold py-2 px-8 rounded-full shadow-lg text-lg transition-transform transform hover:scale-105`}>Choose Plan</Link>
            </div>
          ))}
        </div>
        <Link href="/plans" className="inline-block mt-6 bg-gradient-to-r from-blue-500 to-light-green-500 hover:from-blue-600 hover:to-light-green-600 text-white font-bold py-4 px-14 rounded-full shadow-lg text-2xl transition-transform transform hover:scale-105">View All Plans</Link>
      </section>

      {/* Our Commitment */}
      <section ref={commitRef} className={`max-w-5xl mx-auto py-20 px-8 text-center transition-all duration-700 ${commitVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="bg-[#232946]/80 rounded-2xl shadow-2xl p-14 border border-green-700">
          <h2 className="text-4xl font-bold mb-4 text-green-300">Our Commitment</h2>
          <p className="text-2xl text-gray-200 mb-2">
            We are committed to empowering creators with the best tools, fair pricing, and a secure, supportive community.
          </p>
          <p className="text-lg text-gray-300">
            Your success is our mission. We promise transparency, privacy, and relentless innovation for creators everywhere.
          </p>
        </div>
      </section>

      {/* Collaborators */}
      <section ref={collabRef} className={`max-w-6xl mx-auto py-16 px-8 text-center transition-all duration-700 ${collabVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <h2 className="text-3xl font-bold mb-10 text-yellow-200">Our Collaborators</h2>
        <div className="flex flex-wrap gap-12 justify-center items-center">
          {/* Replace with real logos or names as needed */}
          <div className="bg-white/10 rounded-xl px-12 py-6 text-3xl font-semibold text-white shadow">YouTube</div>
          <div className="bg-white/10 rounded-xl px-12 py-6 text-3xl font-semibold text-white shadow">Instagram</div>
          <div className="bg-white/10 rounded-xl px-12 py-6 text-3xl font-semibold text-white shadow">Spotify</div>
          <div className="bg-white/10 rounded-xl px-12 py-6 text-3xl font-semibold text-white shadow">Meta</div>
          <div className="bg-white/10 rounded-xl px-12 py-6 text-3xl font-semibold text-white shadow">More...</div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-10 text-center text-gray-400 text-xl bg-[#1a223f]/90 border-t border-gray-700">
        &copy; {new Date().getFullYear()} CreatorShield. All rights reserved.
      </footer>
    </div>
  );
}
