"""Unit tests for rirbench.metrics on synthetic RIRs with known properties."""
import numpy as np
import pytest

from rirbench import metrics as M


def synth_rir(t60_s, fs=16000, seed=0):
    rng = np.random.default_rng(seed)
    n = int(1.2 * t60_s * fs)
    t = np.arange(n) / fs
    tau = t60_s / (3.0 * np.log(10.0))
    rir = rng.standard_normal(n) * np.exp(-t / tau)
    rir[0] += 1.0
    return rir / np.max(np.abs(rir)), fs


def test_rt60_recovers_order():
    """RT60 estimates must increase with the synthesized reverberation."""
    dry, fs = synth_rir(0.2)
    wet, _ = synth_rir(1.2)
    assert M.rt60_t20(dry, fs) < M.rt60_t20(wet, fs)


def test_rt60_in_sane_range():
    wav, fs = synth_rir(0.6)
    rt = M.rt60_t20(wav, fs)
    assert 0.02 <= rt <= 20.0
    # recovered value should be in the right ballpark of the target
    assert 0.2 <= rt <= 1.5


def test_t30_close_to_t20_for_exp_decay():
    """For a clean exponential decay, T20 and T30 should roughly agree."""
    wav, fs = synth_rir(0.8, seed=3)
    t20, t30 = M.rt60_t20(wav, fs), M.rt60_t30(wav, fs)
    assert abs(t20 - t30) < 0.4


def test_drr_higher_for_dry():
    dry, fs = synth_rir(0.2)
    wet, _ = synth_rir(1.5)
    assert M.drr_db(dry, fs) > M.drr_db(wet, fs)


def test_clarity_ordering():
    """C80 >= C50 is not guaranteed, but both finite and C50 lower for wetter."""
    dry, fs = synth_rir(0.2)
    wet, _ = synth_rir(1.5)
    assert np.isfinite(M.c50_db(dry, fs))
    assert M.c50_db(dry, fs) > M.c50_db(wet, fs)


def test_d50_bounds():
    for t60 in (0.2, 0.6, 1.2):
        wav, fs = synth_rir(t60)
        d = M.d50(wav, fs)
        assert 0.0 <= d <= 1.0


def test_silence_returns_nan():
    z = np.zeros(1000)
    assert np.isnan(M.rt60_t20(z, 16000))


def test_mae_rmse_and_bootstrap():
    pred = [1.0, 2.0, 3.0, 4.0]
    true = [1.1, 1.9, 3.2, 3.8]
    assert M.mae(pred, true) == pytest.approx(0.15, abs=1e-9)
    lo, hi = M.bootstrap_ci(pred, true, n_boot=200, seed=1)
    assert lo <= M.mae(pred, true) <= hi

    # determinism: same seed -> same CI
    lo2, hi2 = M.bootstrap_ci(pred, true, n_boot=200, seed=1)
    assert (lo, hi) == (lo2, hi2)
