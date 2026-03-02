"use client";

import { useEffect, useState, useCallback } from "react";

interface Density { id: string; material: string; density: number; label: string }
interface HourlyRate { id: string; category: string; rate: number; label: string }
interface TransportRate { id: string; name: string; rate: number; unit: string; label: string }

export default function SettingsPage() {
  const [densities, setDensities] = useState<Density[]>([]);
  const [hourlyRates, setHourlyRates] = useState<HourlyRate[]>([]);
  const [transportRates, setTransportRates] = useState<TransportRate[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then(r => r.json())
      .then(data => {
        setDensities(data.densities);
        setHourlyRates(data.hourlyRates);
        setTransportRates(data.transportRates);
      });
  }, []);

  const save = useCallback(async () => {
    setSaving(true);
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ densities, hourlyRates, transportRates }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [densities, hourlyRates, transportRates]);

  return (
    <div className="max-w-3xl space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Iestatījumi</h1>
        <button
          onClick={save}
          disabled={saving}
          className="bg-primary text-white px-4 py-2 rounded font-medium hover:bg-primary-light transition-colors disabled:opacity-50"
        >
          {saving ? "Saglabā..." : saved ? "Saglabāts!" : "Saglabāt"}
        </button>
      </div>

      {/* Metal densities */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Metāla blīvumi (kg/m³)</h2>
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-4 py-2 font-medium text-muted">Materiāls</th>
                <th className="text-left px-4 py-2 font-medium text-muted">Nosaukums</th>
                <th className="text-right px-4 py-2 font-medium text-muted">Blīvums (kg/m³)</th>
              </tr>
            </thead>
            <tbody>
              {densities.map((d, i) => (
                <tr key={d.id} className="border-t border-border">
                  <td className="px-4 py-2 font-mono">{d.material}</td>
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={d.label}
                      onChange={(e) => {
                        const next = [...densities];
                        next[i] = { ...next[i], label: e.target.value };
                        setDensities(next);
                      }}
                      className="w-full border border-border rounded px-2 py-1"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      value={d.density}
                      onChange={(e) => {
                        const next = [...densities];
                        next[i] = { ...next[i], density: parseFloat(e.target.value) || 0 };
                        setDensities(next);
                      }}
                      className="w-full border border-border rounded px-2 py-1 text-right font-mono"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Hourly rates */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Stundu likmes (EUR/h)</h2>
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-4 py-2 font-medium text-muted">Kategorija</th>
                <th className="text-left px-4 py-2 font-medium text-muted">Nosaukums</th>
                <th className="text-right px-4 py-2 font-medium text-muted">Likme (EUR/h)</th>
              </tr>
            </thead>
            <tbody>
              {hourlyRates.map((r, i) => (
                <tr key={r.id} className="border-t border-border">
                  <td className="px-4 py-2 font-mono">{r.category}</td>
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={r.label}
                      onChange={(e) => {
                        const next = [...hourlyRates];
                        next[i] = { ...next[i], label: e.target.value };
                        setHourlyRates(next);
                      }}
                      className="w-full border border-border rounded px-2 py-1"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      step="0.01"
                      value={r.rate}
                      onChange={(e) => {
                        const next = [...hourlyRates];
                        next[i] = { ...next[i], rate: parseFloat(e.target.value) || 0 };
                        setHourlyRates(next);
                      }}
                      className="w-full border border-border rounded px-2 py-1 text-right font-mono"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Transport rates */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Transporta likmes</h2>
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-4 py-2 font-medium text-muted">Nosaukums</th>
                <th className="text-left px-4 py-2 font-medium text-muted">Mērvienība</th>
                <th className="text-right px-4 py-2 font-medium text-muted">Likme (EUR)</th>
              </tr>
            </thead>
            <tbody>
              {transportRates.map((t, i) => (
                <tr key={t.id} className="border-t border-border">
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={t.label}
                      onChange={(e) => {
                        const next = [...transportRates];
                        next[i] = { ...next[i], label: e.target.value };
                        setTransportRates(next);
                      }}
                      className="w-full border border-border rounded px-2 py-1"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={t.unit}
                      onChange={(e) => {
                        const next = [...transportRates];
                        next[i] = { ...next[i], unit: e.target.value };
                        setTransportRates(next);
                      }}
                      className="w-full border border-border rounded px-2 py-1"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      step="0.01"
                      value={t.rate}
                      onChange={(e) => {
                        const next = [...transportRates];
                        next[i] = { ...next[i], rate: parseFloat(e.target.value) || 0 };
                        setTransportRates(next);
                      }}
                      className="w-full border border-border rounded px-2 py-1 text-right font-mono"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
