import { db } from '@/db';
import { assessments } from '@/db/schema';

async function main() {
    const demoUserId = 'user_demo_health_assessment';
    
    const sampleAssessments = [
        {
            userId: demoUserId,
            symptoms: JSON.stringify(["Headache", "Runny nose", "Cough", "Fatigue"]),
            additionalInfo: "Symptoms started 3 days ago after attending a conference",
            results: JSON.stringify([
                { disease: "Common Cold", probability: 85 },
                { disease: "Flu", probability: 45 },
                { disease: "COVID-19", probability: 30 }
            ]),
            createdAt: new Date('2024-12-05T09:30:00Z'),
        },
        {
            userId: demoUserId,
            symptoms: JSON.stringify(["Fever", "Body aches", "Chills", "Fatigue", "Headache"]),
            additionalInfo: "Worse in the morning, temperature reached 102°F",
            results: JSON.stringify([
                { disease: "Flu", probability: 78 },
                { disease: "COVID-19", probability: 65 },
                { disease: "Common Cold", probability: 25 }
            ]),
            createdAt: new Date('2024-12-08T14:15:00Z'),
        },
        {
            userId: demoUserId,
            symptoms: JSON.stringify(["Sneezing", "Itchy eyes", "Runny nose"]),
            additionalInfo: null,
            results: JSON.stringify([
                { disease: "Allergic Rhinitis", probability: 90 },
                { disease: "Common Cold", probability: 35 }
            ]),
            createdAt: new Date('2024-12-11T08:45:00Z'),
        },
        {
            userId: demoUserId,
            symptoms: JSON.stringify(["Nausea", "Stomach pain", "Diarrhea"]),
            additionalInfo: "Recently traveled to Mexico, symptoms began yesterday evening",
            results: JSON.stringify([
                { disease: "Gastroenteritis", probability: 80 },
                { disease: "Food Poisoning", probability: 60 }
            ]),
            createdAt: new Date('2024-12-13T16:20:00Z'),
        },
        {
            userId: demoUserId,
            symptoms: JSON.stringify(["Shortness of breath", "Chest tightness", "Wheezing", "Cough"]),
            additionalInfo: null,
            results: JSON.stringify([
                { disease: "Asthma", probability: 75 },
                { disease: "Bronchitis", probability: 55 }
            ]),
            createdAt: new Date('2024-12-16T11:00:00Z'),
        }
    ];

    await db.insert(assessments).values(sampleAssessments);
    
    console.log('✅ Assessments seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});