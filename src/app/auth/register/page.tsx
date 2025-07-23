"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Image from "next/image";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "", location: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  function generateAvatar(name: string) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    if (!form.name || !form.email || !form.password || !form.confirm) {
      setError("All fields are required.");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    const avatar = generateAvatar(form.name);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.name, email: form.email, password: form.password, location: form.location, avatar }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.success) {
      setSuccess(true);
      // Always redirect to login after registration
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          // If user came from plans, keep postAuthRedirect in localStorage
          // (already set by plans page)
        }
        router.push('/plans');
      }, 1500);
    } else {
      setError(data.error || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#181c2f] to-[#232946] px-4 py-12">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-full bg-white/10 shadow-lg flex items-center justify-center mb-4 border-2 border-blue-200">
            <img src="/favicon.ico" alt="CreatorShield Logo" className="w-14 h-14" />
          </div>
          <h1 className="text-2xl font-bold text-blue-100 mb-2 tracking-tight">Create Your Account</h1>
          <p className="text-base text-blue-200 mb-2">Sign up to access the CreatorShield dashboard</p>
        </div>
        <div className="bg-[#232946]/80 backdrop-blur rounded-2xl shadow-xl p-8 border border-blue-900/30">
          {success ? (
            <div className="text-center text-green-400 font-semibold text-lg py-8">
              Registration successful! Redirecting to login...
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-blue-100 mb-1">Name</label>
                <Input
                  name="name"
                  placeholder="Enter your name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="rounded-md border border-blue-900/30 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 bg-[#232946]/60 text-white placeholder:text-blue-100"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-blue-100 mb-1">Email</label>
                <Input
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="rounded-md border border-blue-900/30 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 bg-[#232946]/60 text-white placeholder:text-blue-100"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-blue-100 mb-1">Password</label>
                <Input
                  name="password"
                  type="password"
                  placeholder="Create a password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="rounded-md border border-blue-900/30 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 bg-[#232946]/60 text-white placeholder:text-blue-100"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-blue-100 mb-1">Confirm Password</label>
                <Input
                  name="confirm"
                  type="password"
                  placeholder="Re-enter your password"
                  value={form.confirm}
                  onChange={handleChange}
                  required
                  className="rounded-md border border-blue-900/30 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 bg-[#232946]/60 text-white placeholder:text-blue-100"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-blue-100 mb-1">Location <span className="text-xs text-blue-300">(required for Admin)</span></label>
                <Input
                  name="location"
                  placeholder="Your location"
                  value={form.location}
                  onChange={handleChange}
                  className="rounded-md border border-blue-900/30 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 bg-[#232946]/60 text-white placeholder:text-blue-100"
                />
              </div>
              {error && <div className="text-red-400 text-xs text-center font-semibold">{error}</div>}
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white text-base font-semibold rounded-md mt-2 transition-all duration-200" disabled={loading}>
                {loading ? "Registering..." : "Register"}
              </Button>
            </form>
          )}
          <div className="mt-6 text-center">
            <span className="text-blue-200 text-sm">Already have an account?</span>
            <Button variant="link" onClick={() => router.push('/auth/login')} className="ml-2 text-blue-400 font-semibold text-sm">Login</Button>
          </div>
        </div>
      </div>
    </div>
  );
} 