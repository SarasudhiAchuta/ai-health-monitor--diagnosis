import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { medications } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';

async function authenticateRequest(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  
  if (!session || !session.user) {
    return null;
  }
  
  return session.user;
}

export async function GET(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const medicationId = parseInt(id);
      
      if (isNaN(medicationId)) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const result = await db
        .select()
        .from(medications)
        .where(and(eq(medications.id, medicationId), eq(medications.userId, user.id)))
        .limit(1);

      if (result.length === 0) {
        return NextResponse.json(
          { error: 'Medication not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(result[0], { status: 200 });
    }

    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    const results = await db
      .select()
      .from(medications)
      .where(eq(medications.userId, user.id))
      .orderBy(desc(medications.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });
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
    const user = await authenticateRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    const body = await request.json();

    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json(
        { error: 'User ID cannot be provided in request body', code: 'USER_ID_NOT_ALLOWED' },
        { status: 400 }
      );
    }

    const { name, dosage, frequency, duration, startDate, notes, endDate } = body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json(
        { error: 'Name is required and must be a non-empty string', code: 'MISSING_NAME' },
        { status: 400 }
      );
    }

    if (!dosage || typeof dosage !== 'string' || dosage.trim() === '') {
      return NextResponse.json(
        { error: 'Dosage is required and must be a non-empty string', code: 'MISSING_DOSAGE' },
        { status: 400 }
      );
    }

    if (!frequency || typeof frequency !== 'string' || frequency.trim() === '') {
      return NextResponse.json(
        { error: 'Frequency is required and must be a non-empty string', code: 'MISSING_FREQUENCY' },
        { status: 400 }
      );
    }

    if (!duration || typeof duration !== 'string' || duration.trim() === '') {
      return NextResponse.json(
        { error: 'Duration is required and must be a non-empty string', code: 'MISSING_DURATION' },
        { status: 400 }
      );
    }

    if (!startDate) {
      return NextResponse.json(
        { error: 'Start date is required', code: 'MISSING_START_DATE' },
        { status: 400 }
      );
    }

    const startDateTimestamp = new Date(startDate);
    if (isNaN(startDateTimestamp.getTime())) {
      return NextResponse.json(
        { error: 'Invalid start date format', code: 'INVALID_START_DATE' },
        { status: 400 }
      );
    }

    let endDateTimestamp = null;
    if (endDate) {
      endDateTimestamp = new Date(endDate);
      if (isNaN(endDateTimestamp.getTime())) {
        return NextResponse.json(
          { error: 'Invalid end date format', code: 'INVALID_END_DATE' },
          { status: 400 }
        );
      }
    }

    const insertData: any = {
      userId: user.id,
      name: name.trim(),
      dosage: dosage.trim(),
      frequency: frequency.trim(),
      duration: duration.trim(),
      startDate: startDateTimestamp,
      status: 'active',
      progress: 0,
      createdAt: new Date(),
    };

    if (notes && typeof notes === 'string') {
      insertData.notes = notes.trim();
    }

    if (endDateTimestamp) {
      insertData.endDate = endDateTimestamp;
    }

    const newMedication = await db
      .insert(medications)
      .values(insertData)
      .returning();

    return NextResponse.json(newMedication[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const medicationId = parseInt(id);
    const body = await request.json();

    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json(
        { error: 'User ID cannot be provided in request body', code: 'USER_ID_NOT_ALLOWED' },
        { status: 400 }
      );
    }

    const existingMedication = await db
      .select()
      .from(medications)
      .where(and(eq(medications.id, medicationId), eq(medications.userId, user.id)))
      .limit(1);

    if (existingMedication.length === 0) {
      return NextResponse.json(
        { error: 'Medication not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const updates: any = {};

    if (body.name !== undefined) {
      if (typeof body.name !== 'string' || body.name.trim() === '') {
        return NextResponse.json(
          { error: 'Name must be a non-empty string', code: 'INVALID_NAME' },
          { status: 400 }
        );
      }
      updates.name = body.name.trim();
    }

    if (body.dosage !== undefined) {
      if (typeof body.dosage !== 'string' || body.dosage.trim() === '') {
        return NextResponse.json(
          { error: 'Dosage must be a non-empty string', code: 'INVALID_DOSAGE' },
          { status: 400 }
        );
      }
      updates.dosage = body.dosage.trim();
    }

    if (body.frequency !== undefined) {
      if (typeof body.frequency !== 'string' || body.frequency.trim() === '') {
        return NextResponse.json(
          { error: 'Frequency must be a non-empty string', code: 'INVALID_FREQUENCY' },
          { status: 400 }
        );
      }
      updates.frequency = body.frequency.trim();
    }

    if (body.duration !== undefined) {
      if (typeof body.duration !== 'string' || body.duration.trim() === '') {
        return NextResponse.json(
          { error: 'Duration must be a non-empty string', code: 'INVALID_DURATION' },
          { status: 400 }
        );
      }
      updates.duration = body.duration.trim();
    }

    if (body.notes !== undefined) {
      if (body.notes === null) {
        updates.notes = null;
      } else if (typeof body.notes === 'string') {
        updates.notes = body.notes.trim();
      } else {
        return NextResponse.json(
          { error: 'Notes must be a string or null', code: 'INVALID_NOTES' },
          { status: 400 }
        );
      }
    }

    if (body.startDate !== undefined) {
      const startDateTimestamp = new Date(body.startDate);
      if (isNaN(startDateTimestamp.getTime())) {
        return NextResponse.json(
          { error: 'Invalid start date format', code: 'INVALID_START_DATE' },
          { status: 400 }
        );
      }
      updates.startDate = startDateTimestamp;
    }

    if (body.endDate !== undefined) {
      if (body.endDate === null) {
        updates.endDate = null;
      } else {
        const endDateTimestamp = new Date(body.endDate);
        if (isNaN(endDateTimestamp.getTime())) {
          return NextResponse.json(
            { error: 'Invalid end date format', code: 'INVALID_END_DATE' },
            { status: 400 }
          );
        }
        updates.endDate = endDateTimestamp;
      }
    }

    if (body.status !== undefined) {
      if (!['active', 'completed', 'stopped'].includes(body.status)) {
        return NextResponse.json(
          { error: 'Status must be active, completed, or stopped', code: 'INVALID_STATUS' },
          { status: 400 }
        );
      }
      updates.status = body.status;
    }

    if (body.progress !== undefined) {
      const progress = parseInt(body.progress);
      if (isNaN(progress) || progress < 0 || progress > 100) {
        return NextResponse.json(
          { error: 'Progress must be a number between 0 and 100', code: 'INVALID_PROGRESS' },
          { status: 400 }
        );
      }
      updates.progress = progress;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(existingMedication[0], { status: 200 });
    }

    const updatedMedication = await db
      .update(medications)
      .set(updates)
      .where(and(eq(medications.id, medicationId), eq(medications.userId, user.id)))
      .returning();

    return NextResponse.json(updatedMedication[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const medicationId = parseInt(id);

    const existingMedication = await db
      .select()
      .from(medications)
      .where(and(eq(medications.id, medicationId), eq(medications.userId, user.id)))
      .limit(1);

    if (existingMedication.length === 0) {
      return NextResponse.json(
        { error: 'Medication not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const deleted = await db
      .delete(medications)
      .where(and(eq(medications.id, medicationId), eq(medications.userId, user.id)))
      .returning();

    return NextResponse.json(
      {
        message: 'Medication deleted successfully',
        medication: deleted[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}