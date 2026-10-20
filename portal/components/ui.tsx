import Link from "next/link";
import type { ReactNode } from "react";

export function Card({
  title,
  children,
  className = "",
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-xl border border-slate-200 bg-white p-6 shadow-sm ${className}`}
    >
      {title && <h3 className="mb-3 text-lg font-semibold text-ink">{title}</h3>}
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
    accent: "bg-teal-50 text-teal-700 ring-teal-600/20",
    neutral: "bg-slate-100 text-slate-600 ring-slate-500/20",
    warn: "bg-amber-50 text-amber-700 ring-amber-600/20",
    verified: "bg-indigo-50 text-indigo-700 ring-indigo-600/20",
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
      className="text-accent underline underline-offset-2 hover:text-accent2"
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
    <div className="mb-8">
      {eyebrow && (
        <p className="mb-1 text-sm font-medium uppercase tracking-wide text-accent">
          {eyebrow}
        </p>
      )}
      <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
        {title}
      </h1>
      {lede && <p className="mt-3 max-w-3xl text-lg text-slate-600">{lede}</p>}
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
    "inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium transition";
  const cls = primary
    ? "bg-accent text-white hover:bg-teal-700"
    : "border border-slate-300 text-slate-700 hover:border-accent hover:text-accent";
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
    <pre className="overflow-x-auto rounded-lg border border-slate-200 bg-slate-900 p-4 text-sm leading-relaxed text-slate-100">
      <code>{children}</code>
    </pre>
  );
}
