#!/usr/bin/env python3
"""Validate every submission JSON under submissions/ against the result schema.

Used by the GitHub Actions `validate-submission` workflow. Exits non-zero if any
submission is malformed. Passing this check means a submission is well-formed —
it is NOT a scientific endorsement (the verification tier is maintainer-assigned).
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "rirbench" / "src"))

from rirbench.schema import validate_dict, SCHEMA_VERSION  # noqa: E402
from pydantic import ValidationError  # noqa: E402


def main() -> int:
    sub_dir = ROOT / "submissions"
    files = [p for p in sub_dir.rglob("*.json")]
    if not files:
        print("no submissions found (ok)")
        return 0

    ok, bad = 0, 0
    for f in sorted(files):
        try:
            obj = json.loads(f.read_text(encoding="utf-8"))
            validate_dict(obj)
            print(f"VALID   ({SCHEMA_VERSION})  {f.relative_to(ROOT)}")
            ok += 1
        except (ValidationError, json.JSONDecodeError) as e:
            print(f"INVALID               {f.relative_to(ROOT)}\n  {e}")
            bad += 1

    print(f"\n{ok} valid, {bad} invalid")
    return 1 if bad else 0


if __name__ == "__main__":
    raise SystemExit(main())
