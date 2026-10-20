import Link from "next/link";
import type { ReactNode } from "react";

export function Card({
  title,
  children,
  className = "",
  accent = false,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
  /** Draws a brand gradient bar across the top — use to spotlight key cards. */
  accent?: boolean;
}) {
  return (
    <section
      className={`group relative overflow-hidden rounded-2xl border border-line bg-surface p-6 shadow-card transition duration-300 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card-hover ${className}`}
    >
      {accent && (
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-1 bg-brand-gradient"
        />
      )}
      {title && (
        <h3 className="mb-3 text-lg font-semibold tracking-tight text-ink">
          {title}
        </h3>
      )}
      {children}
    </section>
  );
}

export function Badge({
  children,
  tone = "accent",
}: {
  children: ReactNode;
  tone?: "accent" | "neutral" | "warn" | "verified";
}) {
  const tones: Record<string, string> = {
    accent: "bg-brand-50 text-brand-700 ring-brand-500/25",
    neutral: "bg-slate-100 text-slate-600 ring-slate-400/25",
    warn: "bg-amber-50 text-amber-700 ring-amber-500/25",
    verified: "bg-accent2-50 text-accent2-700 ring-accent2-500/25",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function ExtLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-brand-700 underline decoration-brand-300 underline-offset-2 transition-colors hover:text-accent2-600 hover:decoration-accent2-400"
    >
      {children}
    </a>
  );
}

export function PageHeader({
  eyebrow,
  title,
  lede,
}: {
  eyebrow?: string;
  title: string;
  lede?: string;
}) {
  return (
    <div className="mb-10 animate-fade-up">
      {eyebrow && (
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-brand-600">
          {eyebrow}
        </p>
      )}
      <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-[2.6rem] sm:leading-[1.1]">
        {title}
      </h1>
      <div className="rule-gradient mt-4" aria-hidden />
      {lede && (
        <p className="mt-4 max-w-3xl text-lg leading-relaxed text-subink">
          {lede}
        </p>
      )}
    </div>
  );
}

export function LinkButton({
  href,
  children,
  primary = false,
}: {
  href: string;
  children: ReactNode;
  primary?: boolean;
}) {
  const base =
    "inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50 focus-visible:ring-offset-2";
  const cls = primary
    ? "bg-brand-gradient text-white shadow-glow hover:brightness-[1.06] hover:shadow-card-hover"
    : "border border-line bg-surface text-subink shadow-sm hover:-translate-y-0.5 hover:border-brand-300 hover:text-brand-700 hover:shadow-card";
  const external = href.startsWith("http");
  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={`${base} ${cls}`}>
      {children}
    </a>
  ) : (
    <Link href={href} className={`${base} ${cls}`}>
      {children}
    </Link>
  );
}

export function CodeBlock({ children }: { children: string }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-ink/60 bg-[#0b1220] shadow-card">
      <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" aria-hidden />
        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" aria-hidden />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" aria-hidden />
      </div>
      <pre className="overflow-x-auto p-4 text-sm leading-relaxed text-slate-100">
        <code>{children}</code>
      </pre>
    </div>
  );
}
