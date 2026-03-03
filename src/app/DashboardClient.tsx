"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { EstimateListItem } from "@/lib/types";

export function DashboardClient({ estimates }: { estimates: EstimateListItem[] }) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);

  async function createEstimate() {
    setCreating(true);
    try {
      const res = await fetch("/api/estimates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      router.push(`/estimates/${data.id}`);
    } finally {
      setCreating(false);
    }
  }

  async function deleteEstimate(id: string) {
    if (!confirm("Vai tiešām dzēst šo tāmi?")) return;
    await fetch(`/api/estimates/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Tāmes</h1>
        <button
          onClick={createEstimate}
          disabled={creating}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-light disabled:opacity-50"
        >
          {creating ? "Veido..." : "+ Jauna tāme"}
        </button>
      </div>

      {estimates.length === 0 ? (
        <div className="text-center py-16 text-muted">
          <p className="text-lg mb-2">Nav nevienas tāmes</p>
          <p className="text-sm">Nospiediet &quot;+ Jauna tāme&quot; lai sāktu</p>
        </div>
      ) : (
        <div className="space-y-2">
          {estimates.map((est) => (
            <div
              key={est.id}
              className="flex items-center justify-between p-4 bg-card border border-border rounded-lg hover:border-primary/30 transition-colors"
            >
              <Link href={`/estimates/${est.id}`} className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{est.projectName}</h3>
                <div className="flex gap-3 text-xs text-muted mt-1">
                  {est.clientName && <span>{est.clientName}</span>}
                  <span>{est.jobCount} darb{est.jobCount === 1 ? "s" : "i"}</span>
                  <span>{new Date(est.updatedAt).toLocaleDateString("lv-LV")}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase ${
                    est.status === "draft" ? "bg-gray-100 text-gray-600" :
                    est.status === "sent" ? "bg-blue-100 text-blue-700" :
                    est.status === "accepted" ? "bg-green-100 text-green-700" :
                    "bg-red-100 text-red-700"
                  }`}>
                    {est.status === "draft" ? "Melnraksts" :
                     est.status === "sent" ? "Nosūtīts" :
                     est.status === "accepted" ? "Apstiprināts" : "Noraidīts"}
                  </span>
                </div>
              </Link>
              <button
                onClick={() => deleteEstimate(est.id)}
                className="ml-4 text-sm text-muted hover:text-danger"
                title="Dzēst"
              >
                Dzēst
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
