import { Card, Badge, ExtLink, PageHeader, LinkButton } from "@/components/ui";
import { links, dataset, evalDataset, tracks, VERIFIED_ON } from "@/lib/facts";

export default function OverviewPage() {
  return (
    <>
      <PageHeader
        eyebrow="Independent benchmark & evaluation portal"
        title="RIR-Mega: reproduce, evaluate, challenge, extend"
        lede="A community entry point for independently benchmarking the RIR-Mega room-impulse-response (RIR) ecosystem. Everything here is reproducible, and every number traces to a committed evaluation artifact or to the datasets' own published metadata."
      />

      <div className="mb-10 flex flex-wrap gap-3">
        <LinkButton href="/reproducibility" primary>
          5-minute quickstart
        </LinkButton>
        <LinkButton href="/explorer">Explore the data</LinkButton>
        <LinkButton href="/participate">Submit a result</LinkButton>
        <LinkButton href={links.paper}>Read the paper</LinkButton>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card title="What RIR-Mega is">
          <p className="text-sm leading-relaxed text-slate-600">
            RIR-Mega is an open corpus of room impulse responses with acoustic
            metadata (reverberation time, clarity, direct-to-reverberant ratio,
            and more), plus baselines and tooling for estimating these
            quantities. It is designed for research on reverberation,
            dereverberation and reverberation-robust speech.
          </p>
        </Card>
        <Card title="Scientific questions it addresses">
          <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
            <li>Can acoustic descriptors be estimated reliably from RIRs?</li>
            <li>How do simulated RIRs compare to measured ones?</li>
            <li>How does reverberation degrade downstream ASR?</li>
          </ul>
        </Card>
        <Card title="Known limitations">
          <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
            <li>The corpus is largely synthetic; synthetic-to-real gaps exist.</li>
            <li>
              Some published metadata fields are not populated for every sample
              (see the Explorer for exactly which fields carry data).
            </li>
            <li>Licensed CC-BY-NC-4.0 (non-commercial).</li>
          </ul>
        </Card>
      </div>

      <h2 className="mb-4 mt-12 text-2xl font-semibold text-ink">
        How independent researchers can evaluate it
      </h2>
      <div className="grid gap-6 md:grid-cols-3">
        {tracks.map((t) => (
          <Card key={t.id} title={`Track ${t.id} — ${t.name}`}>
            <p className="text-sm leading-relaxed text-slate-600">{t.summary}</p>
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

      <h2 className="mb-4 mt-12 text-2xl font-semibold text-ink">
        Resources (all verified {VERIFIED_ON})
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <h3 className="mb-2 font-semibold">Datasets</h3>
          <ul className="space-y-1.5 text-sm">
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
          <h3 className="mb-2 font-semibold">Code & papers</h3>
          <ul className="space-y-1.5 text-sm">
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

      <p className="mt-10 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        <strong>Integrity note.</strong> This is an independent evaluation portal.
        It presents published, independently reproduced and newly contributed
        results as clearly separate categories, and never implies endorsement of a
        result simply because it passes automated validation.
      </p>
    </>
  );
}
