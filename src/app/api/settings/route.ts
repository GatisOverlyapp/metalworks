import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/settings - get all reference data
export async function GET() {
  const [densities, hourlyRates, transportRates] = await Promise.all([
    prisma.metalDensity.findMany({ orderBy: { material: "asc" } }),
    prisma.hourlyRate.findMany({ orderBy: { category: "asc" } }),
    prisma.transportRate.findMany({ orderBy: { name: "asc" } }),
  ]);

  return NextResponse.json({ densities, hourlyRates, transportRates });
}

// PUT /api/settings - update reference data
export async function PUT(request: NextRequest) {
  const body = await request.json();

  if (body.densities) {
    for (const d of body.densities) {
      await prisma.metalDensity.update({
        where: { id: d.id },
        data: { density: d.density, label: d.label },
      });
    }
  }

  if (body.hourlyRates) {
    for (const r of body.hourlyRates) {
      await prisma.hourlyRate.update({
        where: { id: r.id },
        data: { rate: r.rate, label: r.label },
      });
    }
  }

  if (body.transportRates) {
    for (const t of body.transportRates) {
      await prisma.transportRate.update({
        where: { id: t.id },
        data: { rate: t.rate, label: t.label, unit: t.unit },
      });
    }
  }

  return NextResponse.json({ success: true });
}
