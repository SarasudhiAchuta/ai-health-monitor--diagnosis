"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { 
  Database, 
  Server, 
  Layout, 
  Shield, 
  Package, 
  GitBranch,
  Layers,
  Globe,
  Lock,
  Code2,
  Zap,
  Cloud
} from "lucide-react";

export default function ArchitecturePage() {
  const router = useRouter();

  const techStack = {
    frontend: {
      title: "Frontend Technologies",
      icon: Layout,
      color: "from-blue-500 to-cyan-500",
      items: [
        { name: "Next.js 15", description: "React framework with App Router", version: "15.3.5" },
        { name: "React 19", description: "UI library with Server Components", version: "19.0.0" },
        { name: "TypeScript 5", description: "Type-safe JavaScript", version: "5.x" },
        { name: "Tailwind CSS 4", description: "Utility-first CSS framework", version: "4.x" },
        { name: "Framer Motion", description: "Animation library", version: "12.23.22" },
      ]
    },
    uiLibraries: {
      title: "UI Component Libraries",
      icon: Package,
      color: "from-purple-500 to-pink-500",
      items: [
        { name: "Radix UI", description: "Accessible component primitives", version: "Multiple" },
        { name: "Lucide React", description: "Beautiful icon set", version: "0.545.0" },
        { name: "Recharts", description: "Chart library for data visualization", version: "3.0.2" },
        { name: "Sonner", description: "Toast notifications", version: "2.0.6" },
        { name: "React Hook Form", description: "Form validation", version: "7.60.0" },
      ]
    },
    backend: {
      title: "Backend Technologies",
      icon: Server,
      color: "from-green-500 to-emerald-500",
      items: [
        { name: "Next.js API Routes", description: "RESTful API endpoints", version: "15.3.5" },
        { name: "Better Auth", description: "Authentication system", version: "1.3.10" },
        { name: "Bearer Token Plugin", description: "API authentication", version: "Built-in" },
        { name: "Middleware", description: "Route protection", version: "Custom" },
      ]
    },
    database: {
      title: "Database & ORM",
      icon: Database,
      color: "from-orange-500 to-red-500",
      items: [
        { name: "Turso", description: "Edge SQLite database", version: "Cloud" },
        { name: "LibSQL Client", description: "Database client", version: "0.15.15" },
        { name: "Drizzle ORM", description: "TypeScript ORM", version: "0.44.6" },
        { name: "Drizzle Kit", description: "Migration tool", version: "0.31.5" },
      ]
    },
    security: {
      title: "Security & Auth",
      icon: Shield,
      color: "from-yellow-500 to-amber-500",
      items: [
        { name: "Better Auth", description: "Email/password authentication", version: "1.3.10" },
        { name: "Bcrypt", description: "Password hashing", version: "6.0.0" },
        { name: "Session Management", description: "Secure session tokens", version: "Built-in" },
        { name: "Protected Routes", description: "Middleware-based protection", version: "Custom" },
      ]
    },
    payments: {
      title: "Payment Processing",
      icon: Zap,
      color: "from-indigo-500 to-blue-500",
      items: [
        { name: "Stripe", description: "Payment processing", version: "19.1.0" },
        { name: "Autumn JS", description: "Subscription management", version: "0.1.40" },
        { name: "ATMN", description: "Payment utilities", version: "0.0.24" },
      ]
    }
  };

  const databaseSchema = [
    { 
      table: "user", 
      description: "User accounts and profiles", 
      fields: ["id", "name", "email", "emailVerified", "image", "createdAt", "updatedAt"] 
    },
    { 
      table: "session", 
      description: "Active user sessions", 
      fields: ["id", "token", "userId", "expiresAt", "ipAddress", "userAgent"] 
    },
    { 
      table: "account", 
      description: "OAuth provider accounts", 
      fields: ["id", "accountId", "providerId", "userId", "accessToken", "password"] 
    },
    { 
      table: "verification", 
      description: "Email verification tokens", 
      fields: ["id", "identifier", "value", "expiresAt"] 
    },
    { 
      table: "assessments", 
      description: "Health symptom assessments", 
      fields: ["id", "userId", "symptoms", "additionalInfo", "results", "createdAt"] 
    },
    { 
      table: "healthMetrics", 
      description: "User health measurements", 
      fields: ["id", "userId", "heartRate", "bloodPressure", "dailySteps", "sleepHours", "recordedAt"] 
    },
    { 
      table: "appointments", 
      description: "Doctor appointments", 
      fields: ["id", "userId", "doctorName", "specialty", "appointmentDate", "status"] 
    },
    { 
      table: "medications", 
      description: "Prescribed medications", 
      fields: ["id", "userId", "name", "dosage", "frequency", "duration", "status", "progress"] 
    },
    { 
      table: "healthActivities", 
      description: "User health activity log", 
      fields: ["id", "userId", "activityType", "title", "description", "createdAt"] 
    },
    { 
      table: "chatMessages", 
      description: "AI chatbot conversation history", 
      fields: ["id", "userId", "role", "content", "createdAt"] 
    },
  ];

  const apiEndpoints = [
    { method: "POST", path: "/api/auth/[...all]", description: "Better Auth endpoints (login, register, session)" },
    { method: "GET", path: "/api/assessments", description: "Get user health assessments" },
    { method: "POST", path: "/api/assessments", description: "Create new health assessment" },
    { method: "GET", path: "/api/health-metrics", description: "Get user health metrics" },
    { method: "POST", path: "/api/health-metrics", description: "Record new health metrics" },
    { method: "GET", path: "/api/appointments", description: "Get user appointments" },
    { method: "POST", path: "/api/appointments", description: "Create new appointment" },
    { method: "PUT", path: "/api/appointments/[id]", description: "Update appointment status" },
    { method: "GET", path: "/api/medications", description: "Get user medications" },
    { method: "POST", path: "/api/medications", description: "Add new medication" },
    { method: "PUT", path: "/api/medications/[id]", description: "Update medication progress" },
    { method: "GET", path: "/api/health-activities", description: "Get health activity log" },
    { method: "POST", path: "/api/health-activities", description: "Log health activity" },
    { method: "GET", path: "/api/chat-messages", description: "Get chat history" },
    { method: "POST", path: "/api/chat-messages", description: "Send chat message" },
  ];

  const features = [
    { name: "AI Symptom Checker", description: "Analyze symptoms and predict diseases", icon: "🩺" },
    { name: "Doctor Recommendations", description: "Match with specialist doctors", icon: "👨‍⚕️" },
    { name: "Medicine Guidance", description: "Get medication recommendations", icon: "💊" },
    { name: "AI Health Chatbot", description: "24/7 health consultation", icon: "💬" },
    { name: "Health Dashboard", description: "Track metrics and progress", icon: "📊" },
    { name: "Appointment Scheduling", description: "Manage doctor appointments", icon: "📅" },
    { name: "Health Metrics Tracking", description: "Monitor vitals and activities", icon: "❤️" },
    { name: "Medication Management", description: "Track treatment progress", icon: "💉" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="text-3xl">🏥</div>
            <span className="text-xl font-bold text-blue-600">HealthAI Monitor - Architecture</span>
          </div>
          <Button onClick={() => router.push("/")} variant="outline">
            Back to Home 🏠
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-12 text-center">
        <div className="text-5xl mb-4">🏗️📊💻</div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          System Architecture & Tech Stack
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Complete overview of all technologies, databases, APIs, and components powering HealthAI Monitor
        </p>
      </section>

      {/* Tech Stack Grid */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {Object.entries(techStack).map(([key, section]) => {
            const Icon = section.icon;
            return (
              <Card key={key} className="p-6 hover:shadow-xl transition-shadow">
                <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${section.color} mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4">{section.title}</h3>
                <div className="space-y-3">
                  {section.items.map((item, idx) => (
                    <div key={idx} className="border-l-2 border-gray-200 pl-3">
                      <div className="font-semibold text-sm">{item.name}</div>
                      <div className="text-xs text-gray-600">{item.description}</div>
                      <div className="text-xs text-blue-600 font-mono">v{item.version}</div>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Database Schema */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="inline-flex p-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
              <Database className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold">Database Schema (10 Tables)</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {databaseSchema.map((schema, idx) => (
              <Card key={idx} className="p-5 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">💾</div>
                  <div className="flex-1">
                    <h4 className="font-bold text-lg mb-1">{schema.table}</h4>
                    <p className="text-sm text-gray-600 mb-3">{schema.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {schema.fields.map((field, fidx) => (
                        <span key={fidx} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {field}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* API Endpoints */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="inline-flex p-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold">API Endpoints ({apiEndpoints.length} Routes)</h2>
          </div>
          <Card className="p-6">
            <div className="space-y-3">
              {apiEndpoints.map((endpoint, idx) => (
                <div key={idx} className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <span className={`text-xs font-mono font-bold px-2 py-1 rounded ${
                    endpoint.method === 'GET' ? 'bg-green-100 text-green-700' :
                    endpoint.method === 'POST' ? 'bg-blue-100 text-blue-700' :
                    'bg-orange-100 text-orange-700'
                  }`}>
                    {endpoint.method}
                  </span>
                  <div className="flex-1">
                    <code className="text-sm font-mono text-gray-800">{endpoint.path}</code>
                    <p className="text-xs text-gray-600 mt-1">{endpoint.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Application Features */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="inline-flex p-3 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold">Key Features ({features.length})</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            {features.map((feature, idx) => (
              <Card key={idx} className="p-4 text-center hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-2">{feature.icon}</div>
                <h4 className="font-bold text-sm mb-1">{feature.name}</h4>
                <p className="text-xs text-gray-600">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Architecture Flow */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="inline-flex p-3 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500">
              <GitBranch className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold">Architecture Flow</h2>
          </div>
          <Card className="p-8">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-bold min-w-[200px]">
                  👤 User Browser
                </div>
                <div className="flex-1 h-0.5 bg-gray-300"></div>
                <div className="text-gray-500">→</div>
              </div>

              <div className="flex items-center gap-4">
                <div className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg font-bold min-w-[200px]">
                  ⚛️ React 19 + Next.js 15
                </div>
                <div className="flex-1 h-0.5 bg-gray-300"></div>
                <div className="text-gray-500">→</div>
              </div>

              <div className="flex items-center gap-4">
                <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg font-bold min-w-[200px]">
                  🔒 Better Auth Middleware
                </div>
                <div className="flex-1 h-0.5 bg-gray-300"></div>
                <div className="text-gray-500">→</div>
              </div>

              <div className="flex items-center gap-4">
                <div className="bg-orange-100 text-orange-700 px-4 py-2 rounded-lg font-bold min-w-[200px]">
                  🌐 Next.js API Routes
                </div>
                <div className="flex-1 h-0.5 bg-gray-300"></div>
                <div className="text-gray-500">→</div>
              </div>

              <div className="flex items-center gap-4">
                <div className="bg-pink-100 text-pink-700 px-4 py-2 rounded-lg font-bold min-w-[200px]">
                  🗄️ Drizzle ORM
                </div>
                <div className="flex-1 h-0.5 bg-gray-300"></div>
                <div className="text-gray-500">→</div>
              </div>

              <div className="flex items-center gap-4">
                <div className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-lg font-bold min-w-[200px]">
                  ☁️ Turso Database (SQLite)
                </div>
                <div className="flex-1"></div>
              </div>
            </div>
          </Card>
        </div>

        {/* Development Tools */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="inline-flex p-3 rounded-lg bg-gradient-to-r from-red-500 to-pink-500">
              <Code2 className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold">Development Tools</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6">
              <Lock className="w-8 h-8 text-blue-600 mb-3" />
              <h4 className="font-bold mb-2">Type Safety</h4>
              <p className="text-sm text-gray-600">TypeScript 5, Zod validation, Drizzle ORM type inference</p>
            </Card>
            <Card className="p-6">
              <Layers className="w-8 h-8 text-green-600 mb-3" />
              <h4 className="font-bold mb-2">Code Quality</h4>
              <p className="text-sm text-gray-600">ESLint, Next.js ESLint config, strict TypeScript</p>
            </Card>
            <Card className="p-6">
              <Cloud className="w-8 h-8 text-purple-600 mb-3" />
              <h4 className="font-bold mb-2">Deployment Ready</h4>
              <p className="text-sm text-gray-600">Edge-ready, Vercel optimized, serverless architecture</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">Built with modern web technologies for optimal performance and security 🚀</p>
        </div>
      </footer>
    </div>
  );
}
