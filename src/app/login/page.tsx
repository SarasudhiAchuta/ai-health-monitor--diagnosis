"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { authClient } from "@/lib/auth-client";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { Zap, Sparkles, Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowRight, UserCheck } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams?.get("registered");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState("");
  const [statusNote, setStatusNote] = useState("");

  // Quick fill helper
  const fillDemo = () => {
    setEmail("demo@healthai.com");
    setPassword("password123");
    setError("");
    setStatusNote("Demo credentials filled! Click 'Login' or 'One-Click Demo Access' to proceed.");
  };

  // 1-Click instant login as Demo user
  const handleQuickDemo = async () => {
    setDemoLoading(true);
    setError("");
    setStatusNote("Signing in as Demo User...");

    try {
      const res = await authClient.signIn.email({
        email: "demo@healthai.com",
        password: "password123",
        rememberMe: true,
        callbackURL: "/dashboard",
      });

      if (res?.error) {
        setError(res.error.message || "Failed to log in with demo account.");
        setDemoLoading(false);
        setStatusNote("");
        return;
      }

      const token = (res?.data as any)?.token;
      if (token) {
        const tokenPart = typeof token === "string" && token.includes(".") ? token.split(".")[0] : token;
        localStorage.setItem("bearer_token", tokenPart);
      }

      // Initialize default data if needed
      try {
        const tokenToUse = localStorage.getItem("bearer_token");
        if (tokenToUse) {
          await fetch("/api/init-user-data", {
            method: "POST",
            headers: { Authorization: `Bearer ${tokenToUse}` },
          });
        }
      } catch (initErr) {
        console.warn("Init data warning:", initErr);
      }

      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.message || "Demo login failed.");
      setDemoLoading(false);
      setStatusNote("");
    }
  };

  // Custom User Login / Instant Access for ANY email & password
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    setError("");
    setStatusNote("Authenticating...");

    const cleanEmail = email.trim().toLowerCase();

    try {
      // 1. Attempt standard sign-in first
      const signInRes = await authClient.signIn.email({
        email: cleanEmail,
        password,
        rememberMe,
        callbackURL: "/dashboard",
      });

      if (!signInRes?.error) {
        // Success sign in!
        const token = (signInRes?.data as any)?.token;
        if (token) {
          const tokenPart = typeof token === "string" && token.includes(".") ? token.split(".")[0] : token;
          localStorage.setItem("bearer_token", tokenPart);
        }

        // Initialize user data if needed
        try {
          const tokenToUse = localStorage.getItem("bearer_token");
          if (tokenToUse) {
            await fetch("/api/init-user-data", {
              method: "POST",
              headers: { Authorization: `Bearer ${tokenToUse}` },
            });
          }
        } catch (initErr) {
          console.warn("Init data warning:", initErr);
        }

        router.push("/dashboard");
        return;
      }

      // 2. If sign-in failed, check if account doesn't exist yet!
      // Provide seamless automatic registration for ANY new user credentials
      setStatusNote("Setting up your new personalized health profile...");

      const derivedName = cleanEmail.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "Health User";

      const signUpRes = await authClient.signUp.email({
        email: cleanEmail,
        name: derivedName,
        password,
      });

      if (!signUpRes?.error) {
        // Successfully registered & signed in!
        const token = (signUpRes?.data as any)?.token;
        if (token) {
          const tokenPart = typeof token === "string" && token.includes(".") ? token.split(".")[0] : token;
          localStorage.setItem("bearer_token", tokenPart);
        }

        // Seed initial health metrics, appointments, and activities
        try {
          const tokenToUse = localStorage.getItem("bearer_token");
          if (tokenToUse) {
            await fetch("/api/init-user-data", {
              method: "POST",
              headers: { Authorization: `Bearer ${tokenToUse}` },
            });
          }
        } catch (initErr) {
          console.warn("Init data warning:", initErr);
        }

        router.push("/dashboard");
        return;
      }

      // 3. If sign-up failed because user ALREADY exists:
      // It means this email is registered, but the password provided was wrong!
      const signUpErr = signUpRes?.error?.message || "";
      const signUpCode = (signUpRes?.error as any)?.code || "";

      if (signUpCode === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL" || signUpErr.toLowerCase().includes("already exists")) {
        setError("❌ Incorrect password for this email. Please re-enter your password or use 'One-Click Demo Access'.");
      } else {
        setError(signUpErr || signInRes?.error?.message || "Invalid email or password. Please try again.");
      }
      setLoading(false);
      setStatusNote("");
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err?.message || "Login failed. Please check your network and credentials.");
      setLoading(false);
      setStatusNote("");
    }
  };

  return (
    <Card className="w-full max-w-lg p-8 shadow-2xl border-0 bg-white/95 backdrop-blur-md rounded-2xl">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center p-3 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl shadow-lg mb-4 text-white text-3xl">
          🏥
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">HealthAI Monitor</h1>
        <p className="text-gray-600 mt-1 text-sm">
          Sign in with any email & password or use instant Demo access 💙
        </p>
      </div>

      {registered && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl mb-5 text-sm flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>🎉 Account created successfully! Sign in below to enter.</span>
        </div>
      )}

      {/* QUICK DEMO ACCESS HERO CARD */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-200/80 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-sm">
              <Zap className="w-3.5 h-3.5" /> Instant
            </span>
            <span className="font-bold text-sm text-gray-900">Demo Account</span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={fillDemo}
            className="text-xs text-blue-700 hover:text-blue-900 hover:bg-blue-100/60 h-7 px-2"
          >
            Auto-fill
          </Button>
        </div>
        <p className="text-xs text-gray-600 font-mono mb-3 bg-white/80 py-1.5 px-3 rounded-lg border border-blue-100 flex items-center justify-between">
          <span>demo@healthai.com</span>
          <span className="text-gray-400">••••••••</span>
        </p>
        <Button
          type="button"
          onClick={handleQuickDemo}
          disabled={demoLoading || loading}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md font-medium text-sm h-10 transition-all transform hover:-translate-y-0.5"
        >
          {demoLoading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Logging in to Demo Account...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Zap className="w-4 h-4" />
              ⚡ One-Click Demo Access
            </span>
          )}
        </Button>
      </div>

      <div className="relative my-6 text-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <span className="relative px-3 bg-white text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Or Login With Your Own Email
        </span>
      </div>

      {/* Info Badge */}
      <div className="mb-4 px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-700 flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
        <span>
          <strong>Universal Access:</strong> Enter <em>any</em> email and password. If you don't have an account yet, one will be created automatically with sample medical records!
        </span>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm font-medium">
          {error}
        </div>
      )}

      {statusNote && !error && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2.5 rounded-xl mb-4 text-xs flex items-center gap-2">
          <span className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span>{statusNote}</span>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <Label htmlFor="email" className="text-xs font-semibold text-gray-700 flex items-center gap-1.5 mb-1.5">
            <Mail className="w-3.5 h-3.5 text-blue-600" />
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="yourname@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-11 rounded-xl focus-visible:ring-blue-500"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <Label htmlFor="password" className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-blue-600" />
              Password
            </Label>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-xs text-gray-500 hover:text-gray-800 flex items-center gap-1"
            >
              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter any password (min 4 chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="h-11 rounded-xl focus-visible:ring-blue-500"
          />
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked as boolean)}
            />
            <label htmlFor="remember" className="text-xs text-gray-600 cursor-pointer select-none">
              Remember me on this browser
            </label>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full text-base font-semibold h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-lg transition-all transform hover:-translate-y-0.5"
          disabled={loading || demoLoading}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Connecting Account...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              Log In & Access Dashboard
              <ArrowRight className="w-4 h-4" />
            </span>
          )}
        </Button>
      </form>

      <div className="mt-6 text-center space-y-2">
        <p className="text-xs text-gray-600">
          Prefer full registration?{" "}
          <Link href="/register" className="text-blue-600 hover:underline font-semibold">
            Create Custom Profile 🚀
          </Link>
        </p>
        <Link href="/" className="text-xs text-gray-500 hover:text-gray-800 block">
          ← Back to Homepage
        </Link>
      </div>

      <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-center gap-6 text-2xl text-gray-400">
        <span title="Doctor Care">🩺</span>
        <span title="AI Diagnosis">🔬</span>
        <span title="Prescription Management">💊</span>
        <span title="Live Monitoring">📊</span>
      </div>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center p-4">
      <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
