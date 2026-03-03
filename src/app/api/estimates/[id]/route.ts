import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/estimates/[id] - get full estimate with all jobs, materials, cost lines
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const estimate = await prisma.estimate.findUnique({
    where: { id },
    include: {
      jobs: {
        orderBy: { sortOrder: "asc" },
        include: {
          materials: { orderBy: { sortOrder: "asc" } },
          costLines: { orderBy: { sortOrder: "asc" } },
        },
      },
    },
  });

  if (!estimate) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(estimate);
}

// PUT /api/estimates/[id] - update estimate metadata
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const estimate = await prisma.estimate.update({
    where: { id },
    data: {
      projectName: body.projectName,
      clientName: body.clientName,
      clientCompany: body.clientCompany,
      clientPhone: body.clientPhone,
      clientEmail: body.clientEmail,
      companyName: body.companyName,
      companyRegNr: body.companyRegNr,
      offerValidDays: body.offerValidDays,
      advancePercent: body.advancePercent,
      notes: body.notes,
      status: body.status,
    },
  });

  return NextResponse.json(estimate);
}

// DELETE /api/estimates/[id]
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.estimate.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
