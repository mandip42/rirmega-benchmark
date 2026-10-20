import { Card, Badge, PageHeader, CodeBlock, ExtLink } from "@/components/ui";
import { links, verificationTiers } from "@/lib/facts";

export default function ParticipatePage() {
  return (
    <>
      <PageHeader
        eyebrow="Research participation"
        title="Reproduce, report, contribute"
        lede="External researchers can reproduce results, report discrepancies, contribute evaluations, or propose collaborations — without contacting anyone for setup. Local runs are fully anonymous; public submissions need only enough to attribute the work, with explicit consent."
      />

      <div className="mb-8 grid gap-6 md:grid-cols-2">
        <Card title="Tell us you're using RIR-Mega">
          <p className="text-sm text-slate-600">
            Using the dataset, the Speech corpus, or the benchmark? Let us record
            it. It&apos;s a short, <strong>voluntary, consent-based</strong> form —
            share only what you choose. Each entry is a public, dated record of
            independent adoption (and a great way to get credited).
          </p>
          <p className="mt-3 text-sm">
            <ExtLink
              href={`${links.benchmarkRepo}/issues/new?template=adoption.yml`}
            >
              Share how you use it →
            </ExtLink>
          </p>
        </Card>
        <Card title="Report a discrepancy or ask a question">
          <p className="text-sm text-slate-600">
            Open a GitHub Issue with your environment, the exact command, and what
            you observed vs. expected.
          </p>
          <p className="mt-3 text-sm">
            <ExtLink href={`${links.benchmarkRepo}/issues`}>
              Open an issue →
            </ExtLink>{" "}
            ·{" "}
            <ExtLink href={`${links.benchmarkRepo}/discussions`}>
              Start a discussion →
            </ExtLink>
          </p>
        </Card>
        <Card title="Propose a collaboration">
          <p className="text-sm text-slate-600">
            See the <a href="/collaborate" className="text-accent underline">Collaborate</a>{" "}
            page for open questions and the most valuable independent evaluations,
            then reach out via GitHub Discussions or{" "}
            <ExtLink href={links.linkedin}>LinkedIn</ExtLink>.
          </p>
        </Card>
      </div>

      <h2 className="mb-3 text-2xl font-semibold text-ink">
        Submit a result (pull-request workflow)
      </h2>
      <Card className="mb-6">
        <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-600">
          <li>Run a track with <code>--out my_result.json</code>, or author a JSON by hand.</li>
          <li>
            Shape it to the{" "}
            <ExtLink href="/data/result.schema.json">result schema</ExtLink>{" "}
            (version 1.0.0). Validate locally:{" "}
            <code>rirbench validate my_result.json</code>.
          </li>
          <li>
            Add it under <code>submissions/&lt;team&gt;-&lt;date&gt;.json</code> and open a PR.
          </li>
          <li>
            GitHub Actions runs schema validation automatically. A green check
            means <em>schema-valid</em>, not endorsed.
          </li>
          <li>A maintainer reviews and assigns a verification tier (below).</li>
        </ol>
      </Card>

      <Card title="Minimal valid submission" className="mb-6">
        <CodeBlock>{`{
  "schema_version": "1.0.0",
  "submission_id": "lab-example-2026-10-19",
  "date": "2026-10-19",
  "track": "A",
  "dataset": "mandipgoswami/rirmega",
  "dataset_version": "main",
  "benchmark_version": "1.0.0",
  "split": "test",
  "method": "my-rt60-estimator",
  "sample_size": 400,
  "metrics": [
    { "name": "MAE_RT60_T20_s", "value": 0.11,
      "unit": "s", "ci95_low": 0.09, "ci95_high": 0.13,
      "ci_method": "bootstrap-1000-seed0" }
  ],
  "reproduction_command": "rirbench track-a --dir ./wavs --meta ./metadata_v2.parquet",
  "contributor": { "name": "A. Researcher", "affiliation": "Some University",
                   "consent_to_publish": true }
}`}</CodeBlock>
        <p className="mt-3 text-sm text-slate-600">
          Everything in <code>contributor</code> is optional. For a public listing,
          <code>consent_to_publish</code> must be <code>true</code>. Local,
          anonymous runs never need this block at all.
        </p>
      </Card>

      <h2 className="mb-3 text-2xl font-semibold text-ink">Verification tiers</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {verificationTiers.map((t, i) => (
          <Card key={t.id} title={t.label}>
            <Badge tone={i === 0 ? "neutral" : i === 1 ? "accent" : "verified"}>
              {t.id}
            </Badge>
            <p className="mt-2 text-sm text-slate-600">{t.desc}</p>
          </Card>
        ))}
      </div>

      <p className="mt-8 rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100/40 p-5 text-sm leading-relaxed text-amber-900 shadow-sm">
        A tier is assigned by human review, never by passing CI. Automated
        validation checks only that a submission is well-formed — it is not a
        scientific endorsement.
      </p>
    </>
  );
}
