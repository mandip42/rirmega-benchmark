# RIR-Mega Independent Benchmark & Evaluation Portal — Architecture

## 1. Ecosystem audit (findings)

Verified against the live resources on 2026-10-19.

| Resource | Status | Key facts (verified) |
|---|---|---|
| [github.com/mandip42/rirmega](https://github.com/mandip42/rirmega) | Live, 7★ | Python pkg `rirmega` (`cli.py`), v1.2.1; Zenodo DOI `10.5281/zenodo.17387402`; CITATION.cff present; license: code + dataset license files |
| [HF datasets/mandipgoswami/rirmega](https://huggingface.co/datasets/mandipgoswami/rirmega) | Live, 4★ | 1,000 rows (`rir_output_1k`: train 800 / val 100 / test 100); `metadata_v2.parquet` schema; license **cc-by-nc-4.0**; arXiv 2510.18917 |
| [HF datasets/mandipgoswami/rirmega-eval](https://huggingface.co/datasets/mandipgoswami/rirmega-eval) | Live | 53.5k-row text ID manifest pairing LibriSpeech utterances ↔ RIR ids; splits train/dev/test; license cc-by-nc-4.0 |
| [github.com/mandip42/whisper-rirmega-bench](https://github.com/mandip42/whisper-rirmega-bench) | Live, 2★ | Full ASR-robustness pipeline: speech loader, RIR loader, convolution, Whisper runner (WER/CER), reporting, Gradio Space. Has `scripts/sanity_check.py` (<5 min smoke) |
| [arxiv.org/abs/2510.18917](https://arxiv.org/abs/2510.18917) | Live | Main paper: "RIR-Mega: A Large-Scale Room Impulse Response Corpus…" |
| [arxiv.org/abs/2601.19949](https://arxiv.org/abs/2601.19949) | Referenced | RIR-Mega-Speech paper (listed by user) |
| [mandipgoswami.vercel.app](https://mandipgoswami.vercel.app) | Live | Author website |

### v2 metadata schema (metadata_v2.parquet) — fields we may visualize
`sample_id, sample_rate, rir_length_samples, onset_sample, room_id, src_xyz, mic_xyz,
distance_m, RT60_T20_s, RT60_T30_s, EDT_s, DRR_dB, C50_dB, C80_dB, D50, band_rt60_octave,
qc_grade (A/B/C), qc_flags, generator_version, provenance`

**Rule enforced across the build:** we only visualize/report fields that actually exist in
these datasets. No invented metadata, no fabricated scores.

### Reusable assets (do NOT rebuild)
- `gh-audio_eval_suite/src/audio_eval_suite/run_eval.py` — contains a *real, documented*
  Schroeder-backward-integration RT60 (T20) estimator and a direct-to-late energy / DRR proxy.
  Adapted into `rirbench.metrics` (closed-form LS slope, BLAS single-threaded — host-safe).
- `whisper-rirmega-bench` — Track C reuses its workflow by reference (we do not fork its code;
  we document and wrap its published entry points).

## 2. Repository layout — `rirmega-benchmark` (new, isolated; originals untouched)

```
rirmega-benchmark/
├── ARCHITECTURE.md                 # this file
├── README.md                       # top-level: what/why/how
├── portal/                         # Deliverable 1 — Next.js + TS + Tailwind
│   ├── app/                        # App Router pages: /, overview, explorer,
│   │                               #   reproducibility, results, participate, cite, collaborate
│   ├── components/                 # charts (Recharts), layout, UI
│   ├── lib/                        # dataset facts (verified constants), schema loader
│   ├── public/data/                # small real sample (committed), result JSONs
│   └── ...                         # tailwind, tsconfig, vercel config, tests (Vitest)
├── rirbench/                       # Deliverable 2 — Python benchmark package
│   ├── pyproject.toml
│   ├── src/rirbench/
│   │   ├── metrics.py              # RT60(T20/T30), DRR, C50/C80, D50, EDT — documented
│   │   ├── tracks/track_a.py       # acoustic validity
│   │   ├── tracks/track_b.py       # synthetic↔real generalization protocol
│   │   ├── tracks/track_c.py       # downstream ASR (wraps whisper-rirmega-bench)
│   │   ├── schema.py               # result schema (pydantic) + validation
│   │   ├── data.py                 # HF loaders w/ HF_HUB_DOWNLOAD_TIMEOUT
│   │   └── cli.py                  # `rirbench ...`
│   ├── fixtures/                   # tiny synthetic RIR .wav fixtures for smoke tests
│   └── tests/                      # pytest smoke + unit
├── schema/
│   └── result.schema.json          # Deliverable 3 — versioned machine-readable schema
├── submissions/                    # PR-based submissions land here (validated by CI)
│   └── example/                    # one worked example (self-reported)
├── docs/
│   └── research-overview.md        # Deliverable 4 — one-page downloadable overview
└── .github/workflows/
    ├── portal.yml                  # Node: typecheck, lint, test, build
    ├── python.yml                  # Python: pytest smoke + metric validation
    └── validate-submission.yml     # schema validation of submissions/*.json on PR
```

## 3. Benchmark tracks (Deliverable 2)

- **Track A — Acoustic validity.** Recompute RT60(T20), DRR, C50/C80, D50, EDT from RIR
  waveforms via Schroeder backward integration; compare recomputed vs. published metadata
  values (agreement study, bias/MAE with bootstrap 95% CI). Honest floor, documented windows
  ([-5,-25] dB for T20; [-5,-35] dB for T30), onset detection, calibration assumptions.
- **Track B — Synthetic→real generalization.** A *protocol* (not a data redistribution):
  instructions + harness to align sample rate / channel / S-R config against ACE and REVERB
  under their own licenses (user obtains them). Reports domain shift and failure cases.
- **Track C — Downstream ASR.** Wraps `whisper-rirmega-bench`: WER/CER on clean↔reverberant
  pairs. Smoke test uses a handful of utterances; full run documented.

All tracks: `--smoke` (tiny fixtures, no network) and documented full-run commands.

## 4. Independent contributions (Deliverable 3)

- `schema/result.schema.json` — JSON Schema (draft 2020-12), version `1.0.0`.
- PR workflow: contributor adds `submissions/<team>-<date>.json`; `validate-submission.yml`
  runs schema validation + (optional) artifact reproducibility check.
- Verification tier is a **field**, set by maintainer review, not by passing CI:
  `self-reported` | `artifact-checked` | `independently-reproduced`.
  Passing automated validation NEVER implies endorsement (stated in UI + docs).
- Anonymous local runs fully supported; public submission requires only attribution fields,
  all optional except track/version/metrics, with explicit consent flag.

## 5. Deployment (Deliverable 5)

- Vercel + GitHub CD. Root = `portal/`. No paid APIs. No mandatory login.
- `next build` on this host needs `NEXT_CPUS=2` + `UV_THREADPOOL_SIZE=2` (known host quirk).
- If Vercel/GitHub auth is unavailable in-session, prepare production build + exact push/deploy
  steps for the user to run under their own credentials (protected-branch push is theirs to run).

## 6. Scientific-integrity guardrails
- No "state of the art" / "first ever" / "industry leading" language.
- Published vs. reproduced vs. new results are visually and structurally separated.
- Every number on the site traces to a committed JSON produced by `rirbench` or to the
  dataset's own published metadata — never hand-typed.
- Download counts, citations, DOIs, licenses shown only where verified; otherwise marked pending.
