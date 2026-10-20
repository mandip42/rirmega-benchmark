import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "RIR-Mega Independent Benchmark & Evaluation Portal",
  description:
    "Reproduce, evaluate, challenge and extend the RIR-Mega room-impulse-response ecosystem. Interactive benchmark explorer, reproducibility hub, and an open, PR-based result-submission workflow.",
  metadataBase: new URL("https://rirmega-benchmark.vercel.app"),
  openGraph: {
    title: "RIR-Mega Independent Benchmark & Evaluation Portal",
    description:
      "An independent, reproducible benchmark portal for the RIR-Mega room-impulse-response ecosystem.",
    type: "website",
  },
};

const NAV = [
  { href: "/", label: "Overview" },
  { href: "/explorer", label: "Explorer" },
  { href: "/reproducibility", label: "Reproducibility" },
  { href: "/results", label: "Results" },
  { href: "/participate", label: "Participate" },
  { href: "/collaborate", label: "Collaborate" },
  { href: "/cite", label: "Cite" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded focus:bg-ink focus:px-3 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        <header className="border-b border-slate-200 bg-white/80 backdrop-blur sticky top-0 z-40">
          <nav
            aria-label="Primary"
            className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3"
          >
            <Link href="/" className="font-semibold tracking-tight text-ink">
              RIR-Mega <span className="text-accent">Benchmark</span>
            </Link>
            <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
              {NAV.map((n) => (
                <li key={n.href}>
                  <Link
                    href={n.href}
                    className="text-slate-600 hover:text-accent"
                  >
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </header>
        <main id="main" className="mx-auto max-w-6xl px-4 py-10">
          {children}
        </main>
        <footer className="border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-slate-500">
            <p>
              Independent, community-maintained benchmark portal for the RIR-Mega
              ecosystem. Research resources &copy; their respective authors.
            </p>
            <p className="mt-2">
              Datasets are licensed CC-BY-NC-4.0. This portal does not imply
              endorsement of any submitted result.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
