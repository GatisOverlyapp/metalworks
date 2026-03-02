import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/estimates - list all estimates
export async function GET() {
  try {
    const estimates = await prisma.estimate.findMany({
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        projectName: true,
        clientName: true,
        status: true,
        totalWithVat: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return NextResponse.json(estimates);
  } catch (e) {
    console.error("GET /api/estimates error:", e);
    const err = e instanceof Error ? { message: e.message, stack: e.stack, name: e.name } : String(e);
    return NextResponse.json({ error: err }, { status: 500 });
  }
}

// POST /api/estimates - create new estimate
export async function POST() {
  try {
    const estimate = await prisma.estimate.create({
      data: {
        projectName: "Jauns projekts",
      },
    });
    return NextResponse.json(estimate);
  } catch (e) {
    console.error("POST /api/estimates error:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
