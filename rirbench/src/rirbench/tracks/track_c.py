"""Track C — Downstream audio ML (ASR robustness).

Track C measures how reverberation injected from RIR-Mega degrades speech
recognition, reusing the published pipeline in
https://github.com/mandip42/whisper-rirmega-bench by reference. We do NOT fork
its model code here; rirbench provides:

  * a WER/CER scorer (``jiwer``-backed, with a dependency-free fallback) so the
    smoke test runs with no heavy model, and
  * documented commands to run the full Whisper benchmark in that repo.

The smoke test convolves a clean speech fixture with a RIR fixture and scores a
*provided* transcript pair, proving the metric path works without downloading
Whisper weights. A lightweight dereverberation baseline (WPE) is documented as
optional via pyroomacoustics in the full pipeline.
"""
from __future__ import annotations

import re
from typing import List

WHISPER_BENCH_REPO = "https://github.com/mandip42/whisper-rirmega-bench"
FULL_RUN_COMMAND = (
    "python -m bench.build_and_publish --config configs/default.yaml "
    "--skip-push-dataset --skip-push-space"
)
SMOKE_RUN_COMMAND = "python scripts/sanity_check.py"


def _normalize(text: str) -> List[str]:
    return re.sub(r"[^\w\s]", "", text.lower()).split()


def wer(reference: str, hypothesis: str) -> float:
    """Word error rate. Uses jiwer when available, else a Levenshtein fallback."""
    try:
        import jiwer  # type: ignore

        return float(jiwer.wer(reference, hypothesis))
    except Exception:
        return _edit_rate(_normalize(reference), _normalize(hypothesis))


def cer(reference: str, hypothesis: str) -> float:
    """Character error rate (fallback Levenshtein over characters)."""
    try:
        import jiwer  # type: ignore

        return float(jiwer.cer(reference, hypothesis))
    except Exception:
        return _edit_rate(list(reference.lower()), list(hypothesis.lower()))


def _edit_rate(ref: list, hyp: list) -> float:
    """Levenshtein edit distance / len(ref). Pure-python, deterministic."""
    n, m = len(ref), len(hyp)
    if n == 0:
        return 0.0 if m == 0 else 1.0
    prev = list(range(m + 1))
    for i in range(1, n + 1):
        cur = [i] + [0] * m
        for j in range(1, m + 1):
            cost = 0 if ref[i - 1] == hyp[j - 1] else 1
            cur[j] = min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost)
        prev = cur
    return float(prev[m]) / float(n)


def convolve_speech(speech, rir):
    """Convolve a clean speech signal with a RIR (reverberant speech)."""
    import numpy as np
    from scipy.signal import fftconvolve

    y = fftconvolve(np.asarray(speech, float), np.asarray(rir, float))[: len(speech)]
    peak = np.max(np.abs(y))
    return y / peak if peak > 0 else y


def run_smoke(reference: str, clean_hyp: str, reverb_hyp: str) -> dict:
    """Score a provided (reference, clean-hyp, reverb-hyp) triple. Demonstrates
    the WER/CER path and the expected clean<=reverb degradation, no model needed."""
    return {
        "track": "C",
        "mode": "smoke",
        "whisper_bench_repo": WHISPER_BENCH_REPO,
        "full_run_command": FULL_RUN_COMMAND,
        "clean": {"wer": wer(reference, clean_hyp), "cer": cer(reference, clean_hyp)},
        "reverb": {"wer": wer(reference, reverb_hyp), "cer": cer(reference, reverb_hyp)},
    }
