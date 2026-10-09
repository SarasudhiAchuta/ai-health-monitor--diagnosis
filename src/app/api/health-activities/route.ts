import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { healthActivities } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth';

const VALID_ACTIVITY_TYPES = ['symptom_check', 'chat_session', 'lab_results', 'appointment'] as const;

export async function GET(request: NextRequest) {
  try {
    // Authentication
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);

    // Pagination
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    // Query user's health activities
    const activities = await db.select()
      .from(healthActivities)
      .where(eq(healthActivities.userId, userId))
      .orderBy(desc(healthActivities.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(activities, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authentication
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body = await request.json();

    // Security check: reject if userId provided in body
    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json(
        { error: 'User ID cannot be provided in request body', code: 'USER_ID_NOT_ALLOWED' },
        { status: 400 }
      );
    }

    const { activityType, title, description } = body;

    // Validate required fields
    if (!activityType) {
      return NextResponse.json(
        { error: 'Activity type is required', code: 'MISSING_ACTIVITY_TYPE' },
        { status: 400 }
      );
    }

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required', code: 'MISSING_TITLE' },
        { status: 400 }
      );
    }

    if (!description) {
      return NextResponse.json(
        { error: 'Description is required', code: 'MISSING_DESCRIPTION' },
        { status: 400 }
      );
    }

    // Validate activityType
    if (!VALID_ACTIVITY_TYPES.includes(activityType)) {
      return NextResponse.json(
        { 
          error: `Activity type must be one of: ${VALID_ACTIVITY_TYPES.join(', ')}`, 
          code: 'INVALID_ACTIVITY_TYPE' 
        },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedTitle = title.trim();
    const sanitizedDescription = description.trim();

    if (!sanitizedTitle || !sanitizedDescription) {
      return NextResponse.json(
        { error: 'Title and description cannot be empty', code: 'EMPTY_FIELDS' },
        { status: 400 }
      );
    }

    // Insert new health activity
    const newActivity = await db.insert(healthActivities)
      .values({
        userId,
        activityType,
        title: sanitizedTitle,
        description: sanitizedDescription,
        createdAt: new Date()
      })
      .returning();

    return NextResponse.json(newActivity[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}