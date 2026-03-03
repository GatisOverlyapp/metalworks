"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface DefaultRate {
  id: string;
  lineKey: string;
  label: string;
  rate: number;
  unit: string;
}

interface MetalDensity {
  id: string;
  name: string;
  nameLv: string;
  density: number;
}

export default function SettingsPage() {
  const [rates, setRates] = useState<DefaultRate[]>([]);
  const [densities, setDensities] = useState<MetalDensity[]>([]);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        setRates(data.rates);
        setDensities(data.densities);
        setLoaded(true);
      });
  }, []);

  async function save() {
    setSaving(true);
    try {
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rates, densities }),
      });
    } finally {
      setSaving(false);
    }
  }

  if (!loaded) return <div className="text-center py-8 text-muted">Ielādē...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-muted hover:text-foreground text-sm">&larr; Projekti</Link>
          <h1 className="text-2xl font-bold">Iestatījumi</h1>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-light disabled:opacity-50"
        >
          {saving ? "Saglabā..." : "Saglabāt"}
        </button>
      </div>

      {/* Metal densities */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Metālu blīvumi</h2>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b border-border">
              <th className="px-3 py-2 text-left">Nosaukums</th>
              <th className="px-3 py-2 text-left">Nosaukums (LV)</th>
              <th className="px-3 py-2 text-right">Blīvums (kg/m³)</th>
            </tr>
          </thead>
          <tbody>
            {densities.map((d) => (
              <tr key={d.id} className="border-b border-gray-100">
                <td className="px-3 py-1.5 text-muted">{d.name}</td>
                <td className="px-3 py-1.5">
                  <input
                    type="text"
                    value={d.nameLv}
                    onChange={(e) => setDensities((prev) => prev.map((x) => x.id === d.id ? { ...x, nameLv: e.target.value } : x))}
                    className="w-full px-2 py-1 border border-border rounded"
                  />
                </td>
                <td className="px-3 py-1.5">
                  <input
                    type="number"
                    value={d.density}
                    onChange={(e) => setDensities((prev) => prev.map((x) => x.id === d.id ? { ...x, density: parseFloat(e.target.value) || 0 } : x))}
                    className="w-full px-2 py-1 border border-border rounded text-right"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Default rates */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Noklusējuma likmes</h2>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b border-border">
              <th className="px-3 py-2 text-left">Atslēga</th>
              <th className="px-3 py-2 text-left">Nosaukums</th>
              <th className="px-3 py-2 text-right">Likme</th>
              <th className="px-3 py-2 text-left">Vienība</th>
            </tr>
          </thead>
          <tbody>
            {rates.map((r) => (
              <tr key={r.id} className="border-b border-gray-100">
                <td className="px-3 py-1.5 text-muted text-xs font-mono">{r.lineKey}</td>
                <td className="px-3 py-1.5">
                  <input
                    type="text"
                    value={r.label}
                    onChange={(e) => setRates((prev) => prev.map((x) => x.id === r.id ? { ...x, label: e.target.value } : x))}
                    className="w-full px-2 py-1 border border-border rounded"
                  />
                </td>
                <td className="px-3 py-1.5">
                  <input
                    type="number"
                    step="any"
                    value={r.rate}
                    onChange={(e) => setRates((prev) => prev.map((x) => x.id === r.id ? { ...x, rate: parseFloat(e.target.value) || 0 } : x))}
                    className="w-full px-2 py-1 border border-border rounded text-right"
                  />
                </td>
                <td className="px-3 py-1.5">
                  <input
                    type="text"
                    value={r.unit}
                    onChange={(e) => setRates((prev) => prev.map((x) => x.id === r.id ? { ...x, unit: e.target.value } : x))}
                    className="w-24 px-2 py-1 border border-border rounded"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
