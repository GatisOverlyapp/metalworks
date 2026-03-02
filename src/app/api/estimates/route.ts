import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/estimates - list all estimates
export async function GET() {
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
}

// POST /api/estimates - create new estimate
export async function POST() {
  const estimate = await prisma.estimate.create({
    data: {
      projectName: "Jauns projekts",
    },
  });
  return NextResponse.json(estimate);
}
