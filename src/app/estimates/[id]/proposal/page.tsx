import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ProposalView } from "./ProposalView";

export default async function ProposalPage({
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
        include: {
          materials: { orderBy: { sortOrder: "asc" } },
          costLines: { orderBy: { sortOrder: "asc" } },
        },
      },
    },
  });

  if (!estimate) notFound();

  return <ProposalView estimate={estimate} />;
}
