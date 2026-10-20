"""Idempotent, surgical fixer for factual errors on the live rirmega HF card.

Three corrections, each exact-string and verified against ground truth:
  1. revision "v2.0.0"  -> "main"   (no such tag/branch exists; load_dataset 404s)
  2. github.com/mandip42/rirmega-v2-release -> github.com/mandip42/rirmega  (404)
  3. License footer "CC BY 4.0" -> "CC BY-NC 4.0" to match the authoritative
     YAML `license: cc-by-nc-4.0` (a card cannot advertise two licenses).

Dry-run by default; pass --apply to push. Re-running is safe: if a target
string is already corrected, that replacement is a no-op and is reported.
"""
from __future__ import annotations
import os, sys, difflib

os.environ.setdefault("HF_HUB_DISABLE_SYMLINKS_WARNING", "1")
from huggingface_hub import HfApi, hf_hub_download

REPO = "mandipgoswami/rirmega"
APPLY = "--apply" in sys.argv

# (description, old, new) — all must be exact substrings of the current card.
EDITS = [
    ("intro revision", "use revision **v2.0.0** for the v2 release.",
     "use revision **main** (the dataset publishes a single `main` branch; there is no `v2.0.0` tag)."),
    ("quickstart revision", 'load_dataset("mandipgoswami/rirmega", revision="v2.0.0", trust_remote_code=True)',
     'load_dataset("mandipgoswami/rirmega", revision="main", trust_remote_code=True)'),
    ("clone url", "git clone https://github.com/mandip42/rirmega-v2-release.git\ncd rirmega-v2-release && pip install -e . && python scripts/release_v2.py",
     "git clone https://github.com/mandip42/rirmega.git\ncd rirmega && pip install -e ."),
    ("bibtex github title", "  title  = {rirmega-v2-release},",
     "  title  = {RIR-Mega (code and v2 release)},"),
    ("bibtex github url", "  url    = {https://github.com/mandip42/rirmega-v2-release}",
     "  url    = {https://github.com/mandip42/rirmega}"),
    ("license footer", "Metadata and QC artifacts: CC BY 4.0 where applicable.",
     "Metadata and QC artifacts: CC BY-NC 4.0 (matching the `license: cc-by-nc-4.0` header)."),
]

card_path = hf_hub_download(REPO, "README.md", repo_type="dataset")
orig = open(card_path, encoding="utf-8").read()
new = orig
applied, missing = [], []
for desc, old, repl in EDITS:
    if old in new:
        new = new.replace(old, repl, 1)
        applied.append(desc)
    elif repl in new:
        applied.append(f"{desc} (already corrected)")
    else:
        missing.append(desc)

print("REPO:", REPO)
print("applied:", applied)
print("MISSING (string not found — card changed?):", missing or "none")
print("changed:", new != orig)

if new != orig:
    diff = difflib.unified_diff(orig.splitlines(), new.splitlines(),
                                "README.md (live)", "README.md (fixed)", lineterm="")
    print("\n".join(diff))

if APPLY and new != orig:
    if missing:
        print("\nREFUSING to apply: some target strings were not found.")
        sys.exit(2)
    HfApi().upload_file(
        path_or_fileobj=new.encode("utf-8"), path_in_repo="README.md",
        repo_id=REPO, repo_type="dataset",
        commit_message="Fix card: nonexistent v2.0.0 revision -> main; dead rirmega-v2-release repo -> rirmega; align license footer to cc-by-nc-4.0 header",
    )
    print("\nAPPLIED and pushed.")
elif not APPLY:
    print("\nDRY-RUN only. Re-run with --apply to push.")
