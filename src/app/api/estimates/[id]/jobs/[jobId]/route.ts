import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PUT /api/estimates/[id]/jobs/[jobId] - full update: job meta + materials + costLines
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; jobId: string }> }
) {
  const { jobId } = await params;
  const body = await request.json();

  // Update job metadata
  const jobUpdate: Record<string, unknown> = {};
  if (body.name !== undefined) jobUpdate.name = body.name;
  if (body.description !== undefined) jobUpdate.description = body.description;
  if (body.quantity !== undefined) jobUpdate.quantity = body.quantity;
  if (body.sortOrder !== undefined) jobUpdate.sortOrder = body.sortOrder;
  if (body.jobType !== undefined) jobUpdate.jobType = body.jobType;
  if (body.productionDiscount !== undefined) jobUpdate.productionDiscount = body.productionDiscount;
  if (body.deliveryDiscount !== undefined) jobUpdate.deliveryDiscount = body.deliveryDiscount;

  // Use a transaction for atomic updates
  const result = await prisma.$transaction(async (tx) => {
    // Update job meta
    if (Object.keys(jobUpdate).length > 0) {
      await tx.job.update({ where: { id: jobId }, data: jobUpdate });
    }

    // Upsert materials
    if (body.materials) {
      const existingMaterials = await tx.materialItem.findMany({
        where: { jobId },
        select: { id: true },
      });
      const existingIds = new Set(existingMaterials.map((m) => m.id));
      const incomingIds = new Set<string>();

      for (const mat of body.materials) {
        if (mat.id && existingIds.has(mat.id)) {
          incomingIds.add(mat.id);
          await tx.materialItem.update({
            where: { id: mat.id },
            data: {
              sortOrder: mat.sortOrder,
              name: mat.name,
              notes: mat.notes,
              partType: mat.partType,
              width: mat.width,
              length: mat.length,
              sideB: mat.sideB,
              thickness: mat.thickness,
              outerDiam: mat.outerDiam,
              pcsPerUnit: mat.pcsPerUnit,
              materialKey: mat.materialKey,
              unit: mat.unit,
              pricePerUnit: mat.pricePerUnit,
              wasteMarkup: mat.wasteMarkup,
              weldingLength: mat.weldingLength,
              weldingHours: mat.weldingHours,
              grindingHours: mat.grindingHours,
              strainingHours: mat.strainingHours,
              rollingHours: mat.rollingHours,
              drillingHours: mat.drillingHours,
            },
          });
        } else {
          const created = await tx.materialItem.create({
            data: {
              jobId,
              sortOrder: mat.sortOrder ?? 0,
              name: mat.name ?? "",
              notes: mat.notes,
              partType: mat.partType ?? "flat",
              width: mat.width,
              length: mat.length,
              sideB: mat.sideB,
              thickness: mat.thickness,
              outerDiam: mat.outerDiam,
              pcsPerUnit: mat.pcsPerUnit ?? 1,
              materialKey: mat.materialKey ?? "steel",
              unit: mat.unit ?? "m2",
              pricePerUnit: mat.pricePerUnit ?? 0,
              wasteMarkup: mat.wasteMarkup ?? 0.10,
              weldingLength: mat.weldingLength ?? 0,
              weldingHours: mat.weldingHours ?? 0,
              grindingHours: mat.grindingHours ?? 0,
              strainingHours: mat.strainingHours ?? 0,
              rollingHours: mat.rollingHours ?? 0,
              drillingHours: mat.drillingHours ?? 0,
            },
          });
          incomingIds.add(created.id);
        }
      }

      // Delete materials not in incoming set
      const toDelete = [...existingIds].filter((id) => !incomingIds.has(id));
      if (toDelete.length > 0) {
        await tx.materialItem.deleteMany({
          where: { id: { in: toDelete } },
        });
      }
    }

    // Upsert cost lines
    if (body.costLines) {
      const existingLines = await tx.costLine.findMany({
        where: { jobId },
        select: { id: true },
      });
      const existingIds = new Set(existingLines.map((l) => l.id));
      const incomingIds = new Set<string>();

      for (const line of body.costLines) {
        if (line.id && existingIds.has(line.id)) {
          incomingIds.add(line.id);
          await tx.costLine.update({
            where: { id: line.id },
            data: {
              sortOrder: line.sortOrder,
              section: line.section,
              category: line.category,
              lineKey: line.lineKey,
              label: line.label,
              quantity: line.quantity,
              rate: line.rate,
              unit: line.unit,
              autoLinked: line.autoLinked,
              isCorrection: line.isCorrection,
            },
          });
        } else {
          const created = await tx.costLine.create({
            data: {
              jobId,
              sortOrder: line.sortOrder ?? 0,
              section: line.section,
              category: line.category,
              lineKey: line.lineKey,
              label: line.label,
              quantity: line.quantity ?? 0,
              rate: line.rate ?? 0,
              unit: line.unit ?? "st",
              autoLinked: line.autoLinked ?? false,
              isCorrection: line.isCorrection ?? false,
            },
          });
          incomingIds.add(created.id);
        }
      }

      const toDelete = [...existingIds].filter((id) => !incomingIds.has(id));
      if (toDelete.length > 0) {
        await tx.costLine.deleteMany({
          where: { id: { in: toDelete } },
        });
      }
    }

    // Return updated job
    return tx.job.findUnique({
      where: { id: jobId },
      include: {
        materials: { orderBy: { sortOrder: "asc" } },
        costLines: { orderBy: { sortOrder: "asc" } },
      },
    });
  });

  return NextResponse.json(result);
}

// DELETE /api/estimates/[id]/jobs/[jobId]
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; jobId: string }> }
) {
  const { jobId } = await params;
  await prisma.job.delete({ where: { id: jobId } });
  return NextResponse.json({ ok: true });
}
