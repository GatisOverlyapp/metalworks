import { NextResponse } from "next/server";
import { createClient } from "@libsql/client";

export async function GET() {
  try {
    const url = process.env.DATABASE_URL ?? "file:dev.db";
    const authToken = process.env.DATABASE_AUTH_TOKEN || undefined;

    // Test 1: Check Node version
    const nodeVersion = process.version;

    // Test 2: Try creating client
    const client = createClient({ url, authToken });
    const result = await client.execute("SELECT COUNT(*) as cnt FROM MetalDensity");

    return NextResponse.json({
      ok: true,
      nodeVersion,
      url: url.substring(0, 50),
      count: result.rows[0],
    });
  } catch (e) {
    return NextResponse.json({
      ok: false,
      nodeVersion: process.version,
      dbUrl: (process.env.DATABASE_URL || "").substring(0, 50),
      error: e instanceof Error ? e.message : String(e),
    }, { status: 500 });
  }
}
