import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { medications } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Authentication validation
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid medication ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const medicationId = parseInt(id);

    // Check if medication exists and belongs to user
    const existingMedication = await db
      .select()
      .from(medications)
      .where(and(eq(medications.id, medicationId), eq(medications.userId, userId)))
      .limit(1);

    if (existingMedication.length === 0) {
      return NextResponse.json(
        { error: 'Medication not found', code: 'MEDICATION_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Security check: reject if userId provided in body
    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json(
        {
          error: 'User ID cannot be provided in request body',
          code: 'USER_ID_NOT_ALLOWED',
        },
        { status: 400 }
      );
    }

    // Extract allowed fields
    const {
      name,
      dosage,
      frequency,
      duration,
      notes,
      startDate,
      endDate,
      status,
      progress,
    } = body;

    // Validate progress if provided
    if (progress !== undefined && (progress < 0 || progress > 100)) {
      return NextResponse.json(
        {
          error: 'Progress must be between 0 and 100',
          code: 'INVALID_PROGRESS',
        },
        { status: 400 }
      );
    }

    // Validate status if provided
    if (status && !['active', 'completed', 'stopped'].includes(status)) {
      return NextResponse.json(
        {
          error: 'Status must be one of: active, completed, stopped',
          code: 'INVALID_STATUS',
        },
        { status: 400 }
      );
    }

    // Build update object with only provided fields
    const updates: Record<string, any> = {};

    if (name !== undefined) updates.name = name.trim();
    if (dosage !== undefined) updates.dosage = dosage.trim();
    if (frequency !== undefined) updates.frequency = frequency.trim();
    if (duration !== undefined) updates.duration = duration.trim();
    if (notes !== undefined) updates.notes = notes ? notes.trim() : null;
    if (startDate !== undefined) updates.startDate = new Date(startDate);
    if (endDate !== undefined) updates.endDate = endDate ? new Date(endDate) : null;
    if (status !== undefined) updates.status = status;
    if (progress !== undefined) updates.progress = progress;

    // Update medication
    const updatedMedication = await db
      .update(medications)
      .set(updates)
      .where(and(eq(medications.id, medicationId), eq(medications.userId, userId)))
      .returning();

    if (updatedMedication.length === 0) {
      return NextResponse.json(
        { error: 'Failed to update medication', code: 'UPDATE_FAILED' },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedMedication[0], { status: 200 });
  } catch (error) {
    console.error('PUT medication error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Authentication validation
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid medication ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const medicationId = parseInt(id);

    // Check if medication exists and belongs to user
    const existingMedication = await db
      .select()
      .from(medications)
      .where(and(eq(medications.id, medicationId), eq(medications.userId, userId)))
      .limit(1);

    if (existingMedication.length === 0) {
      return NextResponse.json(
        { error: 'Medication not found', code: 'MEDICATION_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Delete medication
    const deletedMedication = await db
      .delete(medications)
      .where(and(eq(medications.id, medicationId), eq(medications.userId, userId)))
      .returning();

    if (deletedMedication.length === 0) {
      return NextResponse.json(
        { error: 'Failed to delete medication', code: 'DELETE_FAILED' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Medication deleted successfully',
        medication: deletedMedication[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE medication error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
      },
      { status: 500 }
    );
  }
}