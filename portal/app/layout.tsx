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
          className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-ink focus:px-3 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        <header className="sticky top-0 z-40 border-b border-line bg-surface/80 backdrop-blur-md">
          <span aria-hidden className="block h-0.5 w-full bg-brand-gradient" />
          <nav
            aria-label="Primary"
            className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3.5"
          >
            <Link
              href="/"
              className="flex items-center gap-2 font-semibold tracking-tight text-ink"
            >
              <span
                aria-hidden
                className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-brand-gradient text-sm font-bold text-white shadow-glow"
              >
                R
              </span>
              RIR-Mega <span className="gradient-text">Benchmark</span>
            </Link>
            <ul className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
              {NAV.map((n) => (
                <li key={n.href}>
                  <Link
                    href={n.href}
                    className="font-medium text-subink underline-offset-[6px] transition-colors hover:text-brand-700 hover:underline hover:decoration-brand-400 hover:decoration-2"
                  >
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </header>
        <main id="main" className="mx-auto max-w-6xl px-4 py-12">
          {children}
        </main>
        <footer className="mt-8 border-t border-line bg-surface/70">
          <span aria-hidden className="block h-0.5 w-full bg-brand-gradient opacity-60" />
          <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-slate-500">
            <p className="flex items-center gap-2 font-semibold text-ink">
              <span
                aria-hidden
                className="inline-flex h-5 w-5 items-center justify-center rounded bg-brand-gradient text-[0.65rem] font-bold text-white"
              >
                R
              </span>
              RIR-Mega Benchmark Portal
            </p>
            <p className="mt-3 max-w-2xl leading-relaxed">
              Independent, community-maintained benchmark portal for the RIR-Mega
              ecosystem. Research resources &copy; their respective authors.
            </p>
            <p className="mt-2 max-w-2xl leading-relaxed">
              Datasets are licensed CC-BY-NC-4.0. This portal does not imply
              endorsement of any submitted result.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
