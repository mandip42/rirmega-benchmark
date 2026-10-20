"""Track B — Synthetic-to-real generalization protocol.

This track is a *protocol*, not a data redistribution. ACE and REVERB are
released under their own licenses and must be obtained by the researcher from
their official sources. rirbench provides the alignment + comparison harness so
that a comparison between RIR-Mega (synthetic) and a measured corpus is fair:

  * resample both corpora to a common sample rate (default 16 kHz);
  * take a single channel (first channel) by a stated convention;
  * compute the same reference metrics (Track A estimator) on both;
  * compare distributions and report *domain shift* and failure cases, not a
    single flattering summary number.

Fairness requirements (documented, enforced by ``check_alignment``):
  - matched sample rate,
  - matched channel convention,
  - comparison is distributional (per-metric), with held-out separation left to
    the researcher's measured set (we never train on the measured corpus).
"""
from __future__ import annotations

from typing import Optional

import numpy as np

from .. import metrics as M
from ..data import iter_local_rirs

COMMON_FS = 16000

MEASURED_SOURCES = {
    "ACE": "https://acecorpus.ee.ic.ac.uk/",            # Eastwood/Naylor ACE Challenge
    "REVERB": "https://reverb2014.dereverberation.com/",  # REVERB Challenge
}


def check_alignment(fs_a: int, fs_b: int, ch_a: int, ch_b: int) -> list[str]:
    """Return a list of fairness violations (empty list == aligned)."""
    issues = []
    if fs_a != fs_b:
        issues.append(f"sample-rate mismatch: {fs_a} vs {fs_b} Hz")
    if ch_a != ch_b:
        issues.append(f"channel-count mismatch: {ch_a} vs {ch_b}")
    return issues


def _resample_mono(wav: np.ndarray, fs: int, target_fs: int) -> tuple[np.ndarray, int]:
    x = np.asarray(wav, float)
    if x.ndim > 1:
        x = x[:, 0]  # first-channel convention
    if fs != target_fs:
        from scipy.signal import resample_poly
        from math import gcd

        g = gcd(fs, target_fs)
        x = resample_poly(x, target_fs // g, fs // g)
    return x, target_fs


def metric_distribution(directory: str, target_fs: int = COMMON_FS) -> dict:
    """Compute reference metrics for every RIR in a dir after alignment, and
    summarize each metric's distribution (mean, std, p5, p50, p95, n)."""
    vals: dict[str, list] = {k: [] for k in
                             ("rt60_t20_s", "rt60_t30_s", "edt_s", "drr_db",
                              "c50_db", "c80_db", "d50")}
    for _sid, wav, fs in iter_local_rirs(directory):
        x, fsr = _resample_mono(wav, fs, target_fs)
        m = M.compute_all(x, fsr).as_dict()
        for k in vals:
            vals[k].append(m[k])
    summary = {}
    for k, v in vals.items():
        arr = np.asarray([x for x in v if np.isfinite(x)], float)
        if arr.size == 0:
            continue
        summary[k] = {
            "mean": float(arr.mean()),
            "std": float(arr.std()),
            "p5": float(np.percentile(arr, 5)),
            "p50": float(np.percentile(arr, 50)),
            "p95": float(np.percentile(arr, 95)),
            "n": int(arr.size),
        }
    return summary


def domain_shift(synthetic: dict, measured: dict) -> dict:
    """Per-metric domain shift: difference of means and of medians between a
    synthetic corpus (RIR-Mega) and a measured corpus. Positive => synthetic
    reads higher. Reports every metric both sets share."""
    shift = {}
    for k in synthetic:
        if k in measured:
            shift[k] = {
                "delta_mean": synthetic[k]["mean"] - measured[k]["mean"],
                "delta_median": synthetic[k]["p50"] - measured[k]["p50"],
            }
    return shift


def run_smoke(fixtures_dir: str) -> dict:
    """Smoke: treat fixtures as both corpora (shift must be ~0), proving the
    alignment + distribution + shift pipeline runs end to end with no network."""
    dist = metric_distribution(fixtures_dir)
    return {
        "track": "B",
        "mode": "smoke",
        "measured_sources": MEASURED_SOURCES,
        "distribution": dist,
        "self_shift": domain_shift(dist, dist),
    }
