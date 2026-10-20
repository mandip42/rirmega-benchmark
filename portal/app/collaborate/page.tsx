import { Card, PageHeader, ExtLink, LinkButton } from "@/components/ui";
import { links, openQuestions, dataset } from "@/lib/facts";

export default function CollaboratePage() {
  return (
    <>
      <PageHeader
        eyebrow="Academic collaboration"
        title="For university labs"
        lede="What is verifiably true about RIR-Mega, which questions are open, which independent evaluations would help most, and how to run a baseline in minutes — without promotional language."
      />

      <div className="mb-8 grid gap-6 md:grid-cols-2">
        <Card title="1. What is verifiable about RIR-Mega">
          <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
            <li>
              A published, openly licensed RIR corpus (
              <ExtLink href={links.dataset}>{dataset.hfRepo}</ExtLink>,{" "}
              {dataset.license}) with a versioned acoustic-metadata schema.
            </li>
            <li>
              Documented parameter-estimation baselines and tooling (
              <ExtLink href={links.repo}>repo</ExtLink>,{" "}
              <ExtLink href={links.paper}>paper</ExtLink>).
            </li>
            <li>
              A paired clean↔reverberant ASR-robustness pipeline (
              <ExtLink href={links.whisperBench}>whisper-rirmega-bench</ExtLink>).
            </li>
          </ul>
          <p className="mt-3 text-xs text-slate-500">
            No superlatives are claimed here. Novelty assessment is left to peer
            review and to the independent evaluations below.
          </p>
        </Card>
        <Card title="2. Open benchmark questions">
          <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
            {openQuestions.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="mb-8 grid gap-6 md:grid-cols-2">
        <Card title="3. Most valuable independent evaluations">
          <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
            <li>
              Recompute the published metadata metrics from the raw waveforms and
              report agreement (Track A) — a direct validity check.
            </li>
            <li>
              Measure the synthetic-to-real gap against ACE/REVERB (Track B) using
              your licensed access.
            </li>
            <li>
              Quantify ASR degradation and dereverberation recovery on your own
              speech test set (Track C).
            </li>
          </ul>
        </Card>
        <Card title="4. Reproduce a baseline in 5–15 minutes">
          <p className="text-sm text-slate-600">
            The quickstart runs on shipped fixtures with no dataset download and no
            network. Scale up to the real dataset when ready.
          </p>
          <div className="mt-3">
            <LinkButton href="/reproducibility" primary>
              Go to the quickstart
            </LinkButton>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card title="5. Propose a study or share results">
          <p className="text-sm text-slate-600">
            Use GitHub{" "}
            <ExtLink href={`${links.benchmarkRepo}/discussions`}>Discussions</ExtLink>{" "}
            to propose a study, or submit results via the{" "}
            <a href="/participate" className="text-accent underline">
              PR workflow
            </a>
            . For direct contact, see{" "}
            <ExtLink href={links.linkedin}>LinkedIn</ExtLink> or the{" "}
            <ExtLink href={links.authorSite}>author website</ExtLink>.
          </p>
        </Card>
        <Card title="6. Cite correctly">
          <p className="text-sm text-slate-600">
            Verified BibTeX, the Zenodo DOI, licenses and versions are on the{" "}
            <a href="/cite" className="text-accent underline">
              Cite
            </a>{" "}
            page.
          </p>
        </Card>
      </div>

      <div className="mt-10">
        <LinkButton href="/research-overview.md">
          Download the one-page research overview (Markdown)
        </LinkButton>
      </div>
    </>
  );
}
