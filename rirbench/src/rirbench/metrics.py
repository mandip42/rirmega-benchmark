"""Room-acoustics metrics computed directly from a room impulse response (RIR).

All estimators are documented, dependency-light, and host-safe (closed-form
least-squares slope — no LAPACK/BLAS call, which can fail to allocate its
thread pool on many-core machines). They are *reference* implementations:
a real model or a more careful DSP pipeline is expected to refine them.

Definitions follow ISO 3382-1 conventions where applicable:

  * RT60 (T20) — reverberation time from a straight-line fit to the Schroeder
    decay curve over the [-5, -25] dB window, extrapolated to -60 dB.
  * RT60 (T30) — same, over the [-5, -35] dB window.
  * EDT (early decay time) — slope over [0, -10] dB, extrapolated to -60 dB.
  * DRR (direct-to-reverberant ratio, dB) — energy in a +/- window around the
    direct peak vs. the energy after it.
  * C50 / C80 (clarity, dB) — ratio of early (<=50/80 ms) to late energy.
  * D50 (definition, 0..1) — early (<=50 ms) energy fraction.

Preprocessing / calibration assumptions are stated per-function. Onset is the
first sample whose |amplitude| exceeds 20 dB below the global peak, which
defines t=0 for the clarity/definition early windows.
"""
from __future__ import annotations

import os

# Keep BLAS single-threaded before numpy import: on many-core hosts OpenBLAS
# can fail to allocate its per-call thread pool. These estimators are
# embarrassingly parallel over clips, so one thread is plenty.
for _v in ("OPENBLAS_NUM_THREADS", "OMP_NUM_THREADS", "MKL_NUM_THREADS",
           "NUMEXPR_NUM_THREADS", "VECLIB_MAXIMUM_THREADS"):
    os.environ.setdefault(_v, "1")

import math
from dataclasses import dataclass, asdict

import numpy as np

_EPS = 1e-12


def _as_mono(x: np.ndarray) -> np.ndarray:
    x = np.asarray(x, dtype=np.float64)
    if x.ndim > 1:
        x = x.mean(axis=1)
    return x


def find_onset(rir: np.ndarray, rel_db: float = -20.0) -> int:
    """Return the onset sample: first index whose |amplitude| rises above
    ``rel_db`` dB relative to the global peak. Defines t=0 for early windows."""
    x = _as_mono(rir)
    peak = float(np.max(np.abs(x)))
    if peak <= 0:
        return 0
    thresh = peak * (10.0 ** (rel_db / 20.0))
    idx = np.where(np.abs(x) >= thresh)[0]
    return int(idx[0]) if idx.size else int(np.argmax(np.abs(x)))


def schroeder_db(rir: np.ndarray) -> np.ndarray:
    """Normalised Schroeder backward-integration decay curve, in dB."""
    x = _as_mono(rir)
    energy = x ** 2
    total = energy.sum()
    if total <= 0:
        return np.array([])
    sch = np.cumsum(energy[::-1])[::-1]
    sch = sch / sch[0]
    return 10.0 * np.log10(np.maximum(sch, _EPS))


def _ls_slope(t: np.ndarray, y: np.ndarray) -> float:
    """Closed-form least-squares slope of y = a*t + b. No BLAS/LAPACK."""
    tm, ym = t.mean(), y.mean()
    denom = float(np.sum((t - tm) ** 2))
    if denom <= 0:
        return float("nan")
    return float(np.sum((t - tm) * (y - ym)) / denom)


def _rt_from_window(sch_db: np.ndarray, fs: int, hi_db: float, lo_db: float) -> float:
    """Reverberation time (s) from the Schroeder slope over [hi_db, lo_db],
    extrapolated to a 60 dB drop. Returns NaN on pathological fits."""
    if sch_db.size == 0:
        return float("nan")
    idx = np.where((sch_db <= hi_db) & (sch_db >= lo_db))[0]
    if idx.size < 10:
        return float("nan")
    t = idx / float(fs)
    a = _ls_slope(t, sch_db[idx])  # dB/s, should be negative
    if not math.isfinite(a) or a >= 0:
        return float("nan")
    rt = -60.0 / a
    return float(min(max(rt, 0.02), 20.0))  # clamp to a sane acoustic range


def rt60_t20(rir: np.ndarray, fs: int) -> float:
    """RT60 via the T20 window [-5, -25] dB."""
    return _rt_from_window(schroeder_db(rir), fs, -5.0, -25.0)


def rt60_t30(rir: np.ndarray, fs: int) -> float:
    """RT60 via the T30 window [-5, -35] dB."""
    return _rt_from_window(schroeder_db(rir), fs, -5.0, -35.0)


def edt(rir: np.ndarray, fs: int) -> float:
    """Early decay time: slope over [0, -10] dB extrapolated to 60 dB."""
    return _rt_from_window(schroeder_db(rir), fs, 0.0, -10.0)


def drr_db(rir: np.ndarray, fs: int, direct_window_ms: float = 2.5) -> float:
    """Direct-to-reverberant ratio (dB). Direct energy is taken in a +/- window
    (default +/-2.5 ms) around the onset peak; reverberant energy is everything
    after. Calibration: assumes the RIR is a genuine impulse response (a single
    dominant direct arrival), which holds for RIR-Mega samples."""
    x = _as_mono(rir)
    energy = x ** 2
    if energy.sum() <= 0:
        return float("nan")
    onset = find_onset(rir)
    half = max(1, int(direct_window_ms * 1e-3 * fs))
    lo = max(0, onset - half)
    hi = min(len(energy), onset + half + 1)
    direct = float(energy[lo:hi].sum())
    reverb = float(energy.sum() - direct)
    if reverb <= 0:
        return 60.0
    return float(10.0 * np.log10(max(direct, _EPS) / reverb))


def _clarity(rir: np.ndarray, fs: int, split_ms: float) -> float:
    x = _as_mono(rir)
    energy = x ** 2
    onset = find_onset(rir)
    split = onset + int(split_ms * 1e-3 * fs)
    early = float(energy[onset:split].sum())
    late = float(energy[split:].sum())
    if late <= 0:
        return 60.0
    return float(10.0 * np.log10(max(early, _EPS) / late))


def c50_db(rir: np.ndarray, fs: int) -> float:
    """Clarity C50 (dB): early (<=50 ms) vs. late energy."""
    return _clarity(rir, fs, 50.0)


def c80_db(rir: np.ndarray, fs: int) -> float:
    """Clarity C80 (dB): early (<=80 ms) vs. late energy."""
    return _clarity(rir, fs, 80.0)


def d50(rir: np.ndarray, fs: int) -> float:
    """Definition D50 (0..1): early (<=50 ms) energy fraction of total."""
    x = _as_mono(rir)
    energy = x ** 2
    total = float(energy.sum())
    if total <= 0:
        return float("nan")
    onset = find_onset(rir)
    split = onset + int(0.050 * fs)
    early = float(energy[onset:split].sum())
    return float(max(0.0, min(1.0, early / total)))


@dataclass
class RirMetrics:
    rt60_t20_s: float
    rt60_t30_s: float
    edt_s: float
    drr_db: float
    c50_db: float
    c80_db: float
    d50: float

    def as_dict(self) -> dict:
        return asdict(self)


def compute_all(rir: np.ndarray, fs: int) -> RirMetrics:
    """Compute every reference metric for one RIR waveform."""
    return RirMetrics(
        rt60_t20_s=rt60_t20(rir, fs),
        rt60_t30_s=rt60_t30(rir, fs),
        edt_s=edt(rir, fs),
        drr_db=drr_db(rir, fs),
        c50_db=c50_db(rir, fs),
        c80_db=c80_db(rir, fs),
        d50=d50(rir, fs),
    )


# --- aggregate helpers (with bootstrap CIs) --------------------------------- #

def mae(pred, true) -> float:
    pred, true = np.asarray(pred, float), np.asarray(true, float)
    m = np.isfinite(pred) & np.isfinite(true)
    return float(np.mean(np.abs(pred[m] - true[m]))) if m.any() else float("nan")


def rmse(pred, true) -> float:
    pred, true = np.asarray(pred, float), np.asarray(true, float)
    m = np.isfinite(pred) & np.isfinite(true)
    return float(np.sqrt(np.mean((pred[m] - true[m]) ** 2))) if m.any() else float("nan")


def bootstrap_ci(pred, true, stat=mae, n_boot: int = 1000, seed: int = 0, alpha: float = 0.05):
    """Bootstrap (percentile) CI for an error statistic. Deterministic via seed."""
    pred, true = np.asarray(pred, float), np.asarray(true, float)
    m = np.isfinite(pred) & np.isfinite(true)
    pred, true = pred[m], true[m]
    n = len(pred)
    if n < 2:
        return (float("nan"), float("nan"))
    rng = np.random.default_rng(seed)
    vals = np.empty(n_boot)
    for i in range(n_boot):
        idx = rng.integers(0, n, n)
        vals[i] = stat(pred[idx], true[idx])
    lo = float(np.percentile(vals, 100 * alpha / 2))
    hi = float(np.percentile(vals, 100 * (1 - alpha / 2)))
    return (lo, hi)
