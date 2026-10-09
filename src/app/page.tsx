"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";

export default function Home() {
  const router = useRouter();
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="text-3xl">🏥</div>
            <span className="text-xl font-bold text-blue-600">HealthAI Monitor</span>
          </div>
          <div className="flex gap-3">
            {session?.user ? (
              <Button onClick={() => router.push("/dashboard")} size="lg">
                Dashboard 📊
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => router.push("/login")} size="lg">
                  ⚡ Login / Demo 👋
                </Button>
                <Button onClick={() => router.push("/register")} size="lg">
                  Sign Up 🚀
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-6xl mb-6">🩺💙🤖</div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            Your AI-Powered Health Guardian
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Monitor your health, assess symptoms, get AI recommendations, and connect with doctors - all in one place! 🌟
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button size="lg" className="text-lg" onClick={() => router.push(session?.user ? "/dashboard" : "/register")}>
              {session?.user ? "Go to Dashboard 📊" : "Get Started Free 🎉"}
            </Button>
            <Button size="lg" variant="outline" className="text-lg" onClick={() => router.push("/assessment")}>
              Try Symptom Checker 🔍
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-5xl mb-4">🩺</div>
            <h3 className="text-xl font-semibold mb-2">Smart Symptom Checker</h3>
            <p className="text-gray-600">
              Describe your symptoms and get instant AI-powered disease probability analysis with accuracy
            </p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-5xl mb-4">👨‍⚕️</div>
            <h3 className="text-xl font-semibold mb-2">Doctor Recommendations</h3>
            <p className="text-gray-600">
              Get matched with specialist doctors based on your diagnosis and location
            </p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-5xl mb-4">💊</div>
            <h3 className="text-xl font-semibold mb-2">Medicine Guidance</h3>
            <p className="text-gray-600">
              Receive detailed medicine recommendations with dosage and usage instructions
            </p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-5xl mb-4">💬</div>
            <h3 className="text-xl font-semibold mb-2">AI Health Chatbot</h3>
            <p className="text-gray-600">
              24/7 AI assistant to answer health questions and provide instant support
            </p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-5xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">Health Dashboard</h3>
            <p className="text-gray-600">
              Track your health metrics, appointments, and treatment progress in one place
            </p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-5xl mb-4">🔒</div>
            <h3 className="text-xl font-semibold mb-2">Secure & Private</h3>
            <p className="text-gray-600">
              Your health data is encrypted and protected with enterprise-grade security
            </p>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-green-600 py-16">
        <div className="container mx-auto px-4 text-center text-white">
          <div className="text-5xl mb-4">✨🏥✨</div>
          <h2 className="text-3xl font-bold mb-4">Ready to Take Control of Your Health?</h2>
          <p className="text-xl mb-8 opacity-90">Join thousands of users monitoring their health with AI</p>
          <Button size="lg" variant="secondary" className="text-lg" onClick={() => router.push("/register")}>
            Start Your Health Journey 🚀
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">© 2024 HealthAI Monitor. Empowering healthier lives. 💙</p>
        </div>
      </footer>
    </div>
  );
}