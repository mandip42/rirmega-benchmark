#!/usr/bin/env python3
"""Add an 'Independent benchmark & evaluation portal' cross-link section to the
RIR-Mega-family dataset cards on Hugging Face.

SAFE + ADDITIVE + IDEMPOTENT:
  * Only inserts a new section wrapped in a <!-- rirmega-benchmark-portal --> ...
    <!-- /rirmega-benchmark-portal --> marker. Existing content is never edited.
  * If the marker is already present, the card is left unchanged (no duplicate).
  * Dry-run by default; pass --apply to push to the Hub.

Usage:
  python update_hf_cards.py            # dry run, writes previews to scratch
  python update_hf_cards.py --apply    # push commits to the Hub
"""
from __future__ import annotations

import argparse
import os
import sys

os.environ.setdefault("HF_HUB_DOWNLOAD_TIMEOUT", "30")

from huggingface_hub import HfApi, hf_hub_download

PORTAL_URL = os.environ.get("RIRMEGA_PORTAL_URL", "https://rirmega-benchmark.vercel.app")
REPO_URL = "https://github.com/mandip42/rirmega-benchmark"

REPOS = [
    "mandipgoswami/rirmega",
    "mandipgoswami/rirmega-eval",
    "mandipgoswami/rir-mega-speech",
    "mandipgoswami/RIR-Bench-Hard",
]

MARKER_OPEN = "<!-- rirmega-benchmark-portal -->"
MARKER_CLOSE = "<!-- /rirmega-benchmark-portal -->"


def section() -> str:
    return f"""{MARKER_OPEN}
## Independent benchmark & evaluation portal

An independent, reproducible benchmark portal provides interactive data
exploration, a five-minute reproducibility quickstart, and an open,
pull-request-based result-submission workflow for this dataset.

- Portal: {PORTAL_URL}
- Benchmark suite & submissions: {REPO_URL}

The suite runs three tracks — **acoustic validity** (recompute RT60/DRR/clarity
from the waveforms and compare to the published metadata), **synthetic-to-real
generalization** (a protocol against measured corpora under their own licenses),
and **downstream ASR robustness**. Results are grouped by provenance
(self-reported / artifact-checked / independently-reproduced); passing automated
validation does not imply endorsement.
{MARKER_CLOSE}
"""


def insert(card: str) -> str | None:
    """Return the updated card, or None if already present (idempotent)."""
    if MARKER_OPEN in card:
        return None
    block = section()
    # Prefer to place it just before an existing '## Citation' heading; else append.
    needle = "\n## Citation"
    idx = card.find(needle)
    if idx != -1:
        return card[:idx] + "\n" + block + card[idx:]
    return card.rstrip() + "\n\n" + block


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--apply", action="store_true", help="push to the Hub (default: dry run)")
    args = ap.parse_args()

    api = HfApi()
    who = api.whoami().get("name")
    print(f"authenticated as: {who}")
    print(f"portal url: {PORTAL_URL}")
    scratch = os.path.join(os.environ.get("KIROCREW_SCRATCH", "."), "hf_card_previews")
    os.makedirs(scratch, exist_ok=True)

    changed, skipped, failed = [], [], []
    for repo in REPOS:
        try:
            p = hf_hub_download(repo, "README.md", repo_type="dataset")
            card = open(p, encoding="utf-8").read()
        except Exception as e:
            print(f"  SKIP (no README) {repo}: {e!r}")
            failed.append(repo)
            continue

        updated = insert(card)
        if updated is None:
            print(f"  UNCHANGED (marker present) {repo}")
            skipped.append(repo)
            continue

        preview = os.path.join(scratch, repo.split("/")[1] + ".md")
        open(preview, "w", encoding="utf-8").write(updated)
        print(f"  WOULD UPDATE {repo}  (+{len(updated) - len(card)} chars)  preview: {preview}")

        if args.apply:
            api.upload_file(
                path_or_fileobj=updated.encode("utf-8"),
                path_in_repo="README.md",
                repo_id=repo,
                repo_type="dataset",
                commit_message="docs: add independent benchmark & evaluation portal cross-link",
            )
            print(f"  PUSHED {repo}")
            changed.append(repo)

    print("\nsummary:")
    print(f"  {'pushed' if args.apply else 'would update'}: {changed if args.apply else [r for r in REPOS if r not in skipped and r not in failed]}")
    print(f"  unchanged: {skipped}")
    print(f"  failed: {failed}")
    if not args.apply:
        print("\n(dry run — re-run with --apply to push)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
