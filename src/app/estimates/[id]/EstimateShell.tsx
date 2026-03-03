"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

interface JobMeta {
  id: string;
  name: string;
  sortOrder: number;
  jobType: string;
}

interface Props {
  estimateId: string;
  projectName: string;
  jobs: JobMeta[];
  children: React.ReactNode;
}

export function EstimateShell({ estimateId, projectName, jobs, children }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [adding, setAdding] = useState(false);

  async function addJob() {
    setAdding(true);
    try {
      const res = await fetch(`/api/estimates/${estimateId}/jobs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Jauns darbs" }),
      });
      const job = await res.json();
      router.push(`/estimates/${estimateId}/jobs/${job.id}/materials`);
      router.refresh();
    } finally {
      setAdding(false);
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-muted hover:text-foreground text-sm">
            &larr; Projekti
          </Link>
          <h1 className="text-xl font-bold">{projectName}</h1>
        </div>
        <Link
          href={`/estimates/${estimateId}/proposal`}
          className={`px-3 py-1.5 text-sm rounded ${
            pathname.includes("/proposal")
              ? "bg-primary text-white"
              : "bg-gray-100 hover:bg-gray-200"
          }`}
        >
          Piedāvājums
        </Link>
      </div>

      {/* Job tabs */}
      <div className="flex flex-wrap items-center gap-1 mb-4 border-b border-border pb-2">
        {jobs.map((job) => {
          const jobBase = `/estimates/${estimateId}/jobs/${job.id}`;
          const isActive = pathname.startsWith(jobBase);
          return (
            <div key={job.id} className="flex items-center">
              <div className={`rounded-t-lg overflow-hidden ${isActive ? "bg-primary/10 border border-b-0 border-primary/30" : ""}`}>
                <div className="flex text-xs">
                  <Link
                    href={`${jobBase}/materials`}
                    className={`px-2 py-1.5 ${
                      pathname.includes("/materials") && isActive
                        ? "bg-primary text-white"
                        : isActive ? "hover:bg-primary/20" : "hover:bg-gray-100"
                    }`}
                  >
                    {job.name}
                  </Link>
                  {job.jobType === "full" && isActive && (
                    <>
                      <Link
                        href={`${jobBase}/production`}
                        className={`px-2 py-1.5 border-l border-gray-200 ${
                          pathname.includes("/production") ? "bg-primary text-white" : "hover:bg-primary/20"
                        }`}
                      >
                        Ražošana
                      </Link>
                      <Link
                        href={`${jobBase}/delivery`}
                        className={`px-2 py-1.5 border-l border-gray-200 ${
                          pathname.includes("/delivery") ? "bg-primary text-white" : "hover:bg-primary/20"
                        }`}
                      >
                        Piegāde
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <button
          onClick={addJob}
          disabled={adding}
          className="px-2 py-1 text-xs text-muted hover:text-primary border border-dashed border-gray-300 rounded hover:border-primary"
        >
          + Darbs
        </button>
      </div>

      {/* Content */}
      {children}
    </div>
  );
}
