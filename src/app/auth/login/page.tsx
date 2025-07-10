"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
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
      router.push("/dashboard/overview");
    } else {
      setError(data.error || "Login failed");
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "/api/auth/google";
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md p-6">
        <CardHeader>
          <CardTitle>Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              name="email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
            />
            <Input
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
            />
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <Button type="submit" className="w-full" disabled={loading}>
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
          <Button variant="outline" onClick={() => router.push('/dashboard/overview')} className="w-full">Go to Creator Dashboard</Button>
          <Button variant="secondary" onClick={() => router.push('/auth/register')} className="w-full">Register</Button>
        </div>
      </Card>
    </div>
  );
}