import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/estimates/[id] - get full estimate with all relations
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const estimate = await prisma.estimate.findUnique({
    where: { id },
    include: {
      flatSheetParts: { orderBy: { sortOrder: "asc" } },
      tubeProfileParts: { orderBy: { sortOrder: "asc" } },
      auxiliaryItems: { orderBy: { sortOrder: "asc" } },
      productionLines: { orderBy: { sortOrder: "asc" } },
      deliveryLines: { orderBy: { sortOrder: "asc" } },
      proposalLines: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!estimate) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(estimate);
}

// PUT /api/estimates/[id] - save entire estimate (full replace)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  // Update main estimate fields
  await prisma.estimate.update({
    where: { id },
    data: {
      projectName: body.projectName,
      clientName: body.clientName,
      clientEmail: body.clientEmail,
      clientPhone: body.clientPhone,
      clientAddr: body.clientAddr,
      companyName: body.companyName,
      companyReg: body.companyReg,
      companyAddr: body.companyAddr,
      companyPhone: body.companyPhone,
      companyEmail: body.companyEmail,
      companyBank: body.companyBank,
      status: body.status,
      discount: body.discount,
      vatRate: body.vatRate,
      notes: body.notes,
      totalMaterialsCost: body.totalMaterialsCost,
      totalProductionCost: body.totalProductionCost,
      totalDeliveryCost: body.totalDeliveryCost,
      totalBeforeDiscount: body.totalBeforeDiscount,
      totalDiscount: body.totalDiscount,
      totalBeforeVat: body.totalBeforeVat,
      totalVat: body.totalVat,
      totalWithVat: body.totalWithVat,
    },
  });

  // Replace all child records using transaction
  await prisma.$transaction([
    // Delete existing children
    prisma.flatSheetPart.deleteMany({ where: { estimateId: id } }),
    prisma.tubeProfilePart.deleteMany({ where: { estimateId: id } }),
    prisma.auxiliaryItem.deleteMany({ where: { estimateId: id } }),
    prisma.productionLine.deleteMany({ where: { estimateId: id } }),
    prisma.deliveryLine.deleteMany({ where: { estimateId: id } }),
    prisma.proposalLine.deleteMany({ where: { estimateId: id } }),
  ]);

  // Create new children
  const creates = [];

  if (body.flatSheetParts?.length) {
    creates.push(
      prisma.flatSheetPart.createMany({
        data: body.flatSheetParts.map((p: Record<string, unknown>, i: number) => ({
          ...p,
          id: undefined, // let DB generate
          estimateId: id,
          sortOrder: i,
        })),
      })
    );
  }

  if (body.tubeProfileParts?.length) {
    creates.push(
      prisma.tubeProfilePart.createMany({
        data: body.tubeProfileParts.map((p: Record<string, unknown>, i: number) => ({
          ...p,
          id: undefined,
          estimateId: id,
          sortOrder: i,
        })),
      })
    );
  }

  if (body.auxiliaryItems?.length) {
    creates.push(
      prisma.auxiliaryItem.createMany({
        data: body.auxiliaryItems.map((p: Record<string, unknown>, i: number) => ({
          ...p,
          id: undefined,
          estimateId: id,
          sortOrder: i,
        })),
      })
    );
  }

  if (body.productionLines?.length) {
    creates.push(
      prisma.productionLine.createMany({
        data: body.productionLines.map((p: Record<string, unknown>, i: number) => ({
          ...p,
          id: undefined,
          estimateId: id,
          sortOrder: i,
        })),
      })
    );
  }

  if (body.deliveryLines?.length) {
    creates.push(
      prisma.deliveryLine.createMany({
        data: body.deliveryLines.map((p: Record<string, unknown>, i: number) => ({
          ...p,
          id: undefined,
          estimateId: id,
          sortOrder: i,
        })),
      })
    );
  }

  if (body.proposalLines?.length) {
    creates.push(
      prisma.proposalLine.createMany({
        data: body.proposalLines.map((p: Record<string, unknown>, i: number) => ({
          ...p,
          id: undefined,
          estimateId: id,
          sortOrder: i,
        })),
      })
    );
  }

  if (creates.length) {
    await prisma.$transaction(creates);
  }

  return NextResponse.json({ success: true });
}

// DELETE /api/estimates/[id]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.estimate.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
