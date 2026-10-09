"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords don't match 😅");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters 🔒");
      setLoading(false);
      return;
    }

    try {
      const { data, error: authError } = await authClient.signUp.email({
        email,
        name,
        password,
      });

      if (authError) {
        console.error("Registration error:", authError);
        const errorMessage = authError.message || "Registration failed. Please try again 😢";
        setError(errorMessage);
        setLoading(false);
        return;
      }

      // If token is returned directly, save it
      const token = (data as any)?.token;
      if (token) {
        const tokenPart = typeof token === 'string' && token.includes('.') ? token.split('.')[0] : token;
        localStorage.setItem("bearer_token", tokenPart);
      }

      // Initialize default user health data
      try {
        const storedToken = localStorage.getItem("bearer_token");
        if (storedToken) {
          await fetch("/api/init-user-data", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          });
        }
      } catch (initErr) {
        console.warn("Initial user data seeding warning:", initErr);
      }

      // Redirect directly to dashboard for immediate access
      router.push("/dashboard");
    } catch (err) {
      console.error("Unexpected registration error:", err);
      setError("An unexpected error occurred. Please try again. 😢");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-blue-50 to-purple-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 shadow-2xl">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">🎉🏥✨</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Join HealthAI!</h1>
          <p className="text-gray-600">Create your account and start monitoring your health 💪</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <Label htmlFor="name" className="flex items-center gap-2">
              👤 Full Name
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="email" className="flex items-center gap-2">
              📧 Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="password" className="flex items-center gap-2">
              🔒 Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1"
              autoComplete="off"
            />
          </div>

          <div>
            <Label htmlFor="confirmPassword" className="flex items-center gap-2">
              🔐 Confirm Password
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="mt-1"
              autoComplete="off"
            />
          </div>

          <Button type="submit" className="w-full text-lg" size="lg" disabled={loading}>
            {loading ? "Creating Account... ⏳" : "Sign Up 🚀"}
          </Button>
        </form>

        <div className="mt-6 text-center space-y-3">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 hover:underline font-semibold">
              Login 👋
            </Link>
          </p>
          <Link href="/" className="text-sm text-blue-600 hover:underline block">
            ← Back to Home
          </Link>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex justify-center gap-3 text-3xl">
            <span>😊</span>
            <span>💙</span>
            <span>🌟</span>
            <span>🎯</span>
            <span>✨</span>
          </div>
        </div>
      </Card>
    </div>
  );
}