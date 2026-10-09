import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { healthMetrics, appointments, medications, healthActivities, assessments } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized', code: 'AUTH_REQUIRED' }, { status: 401 });
    }

    const userId = session.user.id;
    const now = new Date();

    // 1. Health Metrics
    const existingMetrics = await db
      .select()
      .from(healthMetrics)
      .where(eq(healthMetrics.userId, userId))
      .limit(1);

    if (existingMetrics.length === 0) {
      await db.insert(healthMetrics).values({
        userId,
        heartRate: 72,
        bloodPressureSystolic: 120,
        bloodPressureDiastolic: 80,
        dailySteps: 8547,
        sleepHours: 7.5,
        recordedAt: now,
        createdAt: now,
      });
    }

    // 2. Appointments
    const existingAppts = await db
      .select()
      .from(appointments)
      .where(eq(appointments.userId, userId))
      .limit(1);

    if (existingAppts.length === 0) {
      const fiveDaysLater = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
      const twelveDaysLater = new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000);

      await db.insert(appointments).values([
        {
          userId,
          doctorName: 'Dr. Sarah Johnson',
          specialty: 'General Practice',
          appointmentType: 'Comprehensive Health Checkup',
          appointmentDate: fiveDaysLater,
          location: 'City Health Clinic, Suite 300',
          phone: '(555) 234-5678',
          status: 'scheduled',
          createdAt: now,
        },
        {
          userId,
          doctorName: 'Dr. Michael Chen',
          specialty: 'Cardiology',
          appointmentType: 'Routine Cardiovascular Review',
          appointmentDate: twelveDaysLater,
          location: 'Heart Care Center, 2nd Floor',
          phone: '(555) 345-6789',
          status: 'scheduled',
          createdAt: now,
        },
      ]);
    }

    // 3. Medications
    const existingMeds = await db
      .select()
      .from(medications)
      .where(eq(medications.userId, userId))
      .limit(1);

    if (existingMeds.length === 0) {
      const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      const sixtyDaysLater = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);

      await db.insert(medications).values([
        {
          userId,
          name: 'Vitamin D3 & Calcium',
          dosage: '1000 IU',
          frequency: 'Once daily after breakfast',
          duration: '30 days',
          notes: 'Take with full glass of water',
          startDate: now,
          endDate: thirtyDaysLater,
          status: 'active',
          progress: 35,
          createdAt: now,
        },
        {
          userId,
          name: 'Omega-3 Fish Oil',
          dosage: '500 mg',
          frequency: 'Once daily with meals',
          duration: '60 days',
          notes: 'Promotes cardiovascular and brain wellness',
          startDate: now,
          endDate: sixtyDaysLater,
          status: 'active',
          progress: 15,
          createdAt: now,
        },
      ]);
    }

    // 4. Health Activities
    const existingActivities = await db
      .select()
      .from(healthActivities)
      .where(eq(healthActivities.userId, userId))
      .limit(1);

    if (existingActivities.length === 0) {
      await db.insert(healthActivities).values([
        {
          userId,
          activityType: 'symptom_check',
          title: 'Account Activated & Connected',
          description: `Welcome to HealthAI Monitor, ${session.user.name || 'User'}! Your health tracking profile is initialized.`,
          createdAt: now,
        },
        {
          userId,
          activityType: 'appointment',
          title: 'Consultation Scheduled',
          description: 'Upcoming checkup booked with Dr. Sarah Johnson',
          createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
        },
      ]);
    }

    // 5. Baseline Assessment
    const existingAssessments = await db
      .select()
      .from(assessments)
      .where(eq(assessments.userId, userId))
      .limit(1);

    if (existingAssessments.length === 0) {
      await db.insert(assessments).values({
        userId,
        symptoms: ['Fatigue', 'Headache', 'Mild fever'],
        additionalInfo: 'Initial profile health assessment',
        results: [
          { disease: 'Common Cold', probability: 78, matchingSymptoms: 3, totalSymptoms: 6 },
          { disease: 'Flu (Influenza)', probability: 48, matchingSymptoms: 3, totalSymptoms: 6 },
        ],
        createdAt: now,
      });
    }

    return NextResponse.json({ success: true, message: 'User data initialized successfully' }, { status: 200 });
  } catch (error) {
    console.error('Init user data error:', error);
    return NextResponse.json(
      { error: 'Failed to initialize user data: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
