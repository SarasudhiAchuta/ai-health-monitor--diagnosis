"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient, useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Activity,
  Heart,
  Calendar,
  Pill,
  TrendingUp,
  User,
  LogOut,
  MessageSquare,
  Stethoscope,
  ClipboardList,
  Loader2,
  Plus,
  Sparkles,
  Mail,
} from "lucide-react";
import { AIChat } from "@/components/AIChat";
import { toast } from "sonner";

interface HealthMetric {
  id: number;
  heartRate: number;
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  dailySteps: number;
  sleepHours: number;
  recordedAt: string;
}

interface Appointment {
  id: number;
  doctorName: string;
  specialty: string;
  appointmentType: string;
  appointmentDate: string;
  location: string;
  phone: string;
  status: string;
}

interface Medication {
  id: number;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  progress: number;
  status: string;
  startDate: string;
  endDate: string | null;
}

interface HealthActivity {
  id: number;
  activityType: string;
  title: string;
  description: string;
  createdAt: string;
}

export default function DashboardPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [chatOpen, setChatOpen] = useState(false);
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [activities, setActivities] = useState<HealthActivity[]>([]);
  const [loading, setLoading] = useState(true);

  // Appointment Modal
  const [addApptOpen, setAddApptOpen] = useState(false);
  const [apptSubmitting, setApptSubmitting] = useState(false);
  const [doctorName, setDoctorName] = useState("");
  const [specialty, setSpecialty] = useState("General Practice");
  const [apptType, setApptType] = useState("Checkup");
  const [apptDate, setApptDate] = useState("");
  const [apptLocation, setApptLocation] = useState("City Health Clinic");
  const [apptPhone, setApptPhone] = useState("(555) 234-5678");

  // Medication Modal
  const [addMedOpen, setAddMedOpen] = useState(false);
  const [medSubmitting, setMedSubmitting] = useState(false);
  const [medName, setMedName] = useState("");
  const [medDosage, setMedDosage] = useState("500mg");
  const [medFrequency, setMedFrequency] = useState("Once daily");
  const [medDuration, setMedDuration] = useState("30 days");
  const [medNotes, setMedNotes] = useState("Take with water");

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (session?.user) {
      fetchDashboardData();
    }
  }, [session]);

  const fetchDashboardData = async () => {
    const token = localStorage.getItem("bearer_token");
    if (!token) return;

    try {
      // Fetch all dashboard data in parallel
      const [metricsRes, appointmentsRes, medicationsRes, activitiesRes] = await Promise.all([
        fetch("/api/health-metrics", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/appointments?limit=10", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/medications?limit=10", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/health-activities?limit=10", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      let hasAppts = false;
      let hasMeds = false;

      if (metricsRes.ok) {
        const metrics = await metricsRes.json();
        setHealthMetrics(metrics);
      }

      if (appointmentsRes.ok) {
        const appts = await appointmentsRes.json();
        setAppointments(appts);
        if (appts && appts.length > 0) hasAppts = true;
      }

      if (medicationsRes.ok) {
        const meds = await medicationsRes.json();
        setMedications(meds);
        if (meds && meds.length > 0) hasMeds = true;
      }

      if (activitiesRes.ok) {
        const acts = await activitiesRes.json();
        setActivities(acts);
      }

      // If user has zero appointments and medications (fresh account), auto-populate starter records
      if (!hasAppts && !hasMeds) {
        try {
          const initRes = await fetch("/api/init-user-data", {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
          });
          if (initRes.ok) {
            // Re-fetch to display initial records
            const [newApptsRes, newMedsRes, newActsRes] = await Promise.all([
              fetch("/api/appointments?limit=10", { headers: { Authorization: `Bearer ${token}` } }),
              fetch("/api/medications?limit=10", { headers: { Authorization: `Bearer ${token}` } }),
              fetch("/api/health-activities?limit=10", { headers: { Authorization: `Bearer ${token}` } }),
            ]);
            if (newApptsRes.ok) setAppointments(await newApptsRes.json());
            if (newMedsRes.ok) setMedications(await newMedsRes.json());
            if (newActsRes.ok) setActivities(await newActsRes.json());
          }
        } catch (initErr) {
          console.warn("Init user data auto-seed:", initErr);
        }
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedData = async () => {
    const token = localStorage.getItem("bearer_token");
    if (!token) return;
    toast.loading("Loading health records...");
    try {
      await fetch("/api/init-user-data", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchDashboardData();
      toast.dismiss();
      toast.success("Health records refreshed! 🎉");
    } catch (err) {
      toast.dismiss();
      toast.error("Failed to load records");
    }
  };

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("bearer_token");
    if (!token) return;

    if (!doctorName.trim() || !apptDate) {
      toast.error("Doctor name and date are required");
      return;
    }

    setApptSubmitting(true);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          doctorName: doctorName.trim(),
          specialty: specialty.trim(),
          appointmentType: apptType.trim(),
          appointmentDate: new Date(apptDate).toISOString(),
          location: apptLocation.trim(),
          phone: apptPhone.trim(),
        }),
      });

      if (res.ok) {
        const created = await res.json();
        setAppointments((prev) => [created, ...prev]);
        toast.success("Appointment scheduled successfully! 📅");
        setAddApptOpen(false);
        setDoctorName("");
        setApptDate("");
        // log activity
        await fetch("/api/health-activities", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            activityType: "appointment",
            title: `Scheduled with ${doctorName}`,
            description: `${apptType} with ${doctorName} at ${apptLocation}`,
          }),
        });
        fetchDashboardData();
      } else {
        const errData = await res.json();
        toast.error(errData.error || "Failed to schedule appointment");
      }
    } catch (err) {
      toast.error("Failed to schedule appointment");
    } finally {
      setApptSubmitting(false);
    }
  };

  const handleCreateMedication = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("bearer_token");
    if (!token) return;

    if (!medName.trim()) {
      toast.error("Medication name is required");
      return;
    }

    setMedSubmitting(true);
    try {
      const res = await fetch("/api/medications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: medName.trim(),
          dosage: medDosage.trim(),
          frequency: medFrequency.trim(),
          duration: medDuration.trim(),
          startDate: new Date().toISOString(),
          notes: medNotes.trim(),
        }),
      });

      if (res.ok) {
        const created = await res.json();
        setMedications((prev) => [created, ...prev]);
        toast.success("Medication added! 💊");
        setAddMedOpen(false);
        setMedName("");
        fetchDashboardData();
      } else {
        const errData = await res.json();
        toast.error(errData.error || "Failed to add medication");
      }
    } catch (err) {
      toast.error("Failed to add medication");
    } finally {
      setMedSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    const { error } = await authClient.signOut();
    if (error?.code) {
      toast.error(error.code);
    } else {
      localStorage.removeItem("bearer_token");
      router.push("/");
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "symptom_check":
        return "🩺";
      case "chat_session":
        return "💬";
      case "lab_results":
        return "📊";
      case "appointment":
        return "📅";
      default:
        return "📋";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const getUpcomingAppointments = () => {
    return appointments
      .filter((apt) => {
        const aptDate = new Date(apt.appointmentDate);
        return aptDate > new Date() && apt.status === "scheduled";
      })
      .slice(0, 3);
  };

  const getActiveMedications = () => {
    return medications.filter((med) => med.status === "active").slice(0, 3);
  };

  if (isPending || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="text-center p-8 bg-white/80 rounded-2xl shadow-xl backdrop-blur-md">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900 mb-1">Loading Health Dashboard</h2>
          <p className="text-gray-500 text-sm">Retrieving your encrypted health telemetry...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) return null;

  const upcomingAppointments = getUpcomingAppointments();
  const activeMedications = getActiveMedications();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="border-b bg-white/85 backdrop-blur-md sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-3.5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 text-white rounded-xl text-xl shadow-md">🏥</div>
            <div className="flex flex-col">
              <span className="text-lg font-extrabold text-gray-900 leading-tight">HealthAI Monitor</span>
              <span className="text-xs text-blue-600 font-medium">Smart Healthcare Portal</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => router.push("/")} className="hidden sm:inline-flex">
              Home 🏠
            </Button>
            {/* User Profile Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200/80 rounded-full text-xs">
              <User className="w-3.5 h-3.5 text-blue-600" />
              <span className="font-semibold text-gray-900">{session.user.name}</span>
              <span className="hidden md:inline text-gray-500 font-mono">({session.user.email})</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSeedData}
              title="Refresh / Seed Health Data"
              className="text-xs hidden lg:flex items-center gap-1.5 border-indigo-200 text-indigo-700 bg-indigo-50/50 hover:bg-indigo-100"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Sample Data
            </Button>
            <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sign Out">
              <LogOut className="w-4 h-4 text-gray-600" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-1">
              Welcome, {session.user.name}! 👋
            </h1>
            <p className="text-gray-600 text-base flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-500" />
              <span>Signed in as <strong className="text-gray-800">{session.user.email}</strong></span>
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs text-emerald-600 font-medium">Active Session</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => setAddApptOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm text-sm"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-1" /> Book Appointment
            </Button>
            <Button
              onClick={() => setAddMedOpen(true)}
              variant="outline"
              className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 text-sm"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-1" /> Add Medication
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Button
            size="lg"
            className="h-auto py-5 flex flex-col gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md transition-all transform hover:-translate-y-0.5"
            onClick={() => router.push("/assessment")}
          >
            <Stethoscope className="w-7 h-7" />
            <span className="text-lg font-semibold">Check Symptoms 🔍</span>
            <span className="text-xs text-blue-100 font-normal">AI condition probability analysis</span>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-auto py-5 flex flex-col gap-2 border-2 hover:bg-blue-50/50 shadow-sm transition-all transform hover:-translate-y-0.5"
            onClick={() => setChatOpen(true)}
          >
            <MessageSquare className="w-7 h-7 text-blue-600" />
            <span className="text-lg font-semibold text-gray-900">AI Health Chat 💬</span>
            <span className="text-xs text-gray-500 font-normal">24/7 medical intelligence assistant</span>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-auto py-5 flex flex-col gap-2 border-2 hover:bg-emerald-50/50 shadow-sm transition-all transform hover:-translate-y-0.5"
            onClick={() => router.push("/results")}
          >
            <ClipboardList className="w-7 h-7 text-emerald-600" />
            <span className="text-lg font-semibold text-gray-900">View Results 📊</span>
            <span className="text-xs text-gray-500 font-normal">Diagnostic reports & prescriptions</span>
          </Button>
        </div>

        {/* Health Metrics */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 shadow-sm border border-red-100 bg-white/80">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-red-100 text-red-600 rounded-2xl">
                <Heart className="w-6 h-6" />
              </div>
              <Badge variant="secondary" className="bg-red-50 text-red-700 border-red-200">Normal</Badge>
            </div>
            <h3 className="text-sm text-gray-500 font-medium mb-1">Heart Rate</h3>
            <p className="text-3xl font-extrabold text-gray-900">
              {healthMetrics?.heartRate || 72} <span className="text-base font-normal text-gray-500">bpm</span>
            </p>
            <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1 font-medium">
              <TrendingUp className="w-3.5 h-3.5" /> Optimal resting pulse ❤️
            </p>
          </Card>

          <Card className="p-6 shadow-sm border border-blue-100 bg-white/80">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
                <Activity className="w-6 h-6" />
              </div>
              <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">Good</Badge>
            </div>
            <h3 className="text-sm text-gray-500 font-medium mb-1">Blood Pressure</h3>
            <p className="text-3xl font-extrabold text-gray-900">
              {healthMetrics?.bloodPressureSystolic || 120}/{healthMetrics?.bloodPressureDiastolic || 80}
            </p>
            <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1 font-medium">
              <TrendingUp className="w-3.5 h-3.5" /> Target range 💪
            </p>
          </Card>

          <Card className="p-6 shadow-sm border border-emerald-100 bg-white/80">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl">
                <Activity className="w-6 h-6" />
              </div>
              <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200">Active</Badge>
            </div>
            <h3 className="text-sm text-gray-500 font-medium mb-1">Daily Steps</h3>
            <p className="text-3xl font-extrabold text-gray-900">
              {(healthMetrics?.dailySteps || 8547).toLocaleString()}
            </p>
            <Progress value={((healthMetrics?.dailySteps || 8547) / 10000) * 100} className="mt-3 h-2" />
            <p className="text-xs text-gray-500 mt-1.5 font-medium">
              {Math.round(((healthMetrics?.dailySteps || 8547) / 10000) * 100)}% of 10,000 goal 🎯
            </p>
          </Card>

          <Card className="p-6 shadow-sm border border-purple-100 bg-white/80">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 text-purple-600 rounded-2xl">
                <Heart className="w-6 h-6" />
              </div>
              <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200">Healthy</Badge>
            </div>
            <h3 className="text-sm text-gray-500 font-medium mb-1">Sleep Duration</h3>
            <p className="text-3xl font-extrabold text-gray-900">
              {(healthMetrics?.sleepHours || 7.5).toFixed(1)}{" "}
              <span className="text-base font-normal text-gray-500">hrs</span>
            </p>
            <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1 font-medium">
              <TrendingUp className="w-3.5 h-3.5" /> Restorative sleep 😴
            </p>
          </Card>
        </div>

        {/* Appointments and Treatment */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Upcoming Appointments */}
          <Card className="p-6 shadow-sm bg-white/90">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">Appointments 📅</h2>
              </div>
              <Button size="sm" variant="ghost" onClick={() => setAddApptOpen(true)} className="text-blue-600 text-xs">
                + New
              </Button>
            </div>
            <div className="space-y-3">
              {upcomingAppointments.length > 0 ? (
                upcomingAppointments.map((apt) => {
                  const aptDate = new Date(apt.appointmentDate);
                  const isToday = aptDate.toDateString() === new Date().toDateString();
                  const isTomorrow = aptDate.toDateString() === new Date(Date.now() + 86400000).toDateString();

                  return (
                    <div key={apt.id} className="p-4 bg-blue-50/70 rounded-xl border border-blue-100">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-bold text-gray-900">{apt.doctorName}</p>
                          <p className="text-xs text-gray-600">{apt.specialty} • {apt.appointmentType}</p>
                        </div>
                        <Badge className="bg-blue-600 text-xs">
                          {isToday ? "Today" : isTomorrow ? "Tomorrow" : formatDate(apt.appointmentDate)}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600">
                        <span>🕐 {aptDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</span>
                        <span>📍 {apt.location}</span>
                        <span>📞 {apt.phone}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-xl">
                  <Calendar className="w-10 h-10 mx-auto mb-2 opacity-40 text-blue-600" />
                  <p className="text-sm font-medium">No upcoming appointments</p>
                </div>
              )}

              <Button className="w-full mt-2" variant="outline" onClick={() => setAddApptOpen(true)}>
                Schedule New Appointment 📝
              </Button>
            </div>
          </Card>

          {/* Current Treatment */}
          <Card className="p-6 shadow-sm bg-white/90">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Pill className="w-5 h-5 text-emerald-600" />
                <h2 className="text-xl font-bold text-gray-900">Current Medications 💊</h2>
              </div>
              <Button size="sm" variant="ghost" onClick={() => setAddMedOpen(true)} className="text-emerald-600 text-xs">
                + New
              </Button>
            </div>
            <div className="space-y-3">
              {activeMedications.length > 0 ? (
                activeMedications.map((med) => (
                  <div key={med.id} className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-100">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-bold text-gray-900">{med.name}</p>
                        <p className="text-xs text-gray-600">{med.dosage} • {med.frequency}</p>
                      </div>
                      <Badge className="bg-emerald-600 text-xs">Active</Badge>
                    </div>
                    <Progress value={med.progress || 30} className="mt-2 h-1.5" />
                    <p className="text-xs text-gray-500 mt-1">
                      {med.endDate
                        ? `${Math.max(1, Math.ceil((new Date(med.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} days remaining`
                        : "Ongoing treatment"}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-xl">
                  <Pill className="w-10 h-10 mx-auto mb-2 opacity-40 text-emerald-600" />
                  <p className="text-sm font-medium">No active medications logged</p>
                </div>
              )}

              <Button className="w-full mt-2" variant="outline" onClick={() => setAddMedOpen(true)}>
                Add New Medication 💊
              </Button>
            </div>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="p-6 mt-6 shadow-sm bg-white/90">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Health Activity 📋</h2>
          <div className="space-y-3">
            {activities.length > 0 ? (
              activities.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-center gap-4 p-3.5 bg-gray-50/80 rounded-xl border border-gray-100">
                  <div className="text-2xl p-2 bg-white rounded-lg shadow-2xs">{getActivityIcon(activity.activityType)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{activity.title}</p>
                    <p className="text-xs text-gray-600 truncate">{activity.description}</p>
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap">{formatDate(activity.createdAt)}</span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <ClipboardList className="w-12 h-12 mx-auto mb-2 opacity-40" />
                <p>No recent activity records</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* DIALOG: Schedule New Appointment */}
      <Dialog open={addApptOpen} onOpenChange={setAddApptOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Schedule New Appointment
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateAppointment} className="space-y-3.5">
            <div>
              <Label className="text-xs font-semibold">Doctor Name</Label>
              <Input
                placeholder="Dr. Emily Williams"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">Specialty</Label>
                <Input
                  placeholder="Cardiology / General"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">Type</Label>
                <Input
                  placeholder="Consultation / Checkup"
                  value={apptType}
                  onChange={(e) => setApptType(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs font-semibold">Date & Time</Label>
              <Input
                type="datetime-local"
                value={apptDate}
                onChange={(e) => setApptDate(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold">Clinic / Hospital Location</Label>
              <Input
                placeholder="City Hospital, Building B"
                value={apptLocation}
                onChange={(e) => setApptLocation(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold">Contact Phone</Label>
              <Input
                placeholder="(555) 000-0000"
                value={apptPhone}
                onChange={(e) => setApptPhone(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setAddApptOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={apptSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white">
                {apptSubmitting ? "Saving..." : "Confirm Appointment 📅"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIALOG: Add Medication */}
      <Dialog open={addMedOpen} onOpenChange={setAddMedOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pill className="w-5 h-5 text-emerald-600" />
              Add Medication to Routine
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateMedication} className="space-y-3.5">
            <div>
              <Label className="text-xs font-semibold">Medication Name</Label>
              <Input
                placeholder="Amoxicillin, Lisinopril..."
                value={medName}
                onChange={(e) => setMedName(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">Dosage</Label>
                <Input
                  placeholder="500mg / 1 tablet"
                  value={medDosage}
                  onChange={(e) => setMedDosage(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">Frequency</Label>
                <Input
                  placeholder="Twice daily"
                  value={medFrequency}
                  onChange={(e) => setMedFrequency(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">Duration</Label>
                <Input
                  placeholder="14 days / Ongoing"
                  value={medDuration}
                  onChange={(e) => setMedDuration(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">Notes</Label>
                <Input
                  placeholder="Take after breakfast"
                  value={medNotes}
                  onChange={(e) => setMedNotes(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setAddMedOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={medSubmitting} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                {medSubmitting ? "Adding..." : "Add Medication 💊"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* AI Chat Component */}
      <AIChat isOpen={chatOpen} onClose={() => setChatOpen(false)} />

      {/* Floating Chat Button */}
      {!chatOpen && (
        <Button
          size="lg"
          className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-2xl bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => setChatOpen(true)}
          title="Open AI Health Chat"
        >
          <MessageSquare className="w-6 h-6" />
        </Button>
      )}
    </div>
  );
}