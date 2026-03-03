import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { EstimateShell } from "./EstimateShell";

export default async function EstimateLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const estimate = await prisma.estimate.findUnique({
    where: { id },
    include: {
      jobs: {
        orderBy: { sortOrder: "asc" },
        select: { id: true, name: true, sortOrder: true, jobType: true },
      },
    },
  });

  if (!estimate) notFound();

  return (
    <EstimateShell
      estimateId={estimate.id}
      projectName={estimate.projectName}
      jobs={estimate.jobs}
    >
      {children}
    </EstimateShell>
  );
}
