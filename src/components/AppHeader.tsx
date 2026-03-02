import Link from "next/link";

export function AppHeader() {
  return (
    <header className="bg-primary text-white no-print">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Metalworks Estimator
        </Link>
        <nav className="flex gap-4 text-sm">
          <Link href="/" className="hover:text-blue-200 transition-colors">
            Sākums
          </Link>
          <Link href="/settings" className="hover:text-blue-200 transition-colors">
            Iestatījumi
          </Link>
        </nav>
      </div>
    </header>
  );
}
