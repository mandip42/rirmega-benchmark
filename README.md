# RIR-Mega Independent Benchmark & Evaluation Portal

An independent, reproducible benchmark portal and evaluation suite for the
**RIR-Mega** room-impulse-response (RIR) research ecosystem. It lets external
researchers reproduce results, inspect the methodology, download an evaluation
sample, run a real baseline, and submit independently generated results — with no
setup help required.

> This is an **independent** evaluation portal. It separates published,
> independently reproduced and newly contributed results, and never implies
> endorsement of a result simply because it passes automated validation. The
> original research repositories are not modified.

## Repository layout

```
rirmega-benchmark/
├── portal/      Next.js + TypeScript + Tailwind research website (Vercel-ready)
├── rirbench/    Python benchmark package (Track A / B / C, result schema, CLI)
├── schema/      Versioned machine-readable result schema (result.schema.json)
├── submissions/ PR-based result submissions (schema-validated in CI)
├── docs/        One-page research overview (Markdown + printable)
└── .github/     CI: portal build, python tests, submission validation
```

## Quickstart (5 minutes, no network)

```bash
cd rirbench
pip install -e ".[dev]"
python fixtures/make_fixtures.py
pytest -q
rirbench metrics fixtures/medium_t60_0p6.wav   # recovers T60 ≈ 0.61 s (target 0.6)
```

## Run the portal locally

```bash
cd portal
npm ci
npm run dev        # http://localhost:3000
```

Build (on many-core machines, cap worker threads to avoid a known crash):

```bash
NEXT_CPUS=2 UV_THREADPOOL_SIZE=2 npm run build
```

## Benchmark tracks

| Track | Name | What it measures |
|---|---|---|
| A | Acoustic validity | Recompute RT60/DRR/clarity from waveforms; agreement with published metadata (bias, MAE, bootstrap 95% CI) |
| B | Synthetic→real generalization | Protocol to compare RIR-Mega vs. measured corpora (ACE/REVERB) under their own licenses; domain-shift reporting |
| C | Downstream ASR | WER/CER on paired clean↔reverberant speech, wrapping whisper-rirmega-bench |

Every track supports `--smoke` (tiny fixtures, no network) and documented full runs.

## Submitting a result

1. Produce a JSON result and validate it: `rirbench validate my_result.json`.
2. Add it under `submissions/<team>-<date>.json` and open a PR.
3. CI validates the schema. **Schema-valid ≠ endorsed** — a maintainer assigns the
   verification tier (`self-reported` / `artifact-checked` / `independently-reproduced`).

## Resources (verified 2026-10-19)

- Dataset: https://huggingface.co/datasets/mandipgoswami/rirmega (CC-BY-NC-4.0, rev main)
- Eval manifest: https://huggingface.co/datasets/mandipgoswami/rirmega-eval
- Main repo: https://github.com/mandip42/rirmega
- ASR pipeline: https://github.com/mandip42/whisper-rirmega-bench
- Paper: https://arxiv.org/abs/2510.18917 · Dataset DOI: 10.5281/zenodo.17387402

## Licenses

- This benchmark suite (`rirbench`) and portal: **Apache-2.0**.
- The RIR-Mega datasets retain their own **CC-BY-NC-4.0** license.

## Integrity

No fabricated charts, citations, benchmark scores or download counts. Every number
on the portal traces to a committed `rirbench` output or to the datasets' own
published metadata. Fields that are unpopulated in the data are shown as such, not
invented.
