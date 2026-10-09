import { db } from '@/db';
import { healthMetrics } from '@/db/schema';

async function main() {
    const demoUserId = 'user_01h4kxt2e8z9y3b1n7m6q5w8r4';
    const today = new Date();
    
    const sampleHealthMetrics = [
        {
            userId: demoUserId,
            heartRate: 72,
            bloodPressureSystolic: 118,
            bloodPressureDiastolic: 78,
            dailySteps: 8500,
            sleepHours: 7.5,
            recordedAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6, 9, 0, 0),
            createdAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6, 9, 0, 0),
        },
        {
            userId: demoUserId,
            heartRate: 68,
            bloodPressureSystolic: 115,
            bloodPressureDiastolic: 75,
            dailySteps: 10200,
            sleepHours: 8.0,
            recordedAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 5, 9, 0, 0),
            createdAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 5, 9, 0, 0),
        },
        {
            userId: demoUserId,
            heartRate: 75,
            bloodPressureSystolic: 122,
            bloodPressureDiastolic: 80,
            dailySteps: 6800,
            sleepHours: 6.5,
            recordedAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 4, 9, 0, 0),
            createdAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 4, 9, 0, 0),
        },
        {
            userId: demoUserId,
            heartRate: 70,
            bloodPressureSystolic: 120,
            bloodPressureDiastolic: 78,
            dailySteps: 9500,
            sleepHours: 7.8,
            recordedAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 3, 9, 0, 0),
            createdAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 3, 9, 0, 0),
        },
        {
            userId: demoUserId,
            heartRate: 66,
            bloodPressureSystolic: 112,
            bloodPressureDiastolic: 72,
            dailySteps: 11500,
            sleepHours: 8.2,
            recordedAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 2, 9, 0, 0),
            createdAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 2, 9, 0, 0),
        },
        {
            userId: demoUserId,
            heartRate: 78,
            bloodPressureSystolic: 125,
            bloodPressureDiastolic: 82,
            dailySteps: 4500,
            sleepHours: 6.8,
            recordedAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1, 9, 0, 0),
            createdAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1, 9, 0, 0),
        },
        {
            userId: demoUserId,
            heartRate: 71,
            bloodPressureSystolic: 119,
            bloodPressureDiastolic: 77,
            dailySteps: 8900,
            sleepHours: 7.6,
            recordedAt: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0, 0),
            createdAt: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0, 0),
        },
    ];

    await db.insert(healthMetrics).values(sampleHealthMetrics);
    
    console.log('✅ Health metrics seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});