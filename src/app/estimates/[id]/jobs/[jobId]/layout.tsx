import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { JobProvider } from "@/components/JobProvider";
import { JobHeaderClient } from "./JobHeaderClient";
import type { FullJob } from "@/lib/types";

export default async function JobLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string; jobId: string }>;
}) {
  const { jobId } = await params;

  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: {
      materials: { orderBy: { sortOrder: "asc" } },
      costLines: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!job) notFound();

  const fullJob: FullJob = {
    id: job.id,
    estimateId: job.estimateId,
    name: job.name,
    description: job.description,
    quantity: job.quantity,
    sortOrder: job.sortOrder,
    jobType: job.jobType,
    productionDiscount: job.productionDiscount,
    deliveryDiscount: job.deliveryDiscount,
    materials: job.materials,
    costLines: job.costLines,
  };

  return (
    <JobProvider initialJob={fullJob}>
      <JobHeaderClient />
      {children}
    </JobProvider>
  );
}
