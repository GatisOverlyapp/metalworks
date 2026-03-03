import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Metalworks Estimator",
  description: "Metālapstrādes izmaksu kalkulators",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="lv">
      <body className={`${geistSans.variable} antialiased`}>
        <header className="bg-card border-b border-border no-print">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="font-bold text-primary text-lg">
              Metalworks Estimator
            </Link>
            <Link href="/settings" className="text-sm text-muted hover:text-foreground">
              Iestatījumi
            </Link>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}
