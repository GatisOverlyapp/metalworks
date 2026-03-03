import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";

export default async function EstimatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const estimate = await prisma.estimate.findUnique({
    where: { id },
    include: {
      jobs: {
        orderBy: { sortOrder: "asc" },
        take: 1,
        select: { id: true },
      },
    },
  });

  if (!estimate) notFound();

  // Redirect to first job's materials page
  if (estimate.jobs.length > 0) {
    redirect(`/estimates/${id}/jobs/${estimate.jobs[0].id}/materials`);
  }

  return (
    <div className="text-center py-12 text-muted">
      <p>Nav darbu. Pievienojiet pirmo darbu.</p>
    </div>
  );
}
