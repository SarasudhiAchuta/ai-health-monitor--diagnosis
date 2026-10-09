import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { assessments } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';

async function getAuthenticatedUser(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session?.user?.id) {
      return null;
    }
    
    return session.user;
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
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

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (id) {
      const assessmentId = parseInt(id);
      
      if (isNaN(assessmentId)) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const assessment = await db
        .select()
        .from(assessments)
        .where(and(eq(assessments.id, assessmentId), eq(assessments.userId, user.id)))
        .limit(1);

      if (assessment.length === 0) {
        return NextResponse.json(
          { error: 'Assessment not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(assessment[0], { status: 200 });
    }

    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    const userAssessments = await db
      .select()
      .from(assessments)
      .where(eq(assessments.userId, user.id))
      .orderBy(desc(assessments.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(userAssessments, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
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
        { 
          error: 'User ID cannot be provided in request body',
          code: 'USER_ID_NOT_ALLOWED' 
        },
        { status: 400 }
      );
    }

    const { symptoms, additionalInfo, results } = body;

    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      return NextResponse.json(
        { 
          error: 'Symptoms must be a non-empty array',
          code: 'INVALID_SYMPTOMS' 
        },
        { status: 400 }
      );
    }

    if (!results || !Array.isArray(results) || results.length === 0) {
      return NextResponse.json(
        { 
          error: 'Results must be a non-empty array',
          code: 'INVALID_RESULTS' 
        },
        { status: 400 }
      );
    }

    if (additionalInfo !== undefined && typeof additionalInfo !== 'string') {
      return NextResponse.json(
        { 
          error: 'Additional info must be a string',
          code: 'INVALID_ADDITIONAL_INFO' 
        },
        { status: 400 }
      );
    }

    const newAssessment = await db
      .insert(assessments)
      .values({
        userId: user.id,
        symptoms: symptoms,
        results: results,
        additionalInfo: additionalInfo || null,
        createdAt: new Date()
      })
      .returning();

    return NextResponse.json(newAssessment[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}