"""Bounded real Track A run against the rirmega `rir_output_1k` test split.

Downloads a bounded sample of real RIR wavs + the published metadata.csv,
recomputes acoustic metrics with rirbench, and reports recomputed-vs-published
agreement (bias / MAE / RMSE / bootstrap 95% CI). Honest about what is paired.
"""
from __future__ import annotations
import ast, json, os, sys
from pathlib import Path

os.environ.setdefault("OPENBLAS_NUM_THREADS", "1")
os.environ.setdefault("OMP_NUM_THREADS", "1")
os.environ.setdefault("HF_HUB_DOWNLOAD_TIMEOUT", "30")
os.environ.setdefault("HF_HUB_DISABLE_SYMLINKS_WARNING", "1")

import numpy as np
import pandas as pd
from huggingface_hub import hf_hub_download

from rirbench import metrics as M

REPO = "mandipgoswami/rirmega"
SPLIT = "test"
N = int(sys.argv[1]) if len(sys.argv) > 1 else 200
OUT = sys.argv[2] if len(sys.argv) > 2 else "trackA_sample.json"

# 1. published metadata
meta_path = hf_hub_download(
    repo_id=REPO, repo_type="dataset",
    filename="data/audio/rir_output_1k/metadata/metadata.csv",
)
df = pd.read_csv(meta_path)
df = df[df["split"] == SPLIT].reset_index(drop=True)
print(f"[meta] {len(df)} rows in split '{SPLIT}'", flush=True)

# flatten the published `metrics` dict column
def parse_metrics(s):
    try:
        return ast.literal_eval(s) if isinstance(s, str) else (s or {})
    except Exception:
        return {}

df["m"] = df["metrics"].map(parse_metrics)
df["pub_rt60"] = df["m"].map(lambda d: d.get("rt60"))
df["pub_drr_db"] = df["m"].map(lambda d: d.get("drr_db"))
df["pub_c50_db"] = df["m"].map(lambda d: d.get("c50_db"))
df["pub_c80_db"] = df["m"].map(lambda d: d.get("c80_db"))

rows = df.head(N)
print(f"[run] recomputing on {len(rows)} sampled test wavs", flush=True)

recs = []
for i, r in rows.iterrows():
    wav_rel = "data/audio/rir_output_1k/" + r["wav"]
    try:
        wp = hf_hub_download(repo_id=REPO, repo_type="dataset", filename=wav_rel)
    except Exception as e:
        print(f"  skip {r['id']}: download {type(e).__name__}", flush=True)
        continue
    import soundfile as sf
    wav, fs = sf.read(wp)
    wav = np.asarray(wav)
    if wav.ndim > 1:          # multi-mic array -> first channel, documented convention
        wav = wav[:, 0]
    m = M.compute_all(wav, int(fs)).as_dict()
    recs.append({
        "id": r["id"], "fs": int(fs),
        "rc_rt60_t20_s": m["rt60_t20_s"], "rc_rt60_t30_s": m["rt60_t30_s"],
        "rc_edt_s": m["edt_s"], "rc_drr_db": m["drr_db"],
        "rc_c50_db": m["c50_db"], "rc_c80_db": m["c80_db"], "rc_d50": m["d50"],
        "pub_rt60": r["pub_rt60"], "pub_drr_db": r["pub_drr_db"],
        "pub_c50_db": r["pub_c50_db"], "pub_c80_db": r["pub_c80_db"],
    })
    if len(recs) % 50 == 0:
        print(f"  ...{len(recs)} done", flush=True)

print(f"[run] recomputed {len(recs)} files", flush=True)

# 3. agreement: recomputed vs published, per metric
# RT60 published is broadband; compare to recomputed T20 and T30 separately.
PAIRS = [
    ("rt60_broadband_vs_t20", "rc_rt60_t20_s", "pub_rt60"),
    ("rt60_broadband_vs_t30", "rc_rt60_t30_s", "pub_rt60"),
    ("drr_db", "rc_drr_db", "pub_drr_db"),
    ("c50_db", "rc_c50_db", "pub_c50_db"),
    ("c80_db", "rc_c80_db", "pub_c80_db"),
]

def finite_pairs(recs, rc, pub):
    pr, tr = [], []
    for d in recs:
        a, b = d.get(rc), d.get(pub)
        if a is None or b is None:
            continue
        a, b = float(a), float(b)
        if np.isfinite(a) and np.isfinite(b):
            pr.append(a); tr.append(b)
    return pr, tr

report = {
    "track": "A", "mode": "bounded-real-sample",
    "dataset": {"repo": REPO, "config": "rir_output_1k", "split": SPLIT,
                "n_recomputed": len(recs)},
    "estimator": "rirbench Schroeder backward-integration (T20/T30), pure-numpy LS slope",
    "channel_convention": "first channel of linear8 array",
    "note": ("Published rt60 is a single broadband value; recomputed T20/T30 are "
             "independent estimates from the waveform. Agreement reflects estimator "
             "+ definitional differences, not dataset error."),
    "fields": {},
}
for name, rc, pub in PAIRS:
    pr, tr = finite_pairs(recs, rc, pub)
    if len(pr) < 2:
        report["fields"][name] = {"n_paired": len(pr), "status": "insufficient"}
        continue
    diff = np.asarray(pr) - np.asarray(tr)
    lo, hi = M.bootstrap_ci(pr, tr, stat=M.mae, n_boot=1000, seed=0)
    report["fields"][name] = {
        "n_paired": len(pr),
        "bias": float(np.mean(diff)),
        "mae": M.mae(pr, tr),
        "rmse": M.rmse(pr, tr),
        "mae_ci95": [lo, hi],
        "ci_method": "bootstrap-1000-seed0",
        "recomputed_mean": float(np.mean(pr)),
        "published_mean": float(np.mean(tr)),
    }

Path(OUT).write_text(json.dumps(report, indent=2), encoding="utf-8")
print("[done] wrote", OUT, flush=True)
print(json.dumps(report["fields"], indent=2))
