import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { appointments } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Authentication
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
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Security: Reject if userId provided in body
    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json(
        {
          error: 'User ID cannot be provided in request body',
          code: 'USER_ID_NOT_ALLOWED',
        },
        { status: 400 }
      );
    }

    // Check if appointment exists and belongs to user
    const existingAppointment = await db
      .select()
      .from(appointments)
      .where(and(eq(appointments.id, parseInt(id)), eq(appointments.userId, userId)))
      .limit(1);

    if (existingAppointment.length === 0) {
      return NextResponse.json(
        { error: 'Appointment not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Extract updatable fields
    const {
      doctorName,
      specialty,
      appointmentType,
      appointmentDate,
      location,
      phone,
      status,
    } = body;

    // Build update object with only provided fields
    const updates: Record<string, unknown> = {};

    if (doctorName !== undefined) {
      if (typeof doctorName !== 'string' || doctorName.trim() === '') {
        return NextResponse.json(
          { error: 'Doctor name must be a non-empty string', code: 'INVALID_DOCTOR_NAME' },
          { status: 400 }
        );
      }
      updates.doctorName = doctorName.trim();
    }

    if (specialty !== undefined) {
      if (typeof specialty !== 'string' || specialty.trim() === '') {
        return NextResponse.json(
          { error: 'Specialty must be a non-empty string', code: 'INVALID_SPECIALTY' },
          { status: 400 }
        );
      }
      updates.specialty = specialty.trim();
    }

    if (appointmentType !== undefined) {
      if (typeof appointmentType !== 'string' || appointmentType.trim() === '') {
        return NextResponse.json(
          { error: 'Appointment type must be a non-empty string', code: 'INVALID_APPOINTMENT_TYPE' },
          { status: 400 }
        );
      }
      updates.appointmentType = appointmentType.trim();
    }

    if (appointmentDate !== undefined) {
      const date = new Date(appointmentDate);
      if (isNaN(date.getTime())) {
        return NextResponse.json(
          { error: 'Invalid appointment date', code: 'INVALID_DATE' },
          { status: 400 }
        );
      }
      updates.appointmentDate = date;
    }

    if (location !== undefined) {
      if (typeof location !== 'string' || location.trim() === '') {
        return NextResponse.json(
          { error: 'Location must be a non-empty string', code: 'INVALID_LOCATION' },
          { status: 400 }
        );
      }
      updates.location = location.trim();
    }

    if (phone !== undefined) {
      if (typeof phone !== 'string' || phone.trim() === '') {
        return NextResponse.json(
          { error: 'Phone must be a non-empty string', code: 'INVALID_PHONE' },
          { status: 400 }
        );
      }
      updates.phone = phone.trim();
    }

    if (status !== undefined) {
      const validStatuses = ['scheduled', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          {
            error: `Status must be one of: ${validStatuses.join(', ')}`,
            code: 'INVALID_STATUS',
          },
          { status: 400 }
        );
      }
      updates.status = status;
    }

    // Check if there are any updates
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update', code: 'NO_UPDATES' },
        { status: 400 }
      );
    }

    // Update appointment
    const updated = await db
      .update(appointments)
      .set(updates)
      .where(and(eq(appointments.id, parseInt(id)), eq(appointments.userId, userId)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'Failed to update appointment', code: 'UPDATE_FAILED' },
        { status: 500 }
      );
    }

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
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
    // Authentication
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
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if appointment exists and belongs to user
    const existingAppointment = await db
      .select()
      .from(appointments)
      .where(and(eq(appointments.id, parseInt(id)), eq(appointments.userId, userId)))
      .limit(1);

    if (existingAppointment.length === 0) {
      return NextResponse.json(
        { error: 'Appointment not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Delete appointment
    const deleted = await db
      .delete(appointments)
      .where(and(eq(appointments.id, parseInt(id)), eq(appointments.userId, userId)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: 'Failed to delete appointment', code: 'DELETE_FAILED' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Appointment deleted successfully',
        appointment: deleted[0],
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