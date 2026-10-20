"""Dataset access for rirbench.

Two sources:
  * Local fixtures / a local staging dir (no network) — used by smoke tests.
  * The Hugging Face Hub (optional ``hub`` extra) — used for full runs.

Network calls set ``HF_HUB_DOWNLOAD_TIMEOUT`` so a stalled download fails fast
instead of hanging indefinitely.
"""
from __future__ import annotations

import os
from pathlib import Path
from typing import Iterator, Tuple

import numpy as np
import soundfile as sf

os.environ.setdefault("HF_HUB_DOWNLOAD_TIMEOUT", "30")

RIRMEGA_REPO = "mandipgoswami/rirmega"
RIRMEGA_EVAL_REPO = "mandipgoswami/rirmega-eval"
DEFAULT_REVISION = "v2.0.0"


def read_wav(path: str) -> Tuple[np.ndarray, int]:
    """Read a wav file -> (samples, sample_rate)."""
    wav, fs = sf.read(path)
    return np.asarray(wav), int(fs)


def iter_local_rirs(directory: str) -> Iterator[Tuple[str, np.ndarray, int]]:
    """Yield (sample_id, waveform, fs) for every .wav in a directory tree."""
    root = Path(directory)
    for p in sorted(root.rglob("*.wav")):
        wav, fs = read_wav(str(p))
        yield (p.stem, wav, fs)


def load_metadata_local(path: str):
    """Load a local metadata parquet/csv as a list of dict rows. Requires pandas."""
    import pandas as pd  # lazy: only needed when metadata is used

    p = Path(path)
    if p.suffix == ".parquet":
        df = pd.read_parquet(p)
    else:
        df = pd.read_csv(p)
    return df.to_dict("records")


def download_rirmega_metadata(revision: str = DEFAULT_REVISION) -> str:
    """Download metadata_v2.parquet from the Hub, returning the local path.
    Requires the ``hub`` extra. Honors HF_HUB_DOWNLOAD_TIMEOUT."""
    from huggingface_hub import hf_hub_download

    return hf_hub_download(
        repo_id=RIRMEGA_REPO,
        filename="metadata_v2.parquet",
        repo_type="dataset",
        revision=revision,
    )
