import { Card, Badge, PageHeader, CodeBlock, ExtLink } from "@/components/ui";
import { links, dataset } from "@/lib/facts";

export default function ReproducibilityPage() {
  return (
    <>
      <PageHeader
        eyebrow="Reproducibility hub"
        title="Run a real baseline in five minutes"
        lede="Exact commands, pinned environment, deterministic seeds and expected outputs. The quickstart needs no network and no dataset download — it runs on tiny synthetic fixtures shipped with the benchmark."
      />

      <Card title="Environment" className="mb-6">
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
          <li>Python ≥ 3.9 (tested on 3.12).</li>
          <li>
            Core deps (pinned ranges in <code>pyproject.toml</code>):{" "}
            <code>numpy ≥ 1.23</code>, <code>scipy ≥ 1.9</code>,{" "}
            <code>soundfile ≥ 0.12</code>, <code>pydantic ≥ 2.0</code>.
          </li>
          <li>
            Optional extras: <code>[hub]</code> to pull real data from Hugging
            Face, <code>[asr]</code> for Track C word-error-rate scoring.
          </li>
          <li>All randomness is seeded (bootstrap CI uses <code>seed=0</code>).</li>
        </ul>
      </Card>

      <Card title="5-minute quickstart (no network)" className="mb-6">
        <div className="mb-2">
          <Badge tone="verified">Verified to run</Badge>
        </div>
        <CodeBlock>{`# 1. clone and install the benchmark package
git clone https://github.com/<you>/rirmega-benchmark.git
cd rirmega-benchmark/rirbench
pip install -e ".[dev]"

# 2. generate the tiny synthetic fixtures (3 RIRs, known reverberation)
python fixtures/make_fixtures.py

# 3. run the full test + smoke suite
pytest -q

# 4. compute every reference metric for one RIR
rirbench metrics fixtures/medium_t60_0p6.wav`}</CodeBlock>
        <p className="mt-3 text-sm text-slate-600">
          Expected output for step 4 (the medium fixture targets T60 = 0.6 s; the
          estimator recovers it to within ~2%):
        </p>
        <CodeBlock>{`{
  "rt60_t20_s": 0.6129,
  "rt60_t30_s": 0.6046,
  "edt_s": 0.5802,
  "drr_db": -11.95,
  "c50_db": 3.32,
  "c80_db": 7.52,
  "d50": 0.683
}`}</CodeBlock>
      </Card>

      <Card title="Run each track" className="mb-6">
        <CodeBlock>{`# Track A — acoustic validity (recompute + agreement)
rirbench track-a --smoke

# Track B — synthetic↔real generalization protocol
rirbench track-b --smoke

# Track C — downstream ASR (WER/CER path)
rirbench track-c --smoke`}</CodeBlock>
        <p className="mt-3 text-sm text-slate-600">
          Each <code>--smoke</code> run finishes in seconds and emits JSON in the
          exact shape used on the Results page.
        </p>
      </Card>

      <Card title="Full run against the real dataset" className="mb-6">
        <p className="mb-2 text-sm text-slate-600">
          Install the <code>[hub]</code> extra, then point Track A at a local copy
          of the RIR waveforms and the published metadata to measure agreement:
        </p>
        <CodeBlock>{`pip install -e ".[hub]"

# download metadata (honors HF_HUB_DOWNLOAD_TIMEOUT so it fails fast, not hangs)
python -c "from rirbench.data import download_rirmega_metadata as d; print(d())"

# recompute metrics for your local RIR .wav dir and compare to published metadata
rirbench track-a --dir /path/to/rir_wavs --meta /path/to/metadata_v2.parquet \\
  --out track_a_full.json`}</CodeBlock>
        <p className="mt-3 text-sm text-slate-600">
          Dataset: <ExtLink href={links.dataset}>{dataset.hfRepo}</ExtLink>,
          revision <code>{dataset.latestRevision}</code>, license{" "}
          {dataset.license}.
        </p>
      </Card>

      <Card title="Checksums & versions" className="mb-6">
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
          <li>
            Pin the dataset by revision <code>{dataset.latestRevision}</code> so
            your run is reproducible even if the dataset is updated.
          </li>
          <li>
            The benchmark package reports its own version in every result JSON
            (<code>benchmark_version</code>), currently <code>1.0.0</code>.
          </li>
          <li>
            Record your environment with{" "}
            <code>pip freeze &gt; environment.lock.txt</code> and attach it to any
            submission.
          </li>
        </ul>
      </Card>

      <Card title="Troubleshooting">
        <ul className="list-disc space-y-2 pl-5 text-sm text-slate-600">
          <li>
            <strong>OpenBLAS thread-pool allocation error on many-core
            machines.</strong>{" "}
            The metrics set <code>OPENBLAS_NUM_THREADS=1</code> automatically and
            use a closed-form least-squares slope (no LAPACK call). If you still
            hit it, export <code>OMP_NUM_THREADS=1</code> before running.
          </li>
          <li>
            <strong>A Hub download hangs.</strong> Set{" "}
            <code>HF_HUB_DOWNLOAD_TIMEOUT=30</code> (the loader sets this by
            default) so a stalled download fails fast.
          </li>
          <li>
            <strong><code>soundfile</code> import error.</strong> Install
            libsndfile (bundled in the wheel on Windows/macOS; on Linux{" "}
            <code>apt-get install libsndfile1</code>).
          </li>
        </ul>
      </Card>
    </>
  );
}
