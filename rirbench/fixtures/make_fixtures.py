"""Generate tiny synthetic RIR fixtures for offline smoke tests.

Produces three exponentially-decaying synthetic impulse responses with known,
*increasing* reverberation (dry / medium / wet) so tests can assert that the
RT60 estimator orders them correctly. These are synthetic signals, not samples
from RIR-Mega, and exist only to exercise the pipeline with no network.

Run:  python -m rirbench_fixtures   (or:  python fixtures/make_fixtures.py)
"""
from __future__ import annotations

import os
from pathlib import Path

for _v in ("OPENBLAS_NUM_THREADS", "OMP_NUM_THREADS"):
    os.environ.setdefault(_v, "1")

import numpy as np
import soundfile as sf

FS = 16000
OUT = Path(__file__).resolve().parent


def synth_rir(t60_s: float, fs: int = FS, seed: int = 0) -> np.ndarray:
    """A direct impulse + exponentially-decaying Gaussian reverb tail whose
    energy decays ~60 dB over t60_s. Deterministic given seed."""
    rng = np.random.default_rng(seed)
    n = int(1.2 * t60_s * fs)
    t = np.arange(n) / fs
    # decay constant so that amplitude envelope falls 60 dB in t60 seconds
    tau = t60_s / (3.0 * np.log(10.0))
    tail = rng.standard_normal(n) * np.exp(-t / tau)
    rir = tail.copy()
    rir[0] += 1.0  # strong direct arrival at onset
    peak = np.max(np.abs(rir))
    return (rir / peak).astype(np.float32)


def main() -> int:
    specs = {"dry_t60_0p2": 0.2, "medium_t60_0p6": 0.6, "wet_t60_1p2": 1.2}
    for name, t60 in specs.items():
        sf.write(str(OUT / f"{name}.wav"), synth_rir(t60, seed=hash(name) % 2**31), FS)
        print(f"wrote {name}.wav (target T60={t60}s)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
