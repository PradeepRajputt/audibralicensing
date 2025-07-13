"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useDashboardRefresh } from '@/app/dashboard/dashboard-context';

export default function LoginPage() {
  const router = useRouter();
  const dashboardRefresh = useDashboardRefresh();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (data.token) {
      // Store JWT in localStorage or cookie
      localStorage.setItem("creator_jwt", data.token);
      if (dashboardRefresh) await dashboardRefresh();
      if (data.user && data.user.role === 'admin') {
        router.push("/admin");
      } else {
        router.push("/dashboard/overview");
      }
    } else {
      setError(data.error || "Login failed");
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "/api/auth/google";
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-purple-200">
      <Card className="w-full max-w-lg shadow-2xl border-0">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-blue-700 mb-2">Login to CreatorShield</CardTitle>
          <p className="text-muted-foreground text-base">Access your dashboard</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              name="email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
              className="rounded-lg shadow-sm"
            />
            <Input
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              className="rounded-lg shadow-sm"
            />
            {error && <div className="text-red-500 text-sm text-center">{error}</div>}
            <Button type="submit" className="w-full bg-blue-700 hover:bg-blue-800 text-white text-lg font-semibold rounded-lg shadow-md" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
          <div className="my-4 text-center text-muted-foreground">or</div>
          <Button onClick={handleGoogleLogin} className="w-full bg-white text-black border border-gray-300 hover:bg-blue-50">
            <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google logo" width={24} height={24} className="mr-2 inline-block align-middle" />
            Sign in with Google
          </Button>
        </CardContent>
        <div className="flex flex-col gap-2 p-4">
          <Button variant="secondary" onClick={() => router.push('/auth/register')} className="w-full">Register</Button>
        </div>
      </Card>
    </div>
  );
}