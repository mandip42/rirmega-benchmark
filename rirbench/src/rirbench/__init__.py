"""rirbench — independent benchmark & evaluation suite for RIR-Mega.

Public API:
  * ``metrics``  — room-acoustics estimators (RT60, DRR, C50/C80, D50, EDT).
  * ``schema``   — versioned benchmark-result schema + validation.
  * ``tracks``   — Track A / B / C runners.
"""
from . import metrics, schema  # noqa: F401

__version__ = "1.0.0"
