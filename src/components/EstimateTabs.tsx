"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "materials", label: "Materiāli" },
  { href: "production", label: "Ražošana" },
  { href: "delivery", label: "Piegāde" },
  { href: "proposal", label: "Piedāvājums" },
];

export function EstimateTabs({ estimateId }: { estimateId: string }) {
  const pathname = usePathname();

  return (
    <div className="border-b border-border mb-6 no-print">
      <nav className="flex gap-0 -mb-px">
        {tabs.map((tab) => {
          const href = `/estimates/${estimateId}/${tab.href}`;
          const isActive = pathname === href;
          return (
            <Link
              key={tab.href}
              href={href}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted hover:text-foreground hover:border-gray-300"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
