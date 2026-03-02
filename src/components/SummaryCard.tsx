interface SummaryCardProps {
  label: string;
  value: string;
  sublabel?: string;
  highlight?: boolean;
}

export function SummaryCard({ label, value, sublabel, highlight }: SummaryCardProps) {
  return (
    <div className={`rounded-lg border p-4 ${highlight ? "bg-primary text-white border-primary" : "bg-card border-border"}`}>
      <div className={`text-xs font-medium uppercase tracking-wider ${highlight ? "text-blue-200" : "text-muted"}`}>
        {label}
      </div>
      <div className="text-2xl font-bold mt-1">{value}</div>
      {sublabel && (
        <div className={`text-xs mt-1 ${highlight ? "text-blue-200" : "text-muted"}`}>
          {sublabel}
        </div>
      )}
    </div>
  );
}
