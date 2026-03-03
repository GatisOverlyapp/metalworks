import { prisma } from "@/lib/prisma";
import { DashboardClient } from "./DashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
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

  return <DashboardClient estimates={items} />;
}
