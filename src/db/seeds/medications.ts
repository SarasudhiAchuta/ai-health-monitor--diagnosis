import { db } from '@/db';
import { medications } from '@/db/schema';

async function main() {
    const demoUserId = 'user_01h4kxt2e8z9y3b1n7m6q5w8r4';
    
    const now = new Date();
    const sixMonthsAgo = new Date(now);
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const threeDaysAgo = new Date(now);
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    
    const fourDaysFromNow = new Date(now);
    fourDaysFromNow.setDate(fourDaysFromNow.getDate() + 4);
    
    const sixtyDaysAgo = new Date(now);
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    
    const thirtyDaysFromNow = new Date(now);
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const fourteenDaysAgo = new Date(now);
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    
    const oneYearAgo = new Date(now);
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const sampleMedications = [
        {
            userId: demoUserId,
            name: 'Lisinopril',
            dosage: '10mg',
            frequency: 'Once daily',
            duration: 'Long-term',
            notes: 'For blood pressure management',
            startDate: sixMonthsAgo,
            endDate: null,
            status: 'active',
            progress: 0,
            createdAt: sixMonthsAgo,
        },
        {
            userId: demoUserId,
            name: 'Amoxicillin',
            dosage: '500mg',
            frequency: 'Three times daily',
            duration: '7 days',
            notes: 'Take with food',
            startDate: threeDaysAgo,
            endDate: fourDaysFromNow,
            status: 'active',
            progress: 43,
            createdAt: threeDaysAgo,
        },
        {
            userId: demoUserId,
            name: 'Vitamin D3',
            dosage: '2000 IU',
            frequency: 'Once daily',
            duration: '90 days',
            notes: 'Take in morning',
            startDate: sixtyDaysAgo,
            endDate: thirtyDaysFromNow,
            status: 'active',
            progress: 67,
            createdAt: sixtyDaysAgo,
        },
        {
            userId: demoUserId,
            name: 'Ibuprofen',
            dosage: '400mg',
            frequency: 'As needed',
            duration: '14 days',
            notes: 'For headache relief',
            startDate: fourteenDaysAgo,
            endDate: now,
            status: 'completed',
            progress: 100,
            createdAt: fourteenDaysAgo,
        },
        {
            userId: demoUserId,
            name: 'Metformin',
            dosage: '500mg',
            frequency: 'Twice daily',
            duration: 'Long-term',
            notes: 'For diabetes management',
            startDate: oneYearAgo,
            endDate: null,
            status: 'active',
            progress: 0,
            createdAt: oneYearAgo,
        },
    ];

    await db.insert(medications).values(sampleMedications);
    
    console.log('✅ Medications seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});