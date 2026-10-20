import fs from "node:fs";
import path from "node:path";
import { Card, Badge, PageHeader, ExtLink } from "@/components/ui";
import { Histogram, ScatterPlot } from "@/components/charts";
import { links, dataset } from "@/lib/facts";

type FieldStat = {
  n: number;
  min: number;
  max: number;
  mean: number;
  std: number;
  p5: number;
  p50: number;
  p95: number;
  hist: { counts: number[]; edges: number[] };
};

type ExplorerData = {
  source: string;
  n_rows: number;
  populated: Record<string, FieldStat>;
  unpopulated: string[];
  scatter_drr_c50: Record<string, number>[];
};

const FIELD_META: Record<string, { label: string; unit: string; blurb: string }> = {
  DRR_dB: { label: "Direct-to-reverberant ratio", unit: "dB", blurb: "Higher = dryer / more direct energy." },
  C50_dB: { label: "Clarity C50", unit: "dB", blurb: "Early (≤50 ms) vs. late energy; speech clarity." },
  C80_dB: { label: "Clarity C80", unit: "dB", blurb: "Early (≤80 ms) vs. late energy; music clarity." },
  D50: { label: "Definition D50", unit: "", blurb: "Early-energy fraction, 0–1." },
  EDT_s: { label: "Early decay time", unit: "s", blurb: "Decay slope over the first 10 dB." },
  RT60_T20_s: { label: "Reverberation time (T20)", unit: "s", blurb: "" },
  RT60_T30_s: { label: "Reverberation time (T30)", unit: "s", blurb: "" },
  distance_m: { label: "Source–receiver distance", unit: "m", blurb: "" },
};

function loadData(): ExplorerData {
  const p = path.join(process.cwd(), "public", "data", "explorer_stats.json");
  return JSON.parse(fs.readFileSync(p, "utf-8"));
}

export default function ExplorerPage() {
  const data = loadData();
  const populatedKeys = Object.keys(data.populated);

  return (
    <>
      <PageHeader
        eyebrow="Benchmark explorer"
        title="RIR characteristics, from the real dataset"
        lede="Interactive distributions computed directly from the published RIR-Mega metadata. Only fields that actually carry data are charted — no metadata is invented."
      />

      <Card className="mb-8">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <Badge tone="verified">Real data</Badge>
          <span className="text-slate-600">
            Source: <code>{data.source}</code> — {data.n_rows} rows ·{" "}
            <ExtLink href={links.dataset}>{dataset.hfRepo}</ExtLink> (revision{" "}
            {dataset.latestRevision})
          </span>
        </div>
        {data.unpopulated.length > 0 && (
          <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            <strong>Not populated in this sample:</strong>{" "}
            {data.unpopulated.map((f) => FIELD_META[f]?.label ?? f).join(", ")}.
            These columns exist in the schema but are empty in the sampled rows —
            recomputing them from the raw waveforms is exactly what{" "}
            <a href="/results" className="underline">
              Track A
            </a>{" "}
            does.
          </p>
        )}
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {populatedKeys.map((k) => {
          const s = data.populated[k];
          const meta = FIELD_META[k] ?? { label: k, unit: "", blurb: "" };
          return (
            <Card key={k} title={`${meta.label}${meta.unit ? ` (${meta.unit})` : ""}`}>
              {meta.blurb && (
                <p className="mb-2 text-sm text-slate-500">{meta.blurb}</p>
              )}
              <Histogram hist={s.hist} />
              <dl className="mt-3 grid grid-cols-3 gap-2 text-xs text-slate-600 sm:grid-cols-6">
                <Stat label="n" v={s.n} />
                <Stat label="mean" v={s.mean} />
                <Stat label="p5" v={s.p5} />
                <Stat label="p50" v={s.p50} />
                <Stat label="p95" v={s.p95} />
                <Stat label="std" v={s.std} />
              </dl>
            </Card>
          );
        })}
      </div>

      <Card title="DRR vs. C50 (per-RIR)" className="mt-8">
        <p className="mb-2 text-sm text-slate-500">
          Each point is one real RIR. Dryer RIRs (higher DRR) tend to show higher
          clarity — a sanity check that the two published descriptors move
          together as room acoustics predicts.
        </p>
        <ScatterPlot
          points={data.scatter_drr_c50}
          xKey="DRR_dB"
          yKey="C50_dB"
          xLabel="DRR (dB)"
          yLabel="C50 (dB)"
        />
      </Card>
    </>
  );
}

function Stat({ label, v }: { label: string; v: number }) {
  return (
    <div>
      <dt className="uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="font-mono text-slate-700">
        {Number.isInteger(v) ? v : v.toFixed(2)}
      </dd>
    </div>
  );
}
