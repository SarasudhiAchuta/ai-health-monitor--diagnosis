"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  AlertCircle,
  User,
  Phone,
  MapPin,
  Clock,
  Pill,
  MessageSquare,
  Loader2,
  Video,
  Watch,
  Activity,
  Microscope,
  Wifi,
  Smartphone,
  HeartPulse,
  Thermometer,
  Droplets,
  CheckCircle2,
  AlertTriangle,
  Plus,
} from "lucide-react";
import { AIChat } from "@/components/AIChat";
import { toast } from "sonner";

interface AssessmentResult {
  disease: string;
  probability: number;
  matchingSymptoms: number;
  totalSymptoms: number;
}

interface AssessmentData {
  id: number;
  symptoms: string[];
  additionalInfo: string | null;
  results: AssessmentResult[];
  createdAt: string;
}

interface Doctor {
  name: string;
  specialty: string;
  rating: number;
  experience: string;
  location: string;
  phone: string;
  availability: string;
}

interface Medicine {
  name: string;
  type: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes: string;
}

interface ClinicalSolution {
  condition: string;
  immediateActions: string[];
  treatmentProtocol: string[];
  recoveryTimeline: string;
  redFlags: string[];
}

interface HealthTech {
  name: string;
  category: string;
  description: string;
  features: string[];
  price: string;
  availability: string;
}

interface TelemedicineService {
  name: string;
  type: string;
  description: string;
  availability: string;
  price: string;
  provider: string;
}

interface LabTest {
  name: string;
  description: string;
  preparation: string;
  duration: string;
  price: string;
}

// 1. EXACT MEDICATIONS DATABASE FOR ALL 10 CONDITIONS
const medicineDatabase: Record<string, Medicine[]> = {
  "Common Cold": [
    {
      name: "Acetaminophen (Tylenol)",
      type: "Analgesic & Antipyretic",
      dosage: "500 mg - 650 mg",
      frequency: "Every 4 to 6 hours as needed (Max 3000 mg/24h)",
      duration: "5 to 7 days",
      notes: "Controls fever and headache. Take with a glass of water. Avoid combining with other acetaminophen products.",
    },
    {
      name: "Pseudoephedrine (Sudafed)",
      type: "Oral Decongestant",
      dosage: "60 mg tablet",
      frequency: "Every 4 to 6 hours (Max 240 mg/day)",
      duration: "3 to 5 days only",
      notes: "Relieves sinus pressure and nasal obstruction. Do not take close to bedtime if prone to insomnia.",
    },
    {
      name: "Dextromethorphan (Robitussin)",
      type: "Cough Suppressant",
      dosage: "20 mg - 30 mg (10 mL syrup)",
      frequency: "Every 6 to 8 hours as needed",
      duration: "5 to 7 days",
      notes: "For non-productive dry cough. Drink plenty of warm fluids to loosen airway secretions.",
    },
    {
      name: "Saline Nasal Spray (Ocean/Simply Saline)",
      type: "Mucosal Moisturizer",
      dosage: "2 to 3 sprays per nostril",
      frequency: "3 to 4 times daily",
      duration: "As needed",
      notes: "Natural decongestant without drug-induced rebound congestion (rhinitis medicamentosa).",
    },
  ],
  "Flu (Influenza)": [
    {
      name: "Oseltamivir (Tamiflu)",
      type: "Antiviral Neuraminidase Inhibitor",
      dosage: "75 mg capsule",
      frequency: "Twice daily (morning and evening)",
      duration: "5 consecutive days",
      notes: "Primary antiviral treatment. Must be initiated within 48 hours of symptom onset to maximize effectiveness.",
    },
    {
      name: "Ibuprofen (Advil / Motrin)",
      type: "NSAID Antipyretic & Anti-inflammatory",
      dosage: "400 mg - 600 mg",
      frequency: "Every 6 to 8 hours with meals",
      duration: "3 to 5 days as needed",
      notes: "Targeted relief for high fever, severe muscle aches, and body chills. Always take with food or milk.",
    },
    {
      name: "Guaifenesin Extended-Release (Mucinex)",
      type: "Mucolytic Expectorant",
      dosage: "600 mg tablet",
      frequency: "Every 12 hours with a full glass of water",
      duration: "5 to 7 days",
      notes: "Thins bronchial secretions for productive cough clearance.",
    },
  ],
  "COVID-19": [
    {
      name: "Nirmatrelvir & Ritonavir (Paxlovid)",
      type: "Oral Antiviral Therapy",
      dosage: "300 mg Nirmatrelvir (two 150mg tabs) + 100 mg Ritonavir (one tab)",
      frequency: "Twice daily (12 hours apart)",
      duration: "5 consecutive days",
      notes: "Start within 5 days of symptom onset. Swallows tablets whole; do not crush or chew. Review contraindications with prescriber.",
    },
    {
      name: "Acetaminophen (Paracetamol)",
      type: "Antipyretic",
      dosage: "650 mg",
      frequency: "Every 6 hours as needed (Max 3000 mg/day)",
      duration: "As needed for fever/pain",
      notes: "Controls body temperature and persistent COVID headaches.",
    },
    {
      name: "Zinc Sulfate & Ascorbic Acid (Vitamin C)",
      type: "Immune Support Regimen",
      dosage: "Zinc 50 mg + Vitamin C 1000 mg",
      frequency: "Once daily with lunch",
      duration: "10 to 14 days",
      notes: "Provides essential cellular antioxidant defense during viral recovery.",
    },
  ],
  "Migraine": [
    {
      name: "Sumatriptan (Imitrex)",
      type: "5-HT1 Receptor Agonist (Triptan)",
      dosage: "50 mg - 100 mg tablet",
      frequency: "Take immediately at migraine onset; repeat once after 2 hours if headache recurs (Max 200 mg/24h)",
      duration: "Single acute episode use",
      notes: "Prescription migraine abortive. Contraindicated in uncontrolled hypertension or coronary artery disease.",
    },
    {
      name: "Naproxen Sodium (Aleve)",
      type: "Long-acting NSAID",
      dosage: "500 mg tablet",
      frequency: "Taken at onset concurrently with Sumatriptan",
      duration: "Single acute episode use",
      notes: "Provides synergistic neuro-inflammatory suppression and prevents rebound headache recurrence.",
    },
    {
      name: "Ondansetron (Zofran)",
      type: "Antiemetic 5-HT3 Antagonist",
      dosage: "4 mg Orally Disintegrating Tablet (ODT)",
      frequency: "Every 8 hours as needed",
      duration: "1 to 2 days",
      notes: "Dissolves on tongue without water to relieve acute migraine-induced nausea and vomiting.",
    },
  ],
  "Gastroenteritis": [
    {
      name: "Oral Rehydration Salts (WHO Formula ORS)",
      type: "Electrolyte Replacement Therapy",
      dosage: "1 packet dissolved in 1 Liter clean drinking water",
      frequency: "Sip 200-250 mL after every loose bowel movement",
      duration: "3 to 5 days until diarrhea resolves",
      notes: "Critical primary solution to prevent acute dehydration. Sip slowly; do not gulp.",
    },
    {
      name: "Ondansetron (Zofran)",
      type: "Antiemetic",
      dosage: "4 mg - 8 mg tablet",
      frequency: "Every 8 hours as needed for vomiting",
      duration: "24 to 48 hours",
      notes: "Halts active emesis to allow successful oral fluid and electrolyte absorption.",
    },
    {
      name: "Saccharomyces boulardii (Florastor)",
      type: "Therapeutic Probiotic Yeast",
      dosage: "250 mg - 500 mg (1-2 capsules)",
      frequency: "Twice daily with fluids",
      duration: "14 days",
      notes: "Restores normal intestinal microbiome balance and shortens duration of infectious diarrhea.",
    },
    {
      name: "Loperamide (Imodium)",
      type: "Antidiarrheal",
      dosage: "4 mg initial dose, then 2 mg after each unformed stool (Max 8 mg/day)",
      frequency: "After each loose stool as needed (Max 4 doses/day)",
      duration: "Up to 48 hours only",
      notes: "Use for non-invasive watery diarrhea only. Do NOT use if high fever or bloody stool is present.",
    },
  ],
  "Allergies": [
    {
      name: "Cetirizine (Zyrtec) or Fexofenadine (Allegra)",
      type: "Second-Generation Non-Drowsy Antihistamine",
      dosage: "10 mg (Cetirizine) OR 180 mg (Fexofenadine)",
      frequency: "Once daily in the morning",
      duration: "Ongoing during allergy season",
      notes: "Blocks peripheral H1 receptors for relief of sneezing, rhinorrhea, itchy throat, and hives without causing sedation.",
    },
    {
      name: "Fluticasone Propionate (Flonase)",
      type: "Intranasal Corticosteroid",
      dosage: "50 mcg/spray (2 sprays in each nostril)",
      frequency: "Once daily every morning",
      duration: "Daily maintenance throughout allergen exposure",
      notes: "First-line therapy for nasal congestion and eye itching. Blow nose before spraying; aim outward away from septum.",
    },
    {
      name: "Olopatadine 0.2% (Pataday)",
      type: "Ophthalmic Antihistamine & Mast Cell Stabilizer",
      dosage: "1 drop per affected eye",
      frequency: "Once daily",
      duration: "As needed",
      notes: "Rapid relief of severe ocular allergic conjunctivitis, itching, and redness.",
    },
  ],
  "Hypertension": [
    {
      name: "Lisinopril (Zestril)",
      type: "ACE Inhibitor (First-line Vasodilator)",
      dosage: "10 mg - 20 mg tablet",
      frequency: "Once daily every morning at the same time",
      duration: "Continuous long-term therapy",
      notes: "Reduces peripheral vascular resistance and provides kidney/heart protection. Report dry cough or facial swelling.",
    },
    {
      name: "Amlodipine (Norvasc)",
      type: "Dihydropyridine Calcium Channel Blocker",
      dosage: "5 mg tablet",
      frequency: "Once daily",
      duration: "Continuous long-term therapy",
      notes: "Relaxes arterial smooth muscle. Monitor for mild ankle swelling (peripheral edema).",
    },
    {
      name: "Hydrochlorothiazide (HCTZ)",
      type: "Thiazide Diuretic",
      dosage: "12.5 mg - 25 mg tablet",
      frequency: "Once daily in the morning",
      duration: "Continuous long-term therapy",
      notes: "Removes excess sodium and water. Take in the morning to prevent nighttime urination. Check potassium levels periodically.",
    },
  ],
  "Diabetes": [
    {
      name: "Metformin (Glucophage)",
      type: "Biguanide Insulin Sensitizer",
      dosage: "500 mg - 1000 mg",
      frequency: "Twice daily with breakfast and dinner",
      duration: "Continuous long-term therapy",
      notes: "Suppresses hepatic glucose production and increases insulin sensitivity. Always take with meals to minimize GI side effects.",
    },
    {
      name: "Empagliflozin (Jardiance)",
      type: "SGLT2 Inhibitor",
      dosage: "10 mg tablet",
      frequency: "Once daily in the morning with or without food",
      duration: "Continuous long-term therapy",
      notes: "Lowers blood glucose by excreting excess sugar via urine. Drink plenty of water throughout the day.",
    },
    {
      name: "Insulin Glargine (Lantus / Basaglar)",
      type: "Long-Acting Basal Insulin",
      dosage: "Individualized physician-titrated dose (typically 10-20 units initial)",
      frequency: "Subcutaneous injection once daily at bedtime",
      duration: "Continuous therapy",
      notes: "Maintains steady 24-hour background glycemic control. Rotate subcutaneous injection sites daily (abdomen, thighs).",
    },
  ],
  "Asthma": [
    {
      name: "Albuterol Inhaler (Ventolin / ProAir HFA)",
      type: "Short-Acting Beta2 Agonist (Rescue Inhaler)",
      dosage: "90 mcg/puff (1 to 2 inhalations)",
      frequency: "Every 4 to 6 hours as needed for acute shortness of breath or wheezing",
      duration: "Acute rescue use (keep with you at all times)",
      notes: "Rapid bronchodilation within 5 minutes. Use with a spacer chamber for optimal lung deposition.",
    },
    {
      name: "Fluticasone / Salmeterol (Advair Diskus)",
      type: "Inhaled Corticosteroid + LABA Controller",
      dosage: "100/50 mcg - 250/50 mcg",
      frequency: "1 inhalation twice daily (morning & night, 12 hours apart)",
      duration: "Continuous maintenance daily regimen",
      notes: "Controls airway inflammation. Rinse mouth with water and spit after each inhalation to prevent oral candidiasis.",
    },
    {
      name: "Montelukast (Singulair)",
      type: "Oral Leukotriene Receptor Antagonist",
      dosage: "10 mg tablet",
      frequency: "Once daily in the evening",
      duration: "Continuous maintenance",
      notes: "Reduces bronchoconstriction and inflammatory response to allergic asthma triggers.",
    },
  ],
  "Anxiety Disorder": [
    {
      name: "Sertraline (Zoloft)",
      type: "Selective Serotonin Reuptake Inhibitor (SSRI)",
      dosage: "25 mg daily for 1 week, then titrate to 50 mg - 100 mg",
      frequency: "Once daily every morning with food",
      duration: "Long-term (typically 6 to 12 months minimum)",
      notes: "First-line neurochemical stabilization for chronic generalized anxiety and panic. Therapeutic effect develops over 2-4 weeks.",
    },
    {
      name: "Buspirone (Buspar)",
      type: "Azapirone Anxiolytic (Non-Benzodiazepine)",
      dosage: "5 mg - 7.5 mg tablet",
      frequency: "Twice daily (morning and evening)",
      duration: "Ongoing as prescribed",
      notes: "Targeted generalized anxiety relief without sedation, cognitive blunting, or dependence risk.",
    },
    {
      name: "Hydroxyzine (Vistaril / Atarax)",
      type: "Antihistaminic Anxiolytic",
      dosage: "25 mg - 50 mg",
      frequency: "Every 6 to 8 hours as needed for acute severe agitation or panic",
      duration: "Short-term PRN use",
      notes: "Rapid calming effect within 30-45 minutes. May cause drowsiness; do not drive after taking.",
    },
  ],
};

// 2. EXACT CLINICAL SOLUTIONS DATABASE FOR ALL 10 CONDITIONS
const clinicalSolutionDatabase: Record<string, ClinicalSolution> = {
  "Common Cold": {
    condition: "Common Cold (Viral Upper Respiratory Infection)",
    immediateActions: [
      "Strict physical rest for 48–72 hours to allow your immune system to clear the virus.",
      "Hydrate aggressively: drink 2.5 to 3 Liters of warm fluids daily (herbal teas, warm lemon water, clear broths).",
      "Perform saline nasal lavage 3 times daily to flush out viral particles and open airways.",
      "Steam inhalation with menthol or eucalyptus for 10 minutes twice daily before bed.",
    ],
    treatmentProtocol: [
      "Day 1–3 (Acute Viral Phase): Take Acetaminophen 500mg every 6h for fever/headache; use Saline Nasal Spray frequently.",
      "Day 4–7 (Secretory Phase): Add Dextromethorphan syrup if dry cough disrupts sleep; continue warm fluid hydration.",
      "Keep indoor humidity at 45%–55% using a cool-mist humidifier in the bedroom.",
    ],
    recoveryTimeline: "Expected full resolution within 7 to 10 days.",
    redFlags: [
      "Fever above 102°F (38.9°C) persisting longer than 3 days.",
      "Severe unilateral ear pain or inability to swallow saliva.",
      "Shortness of breath, chest pressure, or coughing up thick rust-colored sputum.",
    ],
  },
  "Flu (Influenza)": {
    condition: "Flu (Influenza Virus Infection)",
    immediateActions: [
      "Begin Oseltamivir (Tamiflu) 75mg twice daily within 48 hours of fever onset.",
      "Complete bed rest: eliminate all strenuous activity to prevent post-viral exhaustion and myocarditis.",
      "Oral electrolyte rehydration: Drink 1 glass of electrolyte solution or ORS every 2 hours.",
      "Isolate from household members for 5 days or until fever-free for 24 hours without antipyretics.",
    ],
    treatmentProtocol: [
      "Alternate Ibuprofen 400mg and Acetaminophen 500mg every 4 hours if high fever and severe muscle aches persist.",
      "Take Mucinex (Guaifenesin 600mg) twice daily with a full glass of water to clear pulmonary mucus.",
      "Monitor body temperature twice daily; record readings in your Health Dashboard.",
    ],
    recoveryTimeline: "Acute fever resolves in 3–5 days; full energy returns in 10–14 days.",
    redFlags: [
      "Sudden shortness of breath, rapid breathing, or oxygen saturation dropping below 95%.",
      "Confusion, severe dizziness, or persistent inability to keep liquids down.",
      "Fever that improves and then returns with worsened cough (bacterial secondary pneumonia).",
    ],
  },
  "COVID-19": {
    condition: "COVID-19 (SARS-CoV-2 Infection)",
    immediateActions: [
      "Consult physician for Nirmatrelvir/Ritonavir (Paxlovid) prescription if within 5 days of onset.",
      "Monitor blood oxygen saturation (SpO2) using a pulse oximeter every 4 hours (normal is 95%–100%).",
      "Prone positioning: Lie flat on your stomach for 30–60 minutes 3 times daily to improve alveolar lung ventilation.",
      "Self-isolate in a well-ventilated room for a minimum of 5 days.",
    ],
    treatmentProtocol: [
      "Take Paracetamol 650mg every 6 hours for headache and fevers; avoid exceeding 3000mg daily.",
      "Daily Zinc Sulfate 50mg and Vitamin C 1000mg to support mucosal immunity.",
      "Maintain active oral rehydration with 2.5 to 3 liters of electrolyte fluids daily.",
    ],
    recoveryTimeline: "Mild infection typically resolves in 10 to 14 days.",
    redFlags: [
      "Pulse oximeter reading dropping to 93% or lower at rest.",
      "Persistent chest pain, pressure, or blue/pale discoloration of lips or nail beds.",
      "Difficulty speaking in complete sentences due to shortness of breath.",
    ],
  },
  "Migraine": {
    condition: "Migraine (Acute Cephalea & Neurovascular Syndrome)",
    immediateActions: [
      "Take Sumatriptan 50mg-100mg with Naproxen 500mg immediately at the very first onset of aura or headache.",
      "Retreat into a pitch-black, silent, cool room with zero screen time or sensory stimulation.",
      "Apply an ice pack to your forehead, temples, or back of the neck for 20 minutes.",
      "Drink 500 mL of cold water with electrolytes immediately upon aura onset.",
    ],
    treatmentProtocol: [
      "Dissolve Ondansetron 4mg ODT on tongue if nausea or vomiting interferes with resting.",
      "If pain is not reduced after 2 hours, take a second Sumatriptan tablet (Max 200mg/24h).",
      "Keep a headache journal logging triggers: stress, dehydration, skipped meals, hormonal shifts, or specific foods.",
    ],
    recoveryTimeline: "Acute episode typically abates within 4 to 24 hours with triptan therapy.",
    redFlags: [
      "Sudden 'thunderclap' headache reaching maximum intensity within seconds.",
      "Headache accompanied by fever, stiff neck, focal weakness, or speech impairment.",
      "New or unfamiliar headache in patients over 50 years of age.",
    ],
  },
  "Gastroenteritis": {
    condition: "Gastroenteritis (Acute Stomach Flu & Intestinal Inflammation)",
    immediateActions: [
      "Bowel rest: withhold heavy, solid foods for the first 4 to 6 hours after acute vomiting.",
      "Start Oral Rehydration Therapy immediately: sip 15 mL (1 tablespoon) of ORS solution every 10 minutes.",
      "Take Ondansetron 4mg to 8mg to stop active vomiting so fluids can be retained.",
      "Avoid all dairy products, high-fat foods, spicy dishes, acidic juices, and caffeine for 7 days.",
    ],
    treatmentProtocol: [
      "Progress to the BRAT diet (Bananas, white Rice, Applesauce, Toast) once vomiting has stopped for 6 hours.",
      "Drink 200 mL of ORS solution after every loose bowel movement to replace potassium and electrolytes.",
      "Take probiotic Florastor (Saccharomyces boulardii) 250mg twice daily for 14 days to rebuild the gut flora.",
    ],
    recoveryTimeline: "Vomiting typically subsides in 24 hours; diarrhea resolves in 48 to 72 hours.",
    redFlags: [
      "Inability to retain liquids for more than 12 consecutive hours.",
      "Blood or black tarry material in vomit or stool.",
      "Signs of severe dehydration: severe dizziness, dry tongue, little or no urination for 8+ hours.",
    ],
  },
  "Allergies": {
    condition: "Allergies (Allergic Rhinitis & Environmental Urticaria)",
    immediateActions: [
      "Take Cetirizine 10mg or Fexofenadine 180mg orally for rapid H1 receptor blockade.",
      "Administer Flonase (Fluticasone) 2 sprays in each nostril daily; aim the spray outward away from the nasal septum.",
      "Rinse eyes with sterile isotonic saline eyewash if ocular itching, redness, or tearing is present.",
      "Remove clothing worn outdoors and wash hair before bed to eliminate trapped allergen pollen.",
    ],
    treatmentProtocol: [
      "Use HEPA air purifiers in sleeping areas and keep bedroom windows closed during peak pollen hours.",
      "Apply Pataday (Olopatadine 0.2%) eye drops once daily for ocular symptoms.",
      "Apply 1% Hydrocortisone cream twice daily for up to 5 days on localized skin hives or itch patches.",
    ],
    recoveryTimeline: "Symptoms improve within 1 to 2 hours of antihistamine dose; control maintained with daily therapy.",
    redFlags: [
      "Swelling of the lips, tongue, throat, or difficulty swallowing (signs of anaphylaxis - call emergency services).",
      "Wheezing, chest tightness, or respiratory distress accompanying the allergic reaction.",
    ],
  },
  "Hypertension": {
    condition: "Hypertension (Elevated Blood Pressure)",
    immediateActions: [
      "Rest quietly in a seated position with feet flat on the floor for 10 minutes, then re-check BP.",
      "Take prescribed antihypertensive medication (e.g. Lisinopril 10mg) exactly as prescribed every morning.",
      "Cut dietary sodium intake immediately to under 1,500 mg per day; eliminate processed and canned foods.",
      "Engage in deep, slow diaphragmatic breathing (6 breaths per minute) to down-regulate sympathetic tone.",
    ],
    treatmentProtocol: [
      "Follow the DASH Diet: high potassium (bananas, sweet potatoes, spinach), magnesium, and whole grains.",
      "Aim for 30 minutes of moderate aerobic activity (brisk walking) 5 days per week.",
      "Log blood pressure twice daily (morning and evening before medications) in your Health Dashboard.",
    ],
    recoveryTimeline: "Blood pressure numbers steadily normalize within 2 to 4 weeks of consistent therapy.",
    redFlags: [
      "Systolic BP above 180 mmHg or diastolic BP above 120 mmHg (Hypertensive Crisis).",
      "Severe chest pain, shortness of breath, blurry vision, or sudden severe headache.",
    ],
  },
  "Diabetes": {
    condition: "Diabetes Mellitus (Type 2 Glycemic Dysregulation)",
    immediateActions: [
      "Measure fasting and post-prandial capillary blood glucose immediately with a glucometer.",
      "Take Metformin 500mg-1000mg with breakfast and dinner; never skip prescribed insulin or oral agents.",
      "Eliminate refined sugars, fruit juices, sodas, white breads, and high-glycemic carbohydrates immediately.",
      "Drink at least 2.5 Liters of water daily to assist kidneys with excess glucose excretion.",
    ],
    treatmentProtocol: [
      "Maintain carbohydrate limits of 30–45g per meal, balanced with lean protein and high dietary fiber.",
      "Walk for 15 minutes immediately following meals to stimulate non-insulin-mediated glucose uptake by skeletal muscle.",
      "Target fasting blood sugar between 80–130 mg/dL and post-meal readings below 180 mg/dL.",
    ],
    recoveryTimeline: "Glycemic stabilization achieved over 1 to 3 months; quarterly HbA1c target <7.0%.",
    redFlags: [
      "Blood glucose reading above 300 mg/dL with ketones in urine, nausea, or abdominal pain.",
      "Hypoglycemia (<70 mg/dL): shakiness, sweating, confusion (take 15g fast-acting sugar immediately).",
      "Non-healing cuts, sores, or numbness/tingling in feet.",
    ],
  },
  "Asthma": {
    condition: "Asthma (Bronchospasm & Airway Hyperreactivity)",
    immediateActions: [
      "Sit upright immediately; do NOT lie down. Loosen any tight clothing around the neck and chest.",
      "Administer Albuterol rescue inhaler: 2 puffs via spacer chamber. Wait 1 minute between puffs.",
      "Measure Peak Expiratory Flow (PEF); if reading is in yellow/red zone, repeat 2 puffs after 20 minutes.",
      "Remove yourself immediately from cold air, dust, smoke, animal dander, or strong chemical odors.",
    ],
    treatmentProtocol: [
      "Continue daily maintenance controller inhaler (e.g. Advair Diskus) twice daily (morning and night).",
      "Rinse mouth thoroughly with water and spit after steroid inhaler to prevent oral thrush.",
      "Take Montelukast 10mg once daily in the evening for ongoing allergen-triggered airway protection.",
    ],
    recoveryTimeline: "Acute bronchospasm resolves within 15–30 minutes of rescue albuterol; baseline control is continuous.",
    redFlags: [
      "Inability to speak in full sentences or lips/fingernails turning pale or blue.",
      "Ribs pulling inward with each breath (retractions) and rescue inhaler failing to relieve tightness.",
      "Peak flow reading remaining below 50% of your personal best.",
    ],
  },
  "Anxiety Disorder": {
    condition: "Anxiety Disorder (Acute Panic Episode & Generalized Distress)",
    immediateActions: [
      "Execute Box Breathing: Inhale for 4 seconds, hold for 4 seconds, exhale for 4 seconds, hold for 4 seconds. Repeat for 5 minutes.",
      "Apply the 5-4-3-2-1 Grounding Method: Name 5 things you see, 4 you feel, 3 you hear, 2 you smell, 1 you taste.",
      "Take prescribed Hydroxyzine 25mg-50mg or Propranolol 10mg-20mg if experiencing acute panic/palpitations.",
      "Eliminate caffeine, energy drinks, and nicotine stimulants completely.",
    ],
    treatmentProtocol: [
      "Take Sertraline 50mg or Buspirone 7.5mg every morning as prescribed for ongoing neurotransmitter balance.",
      "Perform 20 minutes of daily aerobic cardiovascular exercise to release natural endorphins.",
      "Maintain consistent sleep schedule with 7 to 8 hours of uninterrupted rest.",
    ],
    recoveryTimeline: "Acute panic dissipates within 20–30 minutes; long-term SSRI stabilization develops over 3–6 weeks.",
    redFlags: [
      "Chest pain radiating to the left arm or jaw (requires emergency evaluation to rule out cardiac events).",
      "Feelings of severe self-harm, detachment from reality, or incapacitating distress.",
    ],
  },
};

export default function ResultsPage() {
  const router = useRouter();
  const [data, setData] = useState<AssessmentData | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        const assessmentId = localStorage.getItem("currentAssessmentId");
        const token = localStorage.getItem("bearer_token");

        if (!token) {
          setLoading(false);
          return;
        }

        const endpoint = assessmentId
          ? `/api/assessments?id=${assessmentId}`
          : `/api/assessments?limit=1`;

        const response = await fetch(endpoint, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const resData = await response.json();
          const assessment = Array.isArray(resData) ? resData[0] : resData;
          if (assessment) {
            setData({
              ...assessment,
              symptoms: typeof assessment.symptoms === "string" ? JSON.parse(assessment.symptoms) : assessment.symptoms,
              results: typeof assessment.results === "string" ? JSON.parse(assessment.results) : assessment.results,
            });
          }
        }
      } catch (error) {
        console.error("Error fetching assessment:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssessment();
  }, []);

  const handleAddMedicationToRoutine = async (med: Medicine) => {
    const token = localStorage.getItem("bearer_token");
    if (!token) {
      toast.error("Please log in to save medications to your routine");
      return;
    }

    try {
      toast.loading(`Adding ${med.name} to routine...`);
      const res = await fetch("/api/medications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: med.name,
          dosage: med.dosage,
          frequency: med.frequency,
          duration: med.duration,
          notes: med.notes,
          startDate: new Date().toISOString(),
        }),
      });

      toast.dismiss();
      if (res.ok) {
        toast.success(`✅ ${med.name} added to your active medications dashboard!`);
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to add medication");
      }
    } catch (err) {
      toast.dismiss();
      toast.error("Failed to add medication to routine");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="text-center p-8 bg-white/80 rounded-2xl shadow-xl backdrop-blur-md">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-lg font-bold text-gray-900">Retrieving Clinical Treatment Protocols...</p>
        </div>
      </div>
    );
  }

  if (!data || !data.results || data.results.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
        <Card className="p-8 text-center max-w-md w-full shadow-2xl rounded-2xl bg-white">
          <div className="text-6xl mb-4">🩺</div>
          <h2 className="text-2xl font-bold mb-2 text-gray-900">No Assessment Records Found</h2>
          <p className="text-gray-600 mb-6 text-sm">Please complete the symptom evaluation to view your exact solutions and prescription plan.</p>
          <Button onClick={() => router.push("/assessment")} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold">
            Start Symptom Evaluation 🩺
          </Button>
        </Card>
      </div>
    );
  }

  const topResult = data.results[0];
  const primaryDisease = topResult.disease;

  const clinicalSolution = clinicalSolutionDatabase[primaryDisease] || clinicalSolutionDatabase["Common Cold"];
  const exactMedications = medicineDatabase[primaryDisease] || medicineDatabase["Common Cold"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="border-b bg-white/85 backdrop-blur-md sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-3.5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 text-white rounded-xl text-xl shadow-md">🏥</div>
            <span className="text-lg font-extrabold text-gray-900">HealthAI Clinical Treatment Portal</span>
          </div>
          <div className="flex gap-2.5">
            <Button variant="outline" size="sm" onClick={() => router.push("/assessment")}>
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              New Evaluation
            </Button>
            <Button size="sm" onClick={() => router.push("/dashboard")} className="bg-blue-600 hover:bg-blue-700 text-white font-medium">
              Dashboard 📊
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Main Title */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-blue-100 rounded-2xl mb-3 text-3xl">🩺💊</div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">
            Clinical Treatment & Exact Medication Regimen
          </h1>
          <p className="text-base text-gray-600">
            Immediate Clinical Solution, Exact Dosage Schedules, and Recovery Protocols
          </p>
        </div>

        {/* SECTION 1: PRIMARY CONDITION IDENTIFICATION */}
        <Card className="p-6 mb-6 shadow-md border-2 border-blue-200/80 bg-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide bg-blue-100 text-blue-800">
                  Primary Condition
                </span>
                <span className="text-xs text-gray-500 font-mono">
                  {topResult.matchingSymptoms} of {topResult.totalSymptoms} Symptoms Present
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">
                {primaryDisease}
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs text-gray-500 uppercase font-semibold">Match Confidence</div>
                <div className="text-2xl font-black text-blue-600">{topResult.probability}%</div>
              </div>
              <div className="w-20">
                <Progress value={topResult.probability} className="h-3" />
              </div>
            </div>
          </div>

          <div className="mt-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Patient Reported Symptoms:</h3>
            <div className="flex flex-wrap gap-2">
              {data.symptoms.map((symptom) => (
                <Badge key={symptom} variant="secondary" className="bg-slate-100 text-slate-800 font-medium py-1 px-3 text-xs">
                  ✓ {symptom}
                </Badge>
              ))}
            </div>
          </div>

          {data.additionalInfo && (
            <div className="mt-4 p-3 bg-slate-50 rounded-xl text-xs text-slate-600">
              <strong className="text-slate-800">Clinical Notes:</strong> {data.additionalInfo}
            </div>
          )}
        </Card>

        {/* SECTION 2: EXACT MEDICATIONS TO USE (FRONT AND CENTER) */}
        <Card className="p-6 mb-6 shadow-md border-2 border-emerald-200/90 bg-white">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl">
                <Pill className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-gray-900">Exact Medications to Use</h2>
                <p className="text-xs text-gray-500">Official prescription regimen, exact strengths, dosages, and course durations</p>
              </div>
            </div>
            <Badge className="bg-emerald-600 text-white font-semibold text-xs px-3 py-1">
              {exactMedications.length} Prescribed Medications
            </Badge>
          </div>

          <div className="space-y-4">
            {exactMedications.map((med, idx) => (
              <div key={idx} className="p-5 rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50/40 via-white to-white shadow-2xs">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold">
                      {idx + 1}
                    </span>
                    <div>
                      <h3 className="text-lg font-extrabold text-gray-900">{med.name}</h3>
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                        {med.type}
                      </span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-emerald-300 text-emerald-800 hover:bg-emerald-100/60 text-xs font-semibold h-8 flex items-center gap-1.5"
                    onClick={() => handleAddMedicationToRoutine(med)}
                  >
                    <Plus className="w-3.5 h-3.5 text-emerald-600" />
                    Add to Routine 💊
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-white rounded-xl border border-emerald-100 text-xs">
                  <div>
                    <span className="text-gray-500 font-semibold block uppercase tracking-wider text-[10px]">Exact Dosage</span>
                    <span className="font-bold text-gray-900 text-sm">{med.dosage}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 font-semibold block uppercase tracking-wider text-[10px]">Frequency</span>
                    <span className="font-bold text-gray-900 text-sm">{med.frequency}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 font-semibold block uppercase tracking-wider text-[10px]">Course Duration</span>
                    <span className="font-bold text-gray-900 text-sm">{med.duration}</span>
                  </div>
                </div>

                <div className="mt-3 p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Clinical Instructions:</strong> {med.notes}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* SECTION 3: EXACT CLINICAL SOLUTION & PROTOCOL */}
        <Card className="p-6 mb-6 shadow-md border-2 border-indigo-200/80 bg-white">
          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
            <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-xl">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900">Exact Clinical Solution & Action Plan</h2>
              <p className="text-xs text-gray-500">Step-by-step treatment protocol for {clinicalSolution.condition}</p>
            </div>
          </div>

          {/* Immediate Steps */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2 mb-3 text-indigo-950">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
              Immediate Clinical Interventions:
            </h3>
            <div className="space-y-2.5">
              {clinicalSolution.immediateActions.map((action, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 text-xs text-gray-800">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-600 text-white font-bold flex-shrink-0 text-[11px]">
                    {i + 1}
                  </span>
                  <span className="font-medium leading-relaxed">{action}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Treatment Protocol */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2 mb-3 text-indigo-950">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              Standard Treatment & Recovery Protocol:
            </h3>
            <div className="space-y-2.5">
              {clinicalSolution.treatmentProtocol.map((step, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-xs text-gray-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline & Red Flags */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-emerald-50/70 border border-emerald-200/70 rounded-xl">
              <h4 className="text-xs font-bold text-emerald-900 uppercase mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-600" /> Expected Recovery Timeline
              </h4>
              <p className="text-xs text-emerald-800 font-semibold">{clinicalSolution.recoveryTimeline}</p>
            </div>

            <div className="p-4 bg-red-50/70 border border-red-200/70 rounded-xl">
              <h4 className="text-xs font-bold text-red-900 uppercase mb-1 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-red-600" /> Red-Flag Warning Signs
              </h4>
              <ul className="text-xs text-red-800 space-y-1 list-disc list-inside">
                {clinicalSolution.redFlags.map((flag, idx) => (
                  <li key={idx} className="leading-tight">{flag}</li>
                ))}
              </ul>
            </div>
          </div>
        </Card>

        {/* SECTION 4: OTHER POSSIBLE CONDITIONS */}
        {data.results.length > 1 && (
          <Card className="p-6 mb-6 shadow-sm border border-gray-200 bg-white">
            <h2 className="text-xl font-bold text-gray-900 mb-3">Differential Diagnoses Considered 🔬</h2>
            <div className="space-y-3">
              {data.results.slice(1, 4).map((result) => (
                <div key={result.disease} className="p-3.5 bg-gray-50 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-gray-900 text-sm">{result.disease}</span>
                    <span className="text-gray-500 ml-2">({result.matchingSymptoms} of {result.totalSymptoms} symptoms)</span>
                  </div>
                  <Badge variant="outline" className="font-semibold">{result.probability}% Match</Badge>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Navigation Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            size="lg"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold h-12 rounded-xl shadow-md"
            onClick={() => router.push("/dashboard")}
          >
            Go to Health Dashboard 📊
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="flex-1 border-2 h-12 rounded-xl font-semibold"
            onClick={() => setChatOpen(true)}
          >
            <MessageSquare className="w-4 h-4 mr-2 text-blue-600" />
            Consult Medical AI Assistant 💬
          </Button>
        </div>
      </div>

      {/* AI Chat Drawer Component */}
      <AIChat isOpen={chatOpen} onClose={() => setChatOpen(false)} />

      {!chatOpen && (
        <Button
          size="lg"
          className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-2xl bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => setChatOpen(true)}
          title="Open AI Medical Assistant"
        >
          <MessageSquare className="w-6 h-6" />
        </Button>
      )}
    </div>
  );
}