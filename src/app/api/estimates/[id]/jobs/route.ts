import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEFAULT_PRODUCTION_LINES, DEFAULT_DELIVERY_LINES } from "@/lib/types";

// POST /api/estimates/[id]/jobs - add a new job to estimate
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  // Get max sortOrder
  const existing = await prisma.job.findMany({
    where: { estimateId: id },
    select: { sortOrder: true },
    orderBy: { sortOrder: "desc" },
    take: 1,
  });
  const nextOrder = existing.length > 0 ? existing[0].sortOrder + 1 : 0;

  const jobType = body.jobType || "full";

  const job = await prisma.job.create({
    data: {
      estimateId: id,
      name: body.name || "Jauns darbs",
      description: body.description,
      quantity: body.quantity || 1,
      sortOrder: nextOrder,
      jobType,
      costLines: jobType === "full"
        ? {
            create: [
              ...DEFAULT_PRODUCTION_LINES,
              ...DEFAULT_DELIVERY_LINES,
            ],
          }
        : undefined,
    },
    include: {
      materials: { orderBy: { sortOrder: "asc" } },
      costLines: { orderBy: { sortOrder: "asc" } },
    },
  });

  return NextResponse.json(job, { status: 201 });
}
