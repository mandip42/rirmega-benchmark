"""Smoke tests for the three tracks and the result schema."""
import json
from pathlib import Path

import pytest

from rirbench.tracks import track_a, track_b, track_c
from rirbench import schema

FIX = str(Path(__file__).resolve().parents[1] / "fixtures")


def test_track_a_smoke_runs():
    res = track_a.run_smoke(FIX)
    assert res["track"] == "A"
    assert res["n"] >= 3
    # every sample has all seven metrics
    for s in res["samples"]:
        for k in ("rt60_t20_s", "drr_db", "c50_db", "d50"):
            assert k in s


def test_track_a_agreement_shape():
    rows = track_a.recompute_dir(FIX)
    # fabricate a published table from the recomputed values (self-agreement==0 bias)
    pub = {r["sample_id"]: {"RT60_T20_s": r["rt60_t20_s"], "DRR_dB": r["drr_db"]}
           for r in rows}
    rep = track_a.agreement(rows, pub)
    assert rep["fields"]["RT60_T20_s"]["bias"] == pytest.approx(0.0, abs=1e-9)
    assert rep["fields"]["RT60_T20_s"]["mae"] == pytest.approx(0.0, abs=1e-9)


def test_track_b_smoke_runs():
    res = track_b.run_smoke(FIX)
    assert res["track"] == "B"
    assert "distribution" in res
    # self-shift must be ~0
    for k, v in res["self_shift"].items():
        assert abs(v["delta_mean"]) < 1e-9


def test_track_c_wer_degrades_with_reverb():
    res = track_c.run_smoke(
        reference="the quick brown fox jumps over the lazy dog",
        clean_hyp="the quick brown fox jumps over the lazy dog",
        reverb_hyp="the quick brown fox jumped over a lazy bog",
    )
    assert res["clean"]["wer"] == 0.0
    assert res["reverb"]["wer"] > res["clean"]["wer"]


def test_schema_roundtrip_and_version():
    js = schema.export_json_schema()
    assert js["title"] == "BenchmarkResult"
    good = {
        "schema_version": schema.SCHEMA_VERSION,
        "submission_id": "example-2026-10-19",
        "date": "2026-10-19",
        "track": "A",
        "dataset": "mandipgoswami/rirmega",
        "dataset_version": "v2.0.0",
        "benchmark_version": "1.0.0",
        "split": "test",
        "method": "schroeder-reference",
        "sample_size": 400,
        "metrics": [{"name": "MAE_RT60_T20_s", "value": 0.12, "unit": "s"}],
    }
    obj = schema.validate_dict(good)
    assert obj.verification == schema.Verification.self_reported


def test_schema_rejects_bad_version():
    bad = {
        "schema_version": "9.9.9",
        "submission_id": "x", "date": "2026-10-19", "track": "A",
        "dataset": "d", "dataset_version": "v2.0.0", "benchmark_version": "1.0.0",
        "split": "test", "method": "m", "sample_size": 1,
        "metrics": [{"name": "x", "value": 1.0}],
    }
    with pytest.raises(Exception):
        schema.validate_dict(bad)
