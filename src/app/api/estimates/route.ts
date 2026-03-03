import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEFAULT_PRODUCTION_LINES, DEFAULT_DELIVERY_LINES } from "@/lib/types";

// GET /api/estimates - list all estimates
export async function GET() {
  const estimates = await prisma.estimate.findMany({
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { jobs: true } } },
  });

  const items = estimates.map((e) => ({
    id: e.id,
    projectName: e.projectName,
    clientName: e.clientName,
    status: e.status,
    createdAt: e.createdAt.toISOString(),
    updatedAt: e.updatedAt.toISOString(),
    jobCount: e._count.jobs,
  }));

  return NextResponse.json(items);
}

// POST /api/estimates - create new estimate with one default job
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));

  const estimate = await prisma.estimate.create({
    data: {
      projectName: body.projectName || "Jauns projekts",
      jobs: {
        create: {
          name: "Jauns darbs",
          jobType: "full",
          quantity: 1,
          sortOrder: 0,
          costLines: {
            create: [
              ...DEFAULT_PRODUCTION_LINES,
              ...DEFAULT_DELIVERY_LINES,
            ],
          },
        },
      },
    },
    include: {
      jobs: {
        include: {
          materials: { orderBy: { sortOrder: "asc" } },
          costLines: { orderBy: { sortOrder: "asc" } },
        },
      },
    },
  });

  return NextResponse.json(estimate, { status: 201 });
}
