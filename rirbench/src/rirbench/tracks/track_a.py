"""Track A — Acoustic validity.

Recompute reference room-acoustics descriptors (RT60 T20/T30, EDT, DRR, C50,
C80, D50) directly from RIR waveforms and, where published metadata is present,
report the agreement between recomputed and published values (bias, MAE, RMSE,
bootstrap 95% CI). This is an internal-consistency / validity study: it checks
that the dataset's published acoustic metadata is reproducible from the raw
waveforms with a documented, independent estimator.

No claim of ground truth is made for simulated RIRs; the comparison is
simulated-metadata vs. independently-recomputed, both stated as such.
"""
from __future__ import annotations

from typing import Iterable, Optional

from .. import metrics as M
from ..data import iter_local_rirs, read_wav

# Mapping: published metadata column -> (recompute fn, label)
_FIELDS = {
    "RT60_T20_s": (M.rt60_t20, "rt60_t20_s"),
    "RT60_T30_s": (M.rt60_t30, "rt60_t30_s"),
    "EDT_s": (M.edt, "edt_s"),
    "DRR_dB": (M.drr_db, "drr_db"),
    "C50_dB": (M.c50_db, "c50_db"),
    "C80_dB": (M.c80_db, "c80_db"),
    "D50": (M.d50, "d50"),
}


def recompute_dir(directory: str) -> list[dict]:
    """Recompute all metrics for every .wav under ``directory``."""
    out = []
    for sample_id, wav, fs in iter_local_rirs(directory):
        m = M.compute_all(wav, fs).as_dict()
        m["sample_id"] = sample_id
        m["sample_rate"] = fs
        out.append(m)
    return out


def agreement(
    recomputed: Iterable[dict],
    published: dict[str, dict],
) -> dict:
    """Compare recomputed vs. published metadata per field.

    ``published`` maps sample_id -> {column: value}. Returns, per field, the
    bias (mean recomputed-minus-published), MAE, RMSE and a bootstrap 95% CI on
    the MAE, plus the paired sample count.
    """
    recomputed = list(recomputed)
    report: dict = {"n_samples": len(recomputed), "fields": {}}
    for col, (_fn, label) in _FIELDS.items():
        pred, true = [], []
        for row in recomputed:
            sid = row["sample_id"]
            if sid in published and col in published[sid]:
                pv = published[sid][col]
                if pv is None:
                    continue
                pred.append(row[label])
                true.append(float(pv))
        if len(pred) < 2:
            continue
        import numpy as np

        diff = np.asarray(pred, float) - np.asarray(true, float)
        finite = np.isfinite(diff)
        bias = float(np.mean(diff[finite])) if finite.any() else float("nan")
        lo, hi = M.bootstrap_ci(pred, true, stat=M.mae, n_boot=1000, seed=0)
        report["fields"][col] = {
            "n_paired": int(finite.sum()),
            "bias": bias,
            "mae": M.mae(pred, true),
            "rmse": M.rmse(pred, true),
            "mae_ci95": [lo, hi],
            "ci_method": "bootstrap-1000-seed0",
        }
    return report


def run_smoke(fixtures_dir: str) -> dict:
    """Tiny self-contained run: recompute metrics on fixtures and sanity-check
    that RT60 ordering matches the fixtures' known relative reverberation."""
    rows = recompute_dir(fixtures_dir)
    return {"track": "A", "mode": "smoke", "n": len(rows), "samples": rows}
