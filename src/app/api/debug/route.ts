import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    hasDbUrl: !!process.env.DATABASE_URL,
    dbUrlPrefix: (process.env.DATABASE_URL || "").substring(0, 40),
    hasAuthToken: !!process.env.DATABASE_AUTH_TOKEN,
    nodeEnv: process.env.NODE_ENV,
  });
}
