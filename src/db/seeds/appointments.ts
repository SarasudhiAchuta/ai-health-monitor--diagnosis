import { db } from '@/db';
import { appointments } from '@/db/schema';

async function main() {
    const now = new Date();
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const tenDaysFromNow = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000);
    const twoWeeksFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

    const demoUserId = 'user_01h4kxt2e8z9y3b1n7m6q5w8r4';

    const sampleAppointments = [
        {
            userId: demoUserId,
            doctorName: 'Dr. Sarah Johnson',
            specialty: 'Cardiology',
            appointmentType: 'Annual Checkup',
            appointmentDate: twoWeeksAgo,
            location: 'City Medical Center, Floor 3',
            phone: '(555) 234-5678',
            status: 'completed',
            createdAt: new Date(twoWeeksAgo.getTime() - 7 * 24 * 60 * 60 * 1000),
        },
        {
            userId: demoUserId,
            doctorName: 'Dr. Michael Chen',
            specialty: 'General Practice',
            appointmentType: 'Follow-up',
            appointmentDate: oneWeekAgo,
            location: 'Healthcare Clinic Downtown',
            phone: '(555) 345-6789',
            status: 'completed',
            createdAt: new Date(oneWeekAgo.getTime() - 5 * 24 * 60 * 60 * 1000),
        },
        {
            userId: demoUserId,
            doctorName: 'Dr. Emily Williams',
            specialty: 'Dermatology',
            appointmentType: 'Consultation',
            appointmentDate: oneWeekFromNow,
            location: 'City Medical Center, Floor 2',
            phone: '(555) 456-7890',
            status: 'scheduled',
            createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        },
        {
            userId: demoUserId,
            doctorName: 'Dr. Robert Martinez',
            specialty: 'Ophthalmology',
            appointmentType: 'Eye Exam',
            appointmentDate: twoWeeksFromNow,
            location: 'Vision Care Center',
            phone: '(555) 567-8901',
            status: 'scheduled',
            createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        },
        {
            userId: demoUserId,
            doctorName: 'Dr. Lisa Anderson',
            specialty: 'Orthopedics',
            appointmentType: 'Sports Injury',
            appointmentDate: threeDaysAgo,
            location: 'Healthcare Clinic Downtown',
            phone: '(555) 678-9012',
            status: 'cancelled',
            createdAt: new Date(threeDaysAgo.getTime() - 10 * 24 * 60 * 60 * 1000),
        },
        {
            userId: demoUserId,
            doctorName: 'Dr. James Thompson',
            specialty: 'Dentistry',
            appointmentType: 'Dental Cleaning',
            appointmentDate: tenDaysFromNow,
            location: 'Dental Associates',
            phone: '(555) 789-0123',
            status: 'scheduled',
            createdAt: now,
        },
    ];

    await db.insert(appointments).values(sampleAppointments);
    
    console.log('✅ Appointments seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});