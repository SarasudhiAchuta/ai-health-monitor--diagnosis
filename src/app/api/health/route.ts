import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";

/**
 * Health check endpoint for AWS monitoring
 * Used by load balancers and monitoring services
 */
export async function GET() {
  try {
    // Test database connection
    await db.run(sql`SELECT 1`);

    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      service: "HealthAI Monitor",
      version: "1.0.0",
      database: "connected",
      environment: process.env.NODE_ENV || "development",
    });
  } catch (error) {
    console.error("Health check failed:", error);
    
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        service: "HealthAI Monitor",
        error: error instanceof Error ? error.message : "Unknown error",
        database: "disconnected",
      },
      { status: 503 }
    );
  }
}
