"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, X, Loader2, Stethoscope } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Message {
  id: string | number;
  role: "user" | "assistant";
  content: string;
}

interface AIChatProps {
  isOpen: boolean;
  onClose: () => void;
}

const conditionClinicalData: Record<string, { solution: string; medications: string[] }> = {
  cold: {
    solution: "1. Strict rest for 48–72 hours.\n2. Hydrate with 2.5–3 Liters of warm fluids daily.\n3. Saline nasal irrigation 3 times daily.\n4. Steam inhalation with menthol for 10 minutes twice daily.",
    medications: [
      "Acetaminophen (Tylenol) 500mg - 650mg every 4 to 6 hours as needed (Max 3000mg/day) for fever and pain.",
      "Pseudoephedrine (Sudafed) 60mg every 4 to 6 hours for 3-5 days for nasal sinus congestion.",
      "Dextromethorphan (Robitussin) 20mg every 6 to 8 hours for dry cough relief.",
      "Saline Nasal Spray 2-3 sprays per nostril 3 to 4 times daily.",
    ],
  },
  flu: {
    solution: "1. Complete bed rest for 5–7 days.\n2. Oral electrolyte rehydration (1 glass every 2 hours).\n3. Monitor temperature twice daily; isolate from others until fever-free for 24h.",
    medications: [
      "Oseltamivir (Tamiflu) 75mg orally twice daily for 5 consecutive days (initiate within 48h of onset).",
      "Ibuprofen 400mg - 600mg every 6 to 8 hours with meals for high fever, body aches, and chills.",
      "Guaifenesin Extended-Release (Mucinex) 600mg every 12 hours with a full glass of water for chest mucus.",
    ],
  },
  covid: {
    solution: "1. Isolate for at least 5 days from onset.\n2. Monitor oxygen saturation (SpO2) every 4 hours (target >95%).\n3. Prone positioning (lie on stomach 30-60 min 3x daily) to improve lung ventilation.",
    medications: [
      "Nirmatrelvir/Ritonavir (Paxlovid) 300mg/100mg twice daily for 5 days (start within 5 days of onset).",
      "Acetaminophen (Paracetamol) 650mg every 6 hours as needed for fever and persistent headache.",
      "Zinc Sulfate 50mg + Vitamin C 1000mg once daily with lunch for 10 days for cellular recovery.",
    ],
  },
  migraine: {
    solution: "1. Retreat immediately into a dark, quiet, cool room at first aura/headache sign.\n2. Apply ice pack to forehead or temples for 20 minutes.\n3. Drink 500 mL cold water with electrolytes.",
    medications: [
      "Sumatriptan (Imitrex) 50mg - 100mg orally at onset; repeat once after 2 hours if headache recurs (Max 200mg/24h).",
      "Naproxen Sodium (Aleve) 500mg taken concurrently with Sumatriptan at onset for synergistic relief.",
      "Ondansetron (Zofran) 4mg Orally Disintegrating Tablet (ODT) every 8 hours as needed for nausea.",
    ],
  },
  gastro: {
    solution: "1. Bowel rest: withhold solid foods for 4 to 6 hours after acute vomiting.\n2. Oral Rehydration Therapy: sip 15 mL (1 tbsp) of WHO ORS solution every 10 minutes.\n3. Follow the BRAT diet (Bananas, Rice, Applesauce, Toast) once vomiting stops.\n4. Avoid dairy, high-fat, and spicy foods for 7 days.",
    medications: [
      "WHO Oral Rehydration Salts (ORS): 1 packet in 1L water; sip 200mL after each loose stool.",
      "Ondansetron (Zofran) 4mg - 8mg every 8 hours as needed to stop active vomiting.",
      "Saccharomyces boulardii (Florastor probiotic) 250mg - 500mg twice daily for 14 days.",
      "Loperamide (Imodium) 4mg initial, then 2mg after each unformed stool (Max 8mg/day; avoid if fever/bloody stool).",
    ],
  },
  allergy: {
    solution: "1. Keep windows closed during high pollen counts; run bedroom HEPA air purifier.\n2. Rinse eyes with sterile isotonic saline eyewash after outdoor exposure.\n3. Wash hair and change clothes immediately upon entering home.",
    medications: [
      "Cetirizine (Zyrtec) 10mg OR Fexofenadine (Allegra) 180mg orally once daily every morning.",
      "Fluticasone Propionate (Flonase) 2 sprays in each nostril once daily in the morning.",
      "Olopatadine 0.2% (Pataday) 1 drop per affected eye once daily for ocular itching.",
    ],
  },
  hypertension: {
    solution: "1. Sodium restriction to <1,500 mg/day (eliminate processed, canned foods).\n2. Follow DASH diet rich in potassium (bananas, spinach, sweet potatoes).\n3. 30 minutes of moderate aerobic exercise (brisk walking) 5 days per week.\n4. Log resting blood pressure twice daily (morning and evening).",
    medications: [
      "Lisinopril 10mg - 20mg orally once daily in the morning.",
      "Amlodipine (Norvasc) 5mg orally once daily.",
      "Hydrochlorothiazide (HCTZ) 12.5mg - 25mg orally once daily in the morning.",
    ],
  },
  diabetes: {
    solution: "1. Low-glycemic nutrition: limit carbohydrates to 30-45g per meal; eliminate sugary drinks.\n2. Walk for 15 minutes immediately following meals to stimulate muscle glucose uptake.\n3. Daily target blood sugars: Fasting 80–130 mg/dL, Post-prandial <180 mg/dL.",
    medications: [
      "Metformin (Glucophage) 500mg - 1000mg orally twice daily with breakfast and dinner.",
      "Empagliflozin (Jardiance) 10mg orally once daily in the morning.",
      "Insulin Glargine (Lantus) individual physician-titrated units subcutaneously once daily at bedtime.",
    ],
  },
  asthma: {
    solution: "1. Sit upright immediately; do NOT lie down. Loosen clothing.\n2. Eliminate exposure to smoke, cold air, dust, and animal dander.\n3. Monitor Peak Expiratory Flow (PEF) daily.",
    medications: [
      "Albuterol (Ventolin / ProAir) 90mcg 1 to 2 puffs inhaled via spacer every 4 to 6 hours as needed for wheezing.",
      "Fluticasone/Salmeterol (Advair Diskus) 1 inhalation twice daily (morning and night) as daily controller.",
      "Montelukast (Singulair) 10mg orally once daily in the evening.",
    ],
  },
  anxiety: {
    solution: "1. Box Breathing: Inhale 4s, hold 4s, exhale 4s, hold 4s for 5–10 minutes.\n2. 5-4-3-2-1 Sensory Grounding: 5 things you see, 4 feel, 3 hear, 2 smell, 1 taste.\n3. Complete elimination of caffeine, energy drinks, and stimulants.",
    medications: [
      "Sertraline (Zoloft) 25mg daily for 1 week, then 50mg - 100mg daily in the morning for long-term stabilization.",
      "Buspirone (Buspar) 5mg - 7.5mg orally twice daily for chronic generalized anxiety.",
      "Hydroxyzine (Vistaril) 25mg - 50mg every 6 to 8 hours as needed for acute severe panic.",
    ],
  },
};

function getConditionKey(text: string): string | null {
  const lower = text.toLowerCase();
  if (lower.includes("cold") || lower.includes("sneeze") || lower.includes("runny nose")) return "cold";
  if (lower.includes("flu") || lower.includes("influenza") || lower.includes("chills")) return "flu";
  if (lower.includes("covid") || lower.includes("corona") || lower.includes("loss of smell") || lower.includes("loss of taste")) return "covid";
  if (lower.includes("migraine") || lower.includes("headache") || lower.includes("head ache") || lower.includes("aura")) return "migraine";
  if (lower.includes("stomach") || lower.includes("vomit") || lower.includes("diarrhea") || lower.includes("gastro") || lower.includes("food poison")) return "gastro";
  if (lower.includes("allerg") || lower.includes("hives") || lower.includes("itchy eyes") || lower.includes("rash")) return "allergy";
  if (lower.includes("pressure") || lower.includes("hypertens") || lower.includes("bp")) return "hypertension";
  if (lower.includes("diabet") || lower.includes("sugar") || lower.includes("glucose")) return "diabetes";
  if (lower.includes("asthma") || lower.includes("wheez") || lower.includes("shortness of breath") || lower.includes("breath")) return "asthma";
  if (lower.includes("anxiet") || lower.includes("panic") || lower.includes("nervous") || lower.includes("worry")) return "anxiety";
  return null;
}

function generateExactMedicalResponse(query: string): string {
  const key = getConditionKey(query);

  if (key && conditionClinicalData[key]) {
    const data = conditionClinicalData[key];
    const conditionTitle = key.toUpperCase();
    return `CLINICAL TREATMENT PLAN & EXACT MEDICATIONS TO USE:

📋 EXACT SOLUTION & ACTION PLAN:
${data.solution}

💊 EXACT MEDICATIONS TO USE:
${data.medications.map((m, i) => `${i + 1}. ${m}`).join("\n")}

⚠️ Precautions: Take exactly at the prescribed dosage and times. For full interactive analysis and doctor consultations, click below.`;
  }

  return `CLINICAL TREATMENT PROTOCOLS & MEDICATIONS AVAILABLE:

Please specify which condition you are treating to receive the exact clinical solution and medication regimen:
• Common Cold
• Flu (Influenza)
• COVID-19
• Migraine & Severe Headaches
• Gastroenteritis (Stomach Flu / Diarrhea)
• Allergies & Allergic Rhinitis
• Hypertension (High Blood Pressure)
• Diabetes (Blood Sugar Management)
• Asthma & Bronchospasm
• Anxiety Disorder & Acute Panic

Tell me your condition or symptoms above, or launch the Clinical Evaluation tool below! 🩺`;
}

const WELCOME_MESSAGE = `Hello! 👋 I'm your Clinical Health Assistant. Tell me your condition (e.g. Cold, Flu, COVID, Migraine, Stomach Flu, Allergies, Hypertension, Diabetes, Asthma, Anxiety) to receive the exact clinical solution and medications to use! 🩺`;

export function AIChat({ isOpen, onClose }: AIChatProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      loadChatHistory();
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const loadChatHistory = async () => {
    const token = localStorage.getItem("bearer_token");
    if (!token) {
      setMessages([{ id: "welcome", role: "assistant", content: WELCOME_MESSAGE }]);
      return;
    }

    setLoadingHistory(true);
    try {
      const response = await fetch("/api/chat-messages?limit=50", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const chatHistory = await response.json();
        if (chatHistory.length > 0) {
          setMessages(chatHistory);
        } else {
          setMessages([{ id: "welcome", role: "assistant", content: WELCOME_MESSAGE }]);
        }
      }
    } catch (error) {
      console.error("Error loading chat history:", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const saveChatMessage = async (role: "user" | "assistant", content: string) => {
    const token = localStorage.getItem("bearer_token");
    if (!token) return null;

    try {
      const response = await fetch("/api/chat-messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ role, content }),
      });
      if (response.ok) return await response.json();
    } catch (error) {
      console.error("Error saving chat message:", error);
    }
    return null;
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessageContent = input;
    const tempUserId = `temp-${Date.now()}`;

    const userMessage: Message = {
      id: tempUserId,
      role: "user",
      content: userMessageContent,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    const savedUserMessage = await saveChatMessage("user", userMessageContent);
    if (savedUserMessage) {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === tempUserId ? { ...msg, id: savedUserMessage.id } : msg))
      );
    }

    setTimeout(async () => {
      const aiResponse = generateExactMedicalResponse(userMessageContent);
      const tempAiId = `temp-ai-${Date.now()}`;

      const assistantMessage: Message = {
        id: tempAiId,
        role: "assistant",
        content: aiResponse,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      const savedAiMessage = await saveChatMessage("assistant", aiResponse);
      if (savedAiMessage) {
        setMessages((prev) =>
          prev.map((msg) => (msg.id === tempAiId ? { ...msg, id: savedAiMessage.id } : msg))
        );
      }

      setLoading(false);
    }, 500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-w-[calc(100vw-2rem)]">
      <Card className="shadow-2xl border-0 overflow-hidden rounded-2xl">
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 text-white p-4 flex justify-between items-center shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-white/20 rounded-xl">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight">Clinical Solution Assistant</h3>
              <p className="text-xs text-blue-100">Exact Medications & Solutions</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20 rounded-full h-8 w-8">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <ScrollArea className="h-96 p-4 bg-slate-50/50" ref={scrollRef}>
          {loadingHistory ? (
            <div className="flex items-center justify-center h-full py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-2.5 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.role === "assistant" && (
                    <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 text-white shadow-xs">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                      message.role === "user"
                        ? "bg-blue-600 text-white rounded-br-none"
                        : "bg-white text-gray-800 border border-gray-100 rounded-bl-none"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>

                    {message.role === "assistant" && (
                      <Button
                        size="sm"
                        className="mt-3 w-full text-xs font-semibold bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white h-8 shadow-xs flex items-center justify-center gap-1.5 rounded-xl"
                        onClick={() => {
                          onClose();
                          router.push("/assessment");
                        }}
                      >
                        <Stethoscope className="w-3.5 h-3.5" />
                        Full Clinical Evaluation 🩺
                      </Button>
                    )}
                  </div>
                  {message.role === "user" && (
                    <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0 text-white shadow-xs">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex gap-2.5 items-center">
                  <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-white p-3 rounded-2xl border border-gray-100">
                    <div className="flex gap-1.5 items-center">
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-100" />
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        <div className="p-3 bg-white border-t border-gray-100">
          <div className="flex gap-2">
            <Input
              placeholder="Name condition or symptoms (e.g. Migraine, Flu)... 🩺"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              disabled={loading}
              className="text-xs h-10 rounded-xl"
            />
            <Button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="h-10 px-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}