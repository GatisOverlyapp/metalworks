"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { formatEUR } from "@/lib/format";

interface EstimateListItem {
  id: string;
  projectName: string;
  clientName: string;
  status: string;
  totalWithVat: number;
  createdAt: string;
  updatedAt: string;
}

const statusLabels: Record<string, string> = {
  draft: "Melnraksts",
  sent: "Nosūtīts",
  accepted: "Apstiprināts",
  rejected: "Noraidīts",
};

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  sent: "bg-blue-100 text-blue-700",
  accepted: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

export default function Dashboard() {
  const [estimates, setEstimates] = useState<EstimateListItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/estimates")
      .then(r => r.json())
      .then(data => {
        setEstimates(data);
        setLoading(false);
      });
  }, []);

  const createNew = useCallback(async () => {
    const res = await fetch("/api/estimates", { method: "POST" });
    const est = await res.json();
    router.push(`/estimates/${est.id}/materials`);
  }, [router]);

  const deleteEstimate = useCallback(async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Vai tiešām dzēst šo tāmi?")) return;
    await fetch(`/api/estimates/${id}`, { method: "DELETE" });
    setEstimates(prev => prev.filter(est => est.id !== id));
  }, []);

  const filtered = estimates.filter(e =>
    e.projectName.toLowerCase().includes(search.toLowerCase()) ||
    e.clientName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Tāmes</h1>
        <button
          onClick={createNew}
          className="bg-primary text-white px-4 py-2 rounded font-medium hover:bg-primary-light transition-colors"
        >
          + Jauna tāme
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Meklēt pēc projekta vai klienta..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md border border-border rounded px-3 py-2 text-sm"
        />
      </div>

      {loading ? (
        <p className="text-muted">Ielādē...</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted">
          <p className="text-lg mb-2">Nav atrasta neviena tāme</p>
          <p className="text-sm">Izveidojiet jaunu tāmi, nospiežot pogu augšā</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-border">
                <th className="text-left px-4 py-2.5 font-medium text-muted">Projekts</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted">Klients</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted">Statuss</th>
                <th className="text-right px-4 py-2.5 font-medium text-muted">Summa</th>
                <th className="text-right px-4 py-2.5 font-medium text-muted">Mainīts</th>
                <th className="px-4 py-2.5 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((est) => (
                <tr
                  key={est.id}
                  onClick={() => router.push(`/estimates/${est.id}/materials`)}
                  className="border-b border-border hover:bg-blue-50/50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 font-medium">{est.projectName || "—"}</td>
                  <td className="px-4 py-3 text-muted">{est.clientName || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${statusColors[est.status] || ""}`}>
                      {statusLabels[est.status] || est.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono">{formatEUR(est.totalWithVat)}</td>
                  <td className="px-4 py-3 text-right text-muted text-xs">
                    {new Date(est.updatedAt).toLocaleDateString("lv-LV")}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={(e) => deleteEstimate(est.id, e)}
                      className="text-red-400 hover:text-danger transition-colors"
                      title="Dzēst"
                    >
                      &times;
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
