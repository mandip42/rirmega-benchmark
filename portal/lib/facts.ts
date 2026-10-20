/**
 * Single source of truth for verified RIR-Mega ecosystem facts.
 *
 * INTEGRITY RULE: every value here was verified against the live resource on
 * 2026-10-19. Nothing is invented. Fields whose value could not be verified are
 * marked `pending: true` and the UI renders them as "pending verification",
 * never as a concrete number. Benchmark numbers come from committed JSON in
 * `public/data/`, produced by the `rirbench` Python suite — never hand-typed.
 */

export const VERIFIED_ON = "2026-10-19";

export type Link = { label: string; href: string; note?: string };

export const links = {
  repo: "https://github.com/mandip42/rirmega",
  benchmarkRepo: "https://github.com/mandip42/rirmega-benchmark",
  paper: "https://arxiv.org/abs/2510.18917",
  speechPaper: "https://arxiv.org/abs/2601.19949",
  dataset: "https://huggingface.co/datasets/mandipgoswami/rirmega",
  evalDataset: "https://huggingface.co/datasets/mandipgoswami/rirmega-eval",
  whisperBench: "https://github.com/mandip42/whisper-rirmega-bench",
  authorSite: "https://mandipgoswami.vercel.app",
  linkedin: "https://www.linkedin.com/in/mandipgoswami/",
  zenodo: "https://doi.org/10.5281/zenodo.17387402",
} as const;

/** Dataset facts verified from the HF dataset cards. */
export const dataset = {
  name: "RIR-Mega",
  hfRepo: "mandipgoswami/rirmega",
  // The dataset publishes a single `main` branch; there is no version tag
  // (verified 2026-10-19 via HfApi.list_repo_refs — only `main`, no tags).
  latestRevision: "main",
  license: "CC-BY-NC-4.0",
  // Row counts for the `rir_output_1k` config (the parquet-backed config this
  // portal reads). Verified 2026-10-19: metadata_v2.parquet = 1000 rows;
  // rir_output_1k/metadata.csv split = 800 train / 100 val / 100 test.
  rows: { total: 1000, train: 800, validation: 100, test: 100 },
  // Columns verified present in metadata_v2.parquet (HF dataset card).
  metadataFields: [
    "sample_id", "sample_rate", "rir_length_samples", "onset_sample",
    "room_id", "src_xyz", "mic_xyz", "distance_m",
    "RT60_T20_s", "RT60_T30_s", "EDT_s", "DRR_dB", "C50_dB", "C80_dB", "D50",
    "band_rt60_octave", "qc_grade", "qc_flags", "generator_version", "provenance",
  ],
  splits: ["random", "unseen_room", "unseen_distance"],
  qcGrades: ["A", "B", "C"],
} as const;

export const evalDataset = {
  name: "RIR-Mega-Eval",
  hfRepo: "mandipgoswami/rirmega-eval",
  license: "CC-BY-NC-4.0",
  rows: { total: 53500 }, // "53.5k rows" on the HF card
  description:
    "An ID manifest pairing LibriSpeech utterances with RIR ids (train/dev/test) " +
    "for the Whisper-RIR-Mega ASR-robustness benchmark.",
} as const;

/** Citation data verified against the repo README / CITATION.cff. */
export const citation = {
  paperBibtex: `@misc{goswami2025rirmega,
  title        = {RIR-Mega: A Large-Scale Room Impulse Response Corpus with Benchmarks for Industrial and Building Acoustics},
  author       = {Goswami, Mandip},
  year         = {2025},
  eprint       = {2510.18917},
  archivePrefix= {arXiv},
  primaryClass = {cs.SD},
  url          = {https://arxiv.org/abs/2510.18917}
}`,
  datasetBibtex: `@dataset{goswami_2025_rirmega_zenodo,
  author       = {Goswami, Mandip},
  title        = {RIR-Mega Dataset},
  year         = {2025},
  publisher    = {Zenodo},
  version      = {v1.0.0},
  doi          = {10.5281/zenodo.17387402},
  url          = {https://doi.org/10.5281/zenodo.17387402}
}`,
  doi: "10.5281/zenodo.17387402",
  author: "Mandip Goswami",
} as const;

/** The three benchmark tracks (mirror of the rirbench Python package). */
export const tracks = [
  {
    id: "A",
    name: "Acoustic validity",
    summary:
      "Recompute RT60 (T20/T30), EDT, DRR, C50, C80 and D50 directly from the RIR " +
      "waveforms with a documented Schroeder-backward-integration estimator, and " +
      "measure agreement with the dataset's published metadata (bias, MAE, RMSE, " +
      "bootstrap 95% CI).",
    metrics: ["RT60_T20_s", "RT60_T30_s", "EDT_s", "DRR_dB", "C50_dB", "C80_dB", "D50"],
  },
  {
    id: "B",
    name: "Synthetic-to-real generalization",
    summary:
      "A reproducible protocol (not a data redistribution) to compare RIR-Mega " +
      "against independently measured corpora such as ACE and REVERB under their " +
      "own licenses. Enforces matched sample rate, channel convention and held-out " +
      "separation, and reports domain shift and failure cases.",
    metrics: ["distribution shift (mean/median)", "per-metric p5/p50/p95"],
  },
  {
    id: "C",
    name: "Downstream audio ML (ASR)",
    summary:
      "Wraps the published whisper-rirmega-bench pipeline: WER/CER on paired " +
      "clean↔reverberant speech. Documents model versions, splits and compute. " +
      "A lightweight dereverberation (WPE) baseline is optional.",
    metrics: ["WER", "CER"],
  },
] as const;

/** Verification tiers for submissions (no tier implies endorsement). */
export const verificationTiers = [
  {
    id: "self-reported",
    label: "Self-reported",
    desc: "Submitted by a contributor and schema-valid. Not independently checked. " +
      "Passing automated validation does not imply scientific endorsement.",
  },
  {
    id: "artifact-checked",
    label: "Artifact-checked",
    desc: "A maintainer confirmed the submitted code/artifacts run and produce the " +
      "reported output format on a small sample.",
  },
  {
    id: "independently-reproduced",
    label: "Independently reproduced",
    desc: "A maintainer or third party reproduced the reported metrics within the " +
      "stated uncertainty from the submitted instructions.",
  },
] as const;

/** Open research questions — framed as questions, no unsupported claims. */
export const openQuestions = [
  "How closely do RIR-Mega's simulated acoustic descriptors match independently measured rooms (ACE/REVERB) across RT60, DRR and clarity, and where do they diverge?",
  "Which room/geometry regimes (very long T60, coupled rooms, near-field, low DRR) are under-represented or least faithful?",
  "Does training RT60/DRR estimators on RIR-Mega transfer to measured RIRs, and how large is the synthetic-to-real gap?",
  "How much does RIR-Mega-induced reverberation degrade modern ASR (Whisper family), and does a simple dereverberation front-end recover it?",
  "Are the published metadata metrics reproducible from the raw waveforms with an independent estimator, within a stated tolerance?",
];
