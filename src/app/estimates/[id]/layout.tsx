import { EstimateTabs } from "@/components/EstimateTabs";
import { EstimateProvider } from "@/components/EstimateProvider";

export default async function EstimateLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <EstimateProvider estimateId={id}>
      <EstimateTabs estimateId={id} />
      {children}
    </EstimateProvider>
  );
}
