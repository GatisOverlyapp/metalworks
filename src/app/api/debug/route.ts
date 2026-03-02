import { NextResponse } from "next/server";
import { createClient } from "@libsql/client";

export async function GET() {
  try {
    const url = process.env.DATABASE_URL ?? "file:dev.db";
    const authToken = process.env.DATABASE_AUTH_TOKEN || undefined;

    const client = createClient({ url, authToken });
    const result = await client.execute("SELECT COUNT(*) as cnt FROM MetalDensity");

    return NextResponse.json({
      ok: true,
      url: url.substring(0, 40),
      hasToken: !!authToken,
      count: result.rows[0],
    });
  } catch (e) {
    return NextResponse.json({
      ok: false,
      error: e instanceof Error ? e.message : String(e),
      stack: e instanceof Error ? e.stack : undefined,
    }, { status: 500 });
  }
}
