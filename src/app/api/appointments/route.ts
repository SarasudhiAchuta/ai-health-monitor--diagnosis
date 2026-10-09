import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { appointments } from '@/db/schema';
import { eq, asc, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';

async function getAuthenticatedUser(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user?.id) {
    return null;
  }
  return session.user;
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const appointmentId = parseInt(id);
      if (isNaN(appointmentId)) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const appointment = await db
        .select()
        .from(appointments)
        .where(and(eq(appointments.id, appointmentId), eq(appointments.userId, user.id)))
        .limit(1);

      if (appointment.length === 0) {
        return NextResponse.json(
          { error: 'Appointment not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(appointment[0], { status: 200 });
    }

    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    const results = await db
      .select()
      .from(appointments)
      .where(eq(appointments.userId, user.id))
      .orderBy(asc(appointments.appointmentDate))
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
    const user = await getAuthenticatedUser(request);
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

    const { doctorName, specialty, appointmentType, appointmentDate, location, phone } = body;

    if (!doctorName || typeof doctorName !== 'string' || !doctorName.trim()) {
      return NextResponse.json(
        { error: 'Doctor name is required', code: 'MISSING_DOCTOR_NAME' },
        { status: 400 }
      );
    }

    if (!specialty || typeof specialty !== 'string' || !specialty.trim()) {
      return NextResponse.json(
        { error: 'Specialty is required', code: 'MISSING_SPECIALTY' },
        { status: 400 }
      );
    }

    if (!appointmentType || typeof appointmentType !== 'string' || !appointmentType.trim()) {
      return NextResponse.json(
        { error: 'Appointment type is required', code: 'MISSING_APPOINTMENT_TYPE' },
        { status: 400 }
      );
    }

    if (!appointmentDate) {
      return NextResponse.json(
        { error: 'Appointment date is required', code: 'MISSING_APPOINTMENT_DATE' },
        { status: 400 }
      );
    }

    const parsedDate = new Date(appointmentDate);
    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid appointment date format', code: 'INVALID_DATE' },
        { status: 400 }
      );
    }

    if (!location || typeof location !== 'string' || !location.trim()) {
      return NextResponse.json(
        { error: 'Location is required', code: 'MISSING_LOCATION' },
        { status: 400 }
      );
    }

    if (!phone || typeof phone !== 'string' || !phone.trim()) {
      return NextResponse.json(
        { error: 'Phone is required', code: 'MISSING_PHONE' },
        { status: 400 }
      );
    }

    const newAppointment = await db
      .insert(appointments)
      .values({
        userId: user.id,
        doctorName: doctorName.trim(),
        specialty: specialty.trim(),
        appointmentType: appointmentType.trim(),
        appointmentDate: parsedDate,
        location: location.trim(),
        phone: phone.trim(),
        status: 'scheduled',
        createdAt: new Date(),
      })
      .returning();

    return NextResponse.json(newAppointment[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}