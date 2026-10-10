import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { bearer } from "better-auth/plugins";
import { NextRequest } from 'next/server';
import { headers } from "next/headers";
import { db } from "@/db";
import * as schema from "@/db/schema";

const vercelBase = process.env.VERCEL_PROJECT_PRODUCTION_URL 
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` 
  : process.env.VERCEL_URL 
  ? `https://${process.env.VERCEL_URL}` 
  : undefined;

const resolvedBaseURL = process.env.BETTER_AUTH_URL || vercelBase || "http://localhost:3000";

export const auth = betterAuth({
	baseURL: resolvedBaseURL,
	secret: process.env.BETTER_AUTH_SECRET || "JIJjeyM5pGZpJGo15qT+LcvLm8ZGNzo4rDnJEm2MLjY=",
	trustedOrigins: [
		"http://localhost:3000",
		"http://localhost:3001",
		"http://127.0.0.1:3000",
		"http://127.0.0.1:3001",
		resolvedBaseURL,
		...(vercelBase ? [vercelBase] : []),
		...(process.env.BETTER_AUTH_URL ? [process.env.BETTER_AUTH_URL] : []),
		...(process.env.NEXT_PUBLIC_SITE_URL ? [process.env.NEXT_PUBLIC_SITE_URL] : []),
	],
	database: drizzleAdapter(db, {
		provider: "sqlite",
		schema,
	}),
	emailAndPassword: {    
		enabled: true,
		minPasswordLength: 4,
		autoSignIn: true
	},
	plugins: [bearer()]
});

// Session validation helper
export async function getCurrentUser(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user || null;
}