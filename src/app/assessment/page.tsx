"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";

interface Disease {
  name: string;
  symptoms: string[];
}

const diseases: Disease[] = [
  {
    name: "Common Cold",
    symptoms: ["runny nose", "cough", "sore throat", "sneezing", "mild fever", "congestion"],
  },
  {
    name: "Flu (Influenza)",
    symptoms: ["high fever", "body aches", "fatigue", "cough", "headache", "chills"],
  },
  {
    name: "COVID-19",
    symptoms: ["fever", "dry cough", "fatigue", "loss of taste", "loss of smell", "difficulty breathing"],
  },
  {
    name: "Migraine",
    symptoms: ["severe headache", "nausea", "sensitivity to light", "sensitivity to sound", "visual disturbances"],
  },
  {
    name: "Gastroenteritis",
    symptoms: ["diarrhea", "vomiting", "nausea", "stomach cramps", "fever", "dehydration"],
  },
  {
    name: "Allergies",
    symptoms: ["sneezing", "itchy eyes", "runny nose", "skin rash", "congestion", "watery eyes"],
  },
  {
    name: "Hypertension",
    symptoms: ["headache", "dizziness", "shortness of breath", "chest pain", "blurred vision"],
  },
  {
    name: "Diabetes",
    symptoms: ["increased thirst", "frequent urination", "fatigue", "blurred vision", "slow healing wounds"],
  },
  {
    name: "Asthma",
    symptoms: ["wheezing", "shortness of breath", "chest tightness", "coughing", "difficulty breathing"],
  },
  {
    name: "Anxiety Disorder",
    symptoms: ["excessive worry", "restlessness", "rapid heartbeat", "sweating", "difficulty concentrating"],
  },
];

const symptomsList = [
  "Fever", "Cough", "Headache", "Fatigue", "Sore Throat",
  "Body Aches", "Runny Nose", "Nausea", "Diarrhea", "Vomiting",
  "Chest Pain", "Shortness of Breath", "Dizziness", "Abdominal Pain",
  "Skin Rash", "Loss of Appetite", "Chills", "Sweating", "Congestion",
  "Sneezing", "Blurred Vision", "Difficulty Breathing", "Rapid Heartbeat",
  "Joint Pain", "Back Pain", "Muscle Weakness", "Sensitivity to Light",
];

export default function AssessmentPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSymptomToggle = (symptom: string) => {
    if (selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(selectedSymptoms.filter((s) => s !== symptom));
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
  };

  const analyzeSymptoms = () => {
    if (selectedSymptoms.length === 0) return [];

    const results = diseases.map((disease) => {
      const matchingSymptoms = disease.symptoms.filter((symptom) =>
        selectedSymptoms.some((selected) =>
          symptom.toLowerCase().includes(selected.toLowerCase()) ||
          selected.toLowerCase().includes(symptom.toLowerCase())
        )
      );

      const probability = (matchingSymptoms.length / disease.symptoms.length) * 100;
      return {
        disease: disease.name,
        probability: Math.round(probability),
        matchingSymptoms: matchingSymptoms.length,
        totalSymptoms: disease.symptoms.length,
      };
    });

    return results.filter((r) => r.probability > 0).sort((a, b) => b.probability - a.probability);
  };

  const handleSubmit = async () => {
    if (selectedSymptoms.length === 0) {
      toast.error("Please select at least one symptom 🔍");
      return;
    }

    // Check if user is authenticated
    if (!session?.user) {
      toast.error("Please log in to save your assessment");
      router.push(`/login?redirect=${encodeURIComponent("/assessment")}`);
      return;
    }

    setLoading(true);
    
    try {
      const results = analyzeSymptoms();
      const token = localStorage.getItem("bearer_token");
      
      // Save assessment to database
      const response = await fetch("/api/assessments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          symptoms: selectedSymptoms,
          additionalInfo: additionalInfo || "",
          results,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("API Error:", data);
        throw new Error(data.error || "Failed to save assessment");
      }

      // Log health activity
      await fetch("/api/health-activities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          activityType: "symptom_check",
          title: "Symptom Assessment Completed",
          description: `Assessed ${selectedSymptoms.length} symptoms. Top result: ${results[0]?.disease || "No diagnosis"}`,
        }),
      });

      // Store assessment ID for results page
      localStorage.setItem("currentAssessmentId", data.id.toString());
      
      toast.success("Assessment completed! 🎉");
      router.push("/results");
    } catch (error) {
      console.error("Error saving assessment:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save assessment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="text-3xl">🏥</div>
            <span className="text-xl font-bold text-blue-600">HealthAI Monitor</span>
          </div>
          <Button variant="outline" onClick={() => router.push("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🩺🔍</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Symptom Checker</h1>
          <p className="text-lg text-gray-600">Select your symptoms for AI-powered health analysis</p>
          {!session?.user && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                💡 <strong>Tip:</strong> Log in to save your assessment history
              </p>
            </div>
          )}
        </div>

        <Card className="p-8 mb-6">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Search className="w-5 h-5 text-blue-600" />
              <h2 className="text-2xl font-semibold">Select Your Symptoms</h2>
            </div>
            <p className="text-gray-600 mb-4">Choose all symptoms you are experiencing 📋</p>

            {selectedSymptoms.length > 0 && (
              <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-900 mb-2">
                  Selected Symptoms ({selectedSymptoms.length}):
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedSymptoms.map((symptom) => (
                    <Badge key={symptom} variant="default" className="text-sm">
                      {symptom} ✓
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-3 gap-4">
              {symptomsList.map((symptom) => (
                <div key={symptom} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <Checkbox
                    id={symptom}
                    checked={selectedSymptoms.includes(symptom)}
                    onCheckedChange={() => handleSymptomToggle(symptom)}
                  />
                  <Label htmlFor={symptom} className="cursor-pointer flex-1">
                    {symptom}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <Label htmlFor="additional" className="text-lg font-semibold mb-2 block">
              Additional Information (Optional) 📝
            </Label>
            <Textarea
              id="additional"
              placeholder="Describe when symptoms started, their severity, or any other relevant details..."
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              className="min-h-32"
            />
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800">
              ⚠️ <strong>Disclaimer:</strong> This tool provides general information only and is not a substitute for professional medical advice. Always consult with a healthcare provider for accurate diagnosis and treatment.
            </p>
          </div>

          <Button
            size="lg"
            className="w-full text-lg"
            onClick={handleSubmit}
            disabled={loading || selectedSymptoms.length === 0}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Analyzing Symptoms... 🧠
              </>
            ) : (
              <>
                Get AI Analysis 🔬
              </>
            )}
          </Button>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-blue-50 to-green-50">
          <h3 className="text-lg font-semibold mb-3">What Happens Next? 🤔</h3>
          <div className="space-y-2 text-sm text-gray-700">
            <p>✅ Our AI analyzes your symptoms against our medical database</p>
            <p>✅ You will receive probability scores for potential conditions</p>
            <p>✅ Get recommendations for specialist doctors in your area</p>
            <p>✅ Receive suggested treatments and medications</p>
            <p>✅ Access to 24/7 AI health chatbot for follow-up questions</p>
          </div>
        </Card>
      </div>
    </div>
  );
}