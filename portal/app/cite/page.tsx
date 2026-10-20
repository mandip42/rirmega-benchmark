import { Card, PageHeader, CodeBlock, ExtLink, Badge } from "@/components/ui";
import { citation, links, dataset, evalDataset, VERIFIED_ON } from "@/lib/facts";

export default function CitePage() {
  return (
    <>
      <PageHeader
        eyebrow="Publications & citation"
        title="Cite the RIR-Mega resources"
        lede="Verified BibTeX, DOI, licenses and versions. If you use RIR-Mega, cite both the paper and the dataset."
      />

      <Card title="Paper (arXiv)" className="mb-6">
        <p className="mb-3 text-sm text-slate-600">
          Goswami, M. (2025). <em>RIR-Mega: A Large-Scale Room Impulse Response
          Corpus with Benchmarks for Industrial and Building Acoustics.</em>{" "}
          arXiv:2510.18917. <ExtLink href={links.paper}>{links.paper}</ExtLink>
        </p>
        <CodeBlock>{citation.paperBibtex}</CodeBlock>
      </Card>

      <Card title="Dataset (Zenodo DOI)" className="mb-6">
        <p className="mb-3 text-sm text-slate-600">
          DOI <code>{citation.doi}</code> —{" "}
          <ExtLink href={links.zenodo}>{links.zenodo}</ExtLink>
        </p>
        <CodeBlock>{citation.datasetBibtex}</CodeBlock>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card title="Datasets, licenses & versions">
          <ul className="space-y-2 text-sm text-slate-600">
            <li>
              <ExtLink href={links.dataset}>{dataset.hfRepo}</ExtLink> · revision{" "}
              <code>{dataset.latestRevision}</code> ·{" "}
              <Badge tone="neutral">{dataset.license}</Badge>
            </li>
            <li>
              <ExtLink href={links.evalDataset}>{evalDataset.hfRepo}</ExtLink> ·{" "}
              <Badge tone="neutral">{evalDataset.license}</Badge>
            </li>
          </ul>
          <p className="mt-3 text-xs text-slate-500">
            CC-BY-NC-4.0 is a non-commercial license: credit the author and do not
            use the data commercially without separate permission.
          </p>
        </Card>
        <Card title="Related resources">
          <ul className="space-y-1.5 text-sm">
            <li>
              RIR-Mega-Speech paper:{" "}
              <ExtLink href={links.speechPaper}>arXiv:2601.19949</ExtLink>
            </li>
            <li>
              ASR benchmark:{" "}
              <ExtLink href={links.whisperBench}>whisper-rirmega-bench</ExtLink>
            </li>
            <li>
              Author: {citation.author} ·{" "}
              <ExtLink href={links.authorSite}>website</ExtLink> ·{" "}
              <ExtLink href={links.linkedin}>LinkedIn</ExtLink>
            </li>
          </ul>
        </Card>
      </div>

      <p className="mt-8 text-xs text-slate-500">
        All identifiers and links on this page were verified against the live
        resources on {VERIFIED_ON}. This benchmark suite (rirbench) is licensed
        Apache-2.0; the datasets retain their own CC-BY-NC-4.0 license.
      </p>
    </>
  );
}
