import { db } from '@/db';
import { healthActivities } from '@/db/schema';

async function main() {
    const now = new Date();
    const demoUserId = 'user_01h4kxt2e8z9y3b1n7m6q5w8r4';

    const sampleActivities = [
        {
            userId: demoUserId,
            activityType: 'symptom_check',
            title: 'Flu Symptoms Assessment',
            description: 'Checked symptoms: fever, body aches, fatigue. Results suggest possible flu.',
            createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        },
        {
            userId: demoUserId,
            activityType: 'chat_session',
            title: 'Consultation with AI Assistant',
            description: 'Discussed persistent headaches and received advice on when to see a doctor.',
            createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        },
        {
            userId: demoUserId,
            activityType: 'lab_results',
            title: 'Blood Work Results',
            description: 'Annual blood panel completed. All values within normal range.',
            createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        },
        {
            userId: demoUserId,
            activityType: 'appointment',
            title: 'Cardiology Follow-up',
            description: 'Completed follow-up appointment with Dr. Johnson. Blood pressure stable.',
            createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        },
        {
            userId: demoUserId,
            activityType: 'symptom_check',
            title: 'Allergy Symptoms Check',
            description: 'Assessed seasonal allergy symptoms: sneezing, itchy eyes.',
            createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
        },
        {
            userId: demoUserId,
            activityType: 'chat_session',
            title: 'Medication Guidance',
            description: 'Asked about potential side effects of new prescription medication.',
            createdAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
        },
        {
            userId: demoUserId,
            activityType: 'lab_results',
            title: 'Cholesterol Screening',
            description: 'Lipid panel results show improvement from previous test.',
            createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
        },
        {
            userId: demoUserId,
            activityType: 'appointment',
            title: 'Dental Cleaning',
            description: 'Routine dental cleaning completed. No issues found.',
            createdAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000),
        },
    ];

    await db.insert(healthActivities).values(sampleActivities);
    
    console.log('✅ Health activities seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});