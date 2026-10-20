import { Card, Badge, ExtLink, LinkButton } from "@/components/ui";
import { links, dataset, evalDataset, tracks, VERIFIED_ON } from "@/lib/facts";

export default function OverviewPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative mb-12 overflow-hidden rounded-3xl border border-line bg-hero-grid bg-surface px-6 py-12 shadow-card sm:px-10 sm:py-16 animate-fade-up">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">
          Independent benchmark &amp; evaluation portal
        </p>
        <h1 className="max-w-4xl text-3xl font-bold tracking-tight text-ink sm:text-5xl sm:leading-[1.08]">
          RIR-Mega: <span className="gradient-text">reproduce, evaluate,</span>{" "}
          challenge, extend
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-relaxed text-subink">
          A community entry point for independently benchmarking the RIR-Mega
          room-impulse-response (RIR) ecosystem. Everything here is reproducible,
          and every number traces to a committed evaluation artifact or to the
          datasets&apos; own published metadata.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <LinkButton href="/reproducibility" primary>
            5-minute quickstart →
          </LinkButton>
          <LinkButton href="/explorer">Explore the data</LinkButton>
          <LinkButton href="/participate">Submit a result</LinkButton>
          <LinkButton href={links.paper}>Read the paper</LinkButton>
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-3">
        <Card title="What RIR-Mega is" accent>
          <p className="text-sm leading-relaxed text-subink">
            RIR-Mega is an open corpus of room impulse responses with acoustic
            metadata (reverberation time, clarity, direct-to-reverberant ratio,
            and more), plus baselines and tooling for estimating these
            quantities. It is designed for research on reverberation,
            dereverberation and reverberation-robust speech.
          </p>
        </Card>
        <Card title="Scientific questions it addresses" accent>
          <ul className="list-disc space-y-1 pl-5 text-sm text-subink">
            <li>Can acoustic descriptors be estimated reliably from RIRs?</li>
            <li>How do simulated RIRs compare to measured ones?</li>
            <li>How does reverberation degrade downstream ASR?</li>
          </ul>
        </Card>
        <Card title="Known limitations" accent>
          <ul className="list-disc space-y-1 pl-5 text-sm text-subink">
            <li>The corpus is largely synthetic; synthetic-to-real gaps exist.</li>
            <li>
              Some published metadata fields are not populated for every sample
              (see the Explorer for exactly which fields carry data).
            </li>
            <li>Licensed CC-BY-NC-4.0 (non-commercial).</li>
          </ul>
        </Card>
      </div>

      <div className="mt-14 mb-5">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">
          How independent researchers can evaluate it
        </h2>
        <div className="rule-gradient mt-3" aria-hidden />
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {tracks.map((t) => (
          <Card key={t.id} title={`Track ${t.id} — ${t.name}`}>
            <p className="text-sm leading-relaxed text-subink">{t.summary}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {t.metrics.map((m) => (
                <Badge key={m} tone="neutral">
                  {m}
                </Badge>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-14 mb-5">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">
          Resources{" "}
          <span className="text-base font-normal text-slate-500">
            (all verified {VERIFIED_ON})
          </span>
        </h2>
        <div className="rule-gradient mt-3" aria-hidden />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <h3 className="mb-2 font-semibold text-ink">Datasets</h3>
          <ul className="space-y-1.5 text-sm text-subink">
            <li>
              <ExtLink href={links.dataset}>{dataset.hfRepo}</ExtLink> —{" "}
              {dataset.rows.total.toLocaleString()} rows, revision{" "}
              {dataset.latestRevision}, {dataset.license}
            </li>
            <li>
              <ExtLink href={links.evalDataset}>{evalDataset.hfRepo}</ExtLink> —{" "}
              {evalDataset.rows.total.toLocaleString()} rows (ASR pairing manifest)
            </li>
          </ul>
        </Card>
        <Card>
          <h3 className="mb-2 font-semibold text-ink">Code &amp; papers</h3>
          <ul className="space-y-1.5 text-sm text-subink">
            <li>
              <ExtLink href={links.repo}>mandip42/rirmega</ExtLink> — main package
            </li>
            <li>
              <ExtLink href={links.whisperBench}>whisper-rirmega-bench</ExtLink> —
              ASR robustness pipeline
            </li>
            <li>
              <ExtLink href={links.paper}>arXiv:2510.18917</ExtLink> — main paper
            </li>
            <li>
              <ExtLink href={links.speechPaper}>arXiv:2601.19949</ExtLink> —
              RIR-Mega-Speech paper
            </li>
            <li>
              <ExtLink href={links.zenodo}>Zenodo DOI 10.5281/zenodo.17387402</ExtLink>
            </li>
          </ul>
        </Card>
      </div>

      <p className="mt-12 rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100/40 p-5 text-sm leading-relaxed text-amber-900 shadow-sm">
        <strong>Integrity note.</strong> This is an independent evaluation portal.
        It presents published, independently reproduced and newly contributed
        results as clearly separate categories, and never implies endorsement of a
        result simply because it passes automated validation.
      </p>
    </>
  );
}
