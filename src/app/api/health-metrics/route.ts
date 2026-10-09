import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { healthMetrics } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ 
        error: 'Unauthorized', 
        code: 'AUTH_REQUIRED' 
      }, { status: 401 });
    }

    const userId = session.user.id;

    // Get the most recent health metric for the user
    const metrics = await db.select()
      .from(healthMetrics)
      .where(eq(healthMetrics.userId, userId))
      .orderBy(desc(healthMetrics.recordedAt))
      .limit(1);

    if (metrics.length === 0) {
      const now = new Date();
      const defaultMetric = await db
        .insert(healthMetrics)
        .values({
          userId,
          heartRate: 72,
          bloodPressureSystolic: 120,
          bloodPressureDiastolic: 80,
          dailySteps: 8547,
          sleepHours: 7.5,
          recordedAt: now,
          createdAt: now,
        })
        .returning();

      return NextResponse.json(defaultMetric[0], { status: 200 });
    }

    return NextResponse.json(metrics[0], { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ 
        error: 'Unauthorized', 
        code: 'AUTH_REQUIRED' 
      }, { status: 401 });
    }

    const userId = session.user.id;

    // Parse request body
    const body = await request.json();

    // Security check: reject if userId provided in body
    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json({ 
        error: 'User ID cannot be provided in request body',
        code: 'USER_ID_NOT_ALLOWED' 
      }, { status: 400 });
    }

    const { heartRate, bloodPressureSystolic, bloodPressureDiastolic, dailySteps, sleepHours } = body;

    // Validate required fields
    if (heartRate === undefined || heartRate === null) {
      return NextResponse.json({ 
        error: 'Heart rate is required',
        code: 'MISSING_HEART_RATE' 
      }, { status: 400 });
    }

    if (bloodPressureSystolic === undefined || bloodPressureSystolic === null) {
      return NextResponse.json({ 
        error: 'Systolic blood pressure is required',
        code: 'MISSING_BLOOD_PRESSURE_SYSTOLIC' 
      }, { status: 400 });
    }

    if (bloodPressureDiastolic === undefined || bloodPressureDiastolic === null) {
      return NextResponse.json({ 
        error: 'Diastolic blood pressure is required',
        code: 'MISSING_BLOOD_PRESSURE_DIASTOLIC' 
      }, { status: 400 });
    }

    if (dailySteps === undefined || dailySteps === null) {
      return NextResponse.json({ 
        error: 'Daily steps is required',
        code: 'MISSING_DAILY_STEPS' 
      }, { status: 400 });
    }

    if (sleepHours === undefined || sleepHours === null) {
      return NextResponse.json({ 
        error: 'Sleep hours is required',
        code: 'MISSING_SLEEP_HOURS' 
      }, { status: 400 });
    }

    // Validate field types and constraints
    const heartRateNum = parseInt(heartRate);
    if (isNaN(heartRateNum) || heartRateNum <= 0) {
      return NextResponse.json({ 
        error: 'Heart rate must be a positive integer',
        code: 'INVALID_HEART_RATE' 
      }, { status: 400 });
    }

    const systolicNum = parseInt(bloodPressureSystolic);
    if (isNaN(systolicNum) || systolicNum <= 0) {
      return NextResponse.json({ 
        error: 'Systolic blood pressure must be a positive integer',
        code: 'INVALID_BLOOD_PRESSURE_SYSTOLIC' 
      }, { status: 400 });
    }

    const diastolicNum = parseInt(bloodPressureDiastolic);
    if (isNaN(diastolicNum) || diastolicNum <= 0) {
      return NextResponse.json({ 
        error: 'Diastolic blood pressure must be a positive integer',
        code: 'INVALID_BLOOD_PRESSURE_DIASTOLIC' 
      }, { status: 400 });
    }

    const stepsNum = parseInt(dailySteps);
    if (isNaN(stepsNum) || stepsNum < 0) {
      return NextResponse.json({ 
        error: 'Daily steps must be a non-negative integer',
        code: 'INVALID_DAILY_STEPS' 
      }, { status: 400 });
    }

    const sleepNum = parseFloat(sleepHours);
    if (isNaN(sleepNum) || sleepNum < 0) {
      return NextResponse.json({ 
        error: 'Sleep hours must be a non-negative number',
        code: 'INVALID_SLEEP_HOURS' 
      }, { status: 400 });
    }

    // Create new health metric
    const currentTimestamp = new Date();
    const newMetric = await db.insert(healthMetrics)
      .values({
        userId,
        heartRate: heartRateNum,
        bloodPressureSystolic: systolicNum,
        bloodPressureDiastolic: diastolicNum,
        dailySteps: stepsNum,
        sleepHours: sleepNum,
        recordedAt: currentTimestamp,
        createdAt: currentTimestamp,
      })
      .returning();

    return NextResponse.json(newMetric[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}