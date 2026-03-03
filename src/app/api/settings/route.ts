import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/settings - get all default rates and metal densities
export async function GET() {
  const [rates, densities] = await Promise.all([
    prisma.defaultRate.findMany({ orderBy: { lineKey: "asc" } }),
    prisma.metalDensity.findMany({ orderBy: { name: "asc" } }),
  ]);

  return NextResponse.json({ rates, densities });
}

// PUT /api/settings - update rates and densities
export async function PUT(request: Request) {
  const body = await request.json();

  if (body.rates) {
    for (const rate of body.rates) {
      await prisma.defaultRate.update({
        where: { id: rate.id },
        data: { rate: rate.rate, label: rate.label, unit: rate.unit },
      });
    }
  }

  if (body.densities) {
    for (const density of body.densities) {
      await prisma.metalDensity.update({
        where: { id: density.id },
        data: { density: density.density, nameLv: density.nameLv },
      });
    }
  }

  return NextResponse.json({ ok: true });
}
