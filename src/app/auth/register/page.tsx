"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", location: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Function to generate default avatar (e.g., initials-based)
  function generateAvatar(name: string) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const avatar = generateAvatar(form.name);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, avatar }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.success) {
      setSuccess(true);
      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
    } else {
      setError(data.error || "Registration failed");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-purple-200">
      <Card className="w-full max-w-lg shadow-2xl border-0">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-blue-700 mb-2">Register for CreatorShield</CardTitle>
          <p className="text-muted-foreground text-base">Create your account to access the dashboard</p>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="text-center text-green-600 font-semibold text-lg py-8">
              Registration successful! Redirecting to your dashboard...
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                name="name"
                placeholder="Name"
                value={form.name}
                onChange={handleChange}
                required
                className="rounded-lg shadow-sm"
              />
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
              <Input
                name="location"
                placeholder="Location (required for Admin)"
                value={form.location}
                onChange={handleChange}
                className="rounded-lg shadow-sm"
              />
              {error && <div className="text-red-500 text-sm text-center">{error}</div>}
              <Button type="submit" className="w-full bg-blue-700 hover:bg-blue-800 text-white text-lg font-semibold rounded-lg shadow-md" disabled={loading}>
                {loading ? "Registering..." : "Register"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 