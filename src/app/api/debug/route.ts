import { NextResponse } from "next/server";

export async function GET() {
  try {
    const url = process.env.DATABASE_URL ?? "";
    const authToken = process.env.DATABASE_AUTH_TOKEN || undefined;

    // Test raw URL parsing
    let urlParseResult: string;
    try {
      const parsed = new URL(url);
      urlParseResult = `OK: ${parsed.protocol}//${parsed.host}`;
    } catch (e) {
      urlParseResult = `FAIL: ${e instanceof Error ? e.message : e}`;
    }

    // Test fetch to the URL directly
    let fetchResult: string;
    try {
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ statements: [{ q: "SELECT 1" }] }),
      });
      fetchResult = `${resp.status} ${resp.statusText}`;
    } catch (e) {
      fetchResult = `FAIL: ${e instanceof Error ? e.message : e}`;
    }

    return NextResponse.json({
      nodeVersion: process.version,
      urlPrefix: url.substring(0, 60),
      urlLength: url.length,
      hasAuthToken: !!authToken,
      urlParseResult,
      fetchResult,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
