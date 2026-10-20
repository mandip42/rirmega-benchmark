# RIR-Mega — One-Page Research Overview

*Independent Benchmark & Evaluation Portal. Verified 2026-10-19.*

## What RIR-Mega is (verifiable)

RIR-Mega is an openly licensed corpus of **room impulse responses (RIRs)** with a
versioned acoustic-metadata schema (reverberation time, clarity, direct-to-
reverberant ratio and related descriptors), plus parameter-estimation baselines
and tooling. It targets research on reverberation, dereverberation, and
reverberation-robust speech.

- Dataset: `mandipgoswami/rirmega` (revision `v2.0.0`, CC-BY-NC-4.0) — 4,000 rows
  (train 3,200 / validation 400 / test 400).
- ASR pairing manifest: `mandipgoswami/rirmega-eval` (CC-BY-NC-4.0).
- Paper: arXiv:2510.18917. Dataset DOI: 10.5281/zenodo.17387402.
- ASR pipeline: `github.com/mandip42/whisper-rirmega-bench`.

No superlatives ("state of the art", "first", "industry leading") are claimed;
novelty is left to peer review and to the independent evaluations below.

## Open benchmark questions

1. How closely do RIR-Mega's simulated descriptors match measured rooms (ACE,
   REVERB) across RT60, DRR and clarity — and where do they diverge?
2. Which room regimes (very long T60, coupled rooms, near-field, low DRR) are
   under-represented or least faithful?
3. Do estimators trained on RIR-Mega transfer to measured RIRs, and how large is
   the synthetic-to-real gap?
4. How much does RIR-Mega-induced reverberation degrade modern ASR, and does a
   simple dereverberation front-end recover it?
5. Are the published metadata metrics reproducible from the raw waveforms with an
   independent estimator, within a stated tolerance? *(Note: RT60 columns are
   present in the schema but empty in the sampled rows — recomputing them is a
   concrete, high-value task.)*

## Most valuable independent evaluations

- **Track A — acoustic validity.** Recompute RT60/DRR/clarity from the waveforms
  and report agreement (bias, MAE, bootstrap 95% CI).
- **Track B — synthetic→real.** Measure the domain gap against ACE/REVERB under
  their licenses, with matched sample rate and channel conventions.
- **Track C — downstream ASR.** Quantify WER/CER degradation and dereverberation
  recovery on your own speech test set.

## Reproduce a baseline in 5–15 minutes

```bash
git clone https://github.com/<you>/rirmega-benchmark.git
cd rirmega-benchmark/rirbench
pip install -e ".[dev]"
python fixtures/make_fixtures.py
pytest -q
rirbench metrics fixtures/medium_t60_0p6.wav   # recovers T60≈0.61 s (target 0.6)
```

No dataset download or network needed for the quickstart.

## Propose a study or share results

- GitHub Issues / Discussions on the benchmark repository.
- Submit results via the PR workflow against the versioned result schema
  (`schema/result.schema.json`, v1.0.0). Schema-valid ≠ endorsed; a maintainer
  assigns the verification tier (self-reported / artifact-checked /
  independently-reproduced).

## Cite

```bibtex
@misc{goswami2025rirmega,
  title={RIR-Mega: A Large-Scale Room Impulse Response Corpus with Benchmarks for Industrial and Building Acoustics},
  author={Goswami, Mandip}, year={2025}, eprint={2510.18917},
  archivePrefix={arXiv}, primaryClass={cs.SD}, url={https://arxiv.org/abs/2510.18917}
}
```

Dataset DOI: 10.5281/zenodo.17387402 (CC-BY-NC-4.0).
