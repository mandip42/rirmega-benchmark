"""rirbench command-line interface.

    rirbench metrics <file.wav>              compute all metrics for one RIR
    rirbench track-a --smoke [--fixtures D]  Track A smoke run
    rirbench track-a --dir D [--meta M.parquet]  recompute + (optional) agreement
    rirbench track-b --smoke [--fixtures D]  Track B smoke run
    rirbench track-c --smoke                 Track C smoke run (WER/CER path)
    rirbench schema [--out schema.json]      export the result JSON Schema
    rirbench validate <submission.json>      validate a submission against schema
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

_FIX = str(Path(__file__).resolve().parents[2] / "fixtures")


def _print(obj) -> None:
    print(json.dumps(obj, indent=2, default=float))


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(prog="rirbench", description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)

    p = sub.add_parser("metrics", help="compute metrics for one RIR wav")
    p.add_argument("wav")

    for t in ("track-a", "track-b"):
        pt = sub.add_parser(t)
        pt.add_argument("--smoke", action="store_true")
        pt.add_argument("--fixtures", default=_FIX)
        pt.add_argument("--dir", default=None)
        pt.add_argument("--meta", default=None)
        pt.add_argument("--out", default=None)

    pc = sub.add_parser("track-c")
    pc.add_argument("--smoke", action="store_true")
    pc.add_argument("--out", default=None)

    ps = sub.add_parser("schema")
    ps.add_argument("--out", default=None)

    pv = sub.add_parser("validate")
    pv.add_argument("json")

    args = ap.parse_args(argv)

    if args.cmd == "metrics":
        from .data import read_wav
        from . import metrics as M

        wav, fs = read_wav(args.wav)
        _print(M.compute_all(wav, fs).as_dict())
        return 0

    if args.cmd == "track-a":
        from .tracks import track_a
        if args.smoke or not args.dir:
            res = track_a.run_smoke(args.fixtures)
        else:
            rows = track_a.recompute_dir(args.dir)
            res = {"track": "A", "recomputed": rows}
            if args.meta:
                from .data import load_metadata_local
                meta_rows = load_metadata_local(args.meta)
                pub = {r["sample_id"]: r for r in meta_rows if "sample_id" in r}
                res["agreement"] = track_a.agreement(rows, pub)
        _emit(res, args.out)
        return 0

    if args.cmd == "track-b":
        from .tracks import track_b
        res = track_b.run_smoke(args.fixtures) if (args.smoke or not args.dir) \
            else {"track": "B", "distribution": track_b.metric_distribution(args.dir)}
        _emit(res, args.out)
        return 0

    if args.cmd == "track-c":
        from .tracks import track_c
        # A fixed, documented example triple (clean recognizes perfectly; the
        # reverberant hypothesis drops/garbles words -> higher WER).
        res = track_c.run_smoke(
            reference="the quick brown fox jumps over the lazy dog",
            clean_hyp="the quick brown fox jumps over the lazy dog",
            reverb_hyp="the quick brown fox jumped over a lazy bog",
        )
        _emit(res, args.out)
        return 0

    if args.cmd == "schema":
        from .schema import export_json_schema
        _emit(export_json_schema(), args.out)
        return 0

    if args.cmd == "validate":
        from .schema import validate_dict
        from pydantic import ValidationError

        obj = json.loads(Path(args.json).read_text(encoding="utf-8"))
        try:
            validate_dict(obj)
        except ValidationError as e:
            print(f"INVALID: {args.json}\n{e}", file=sys.stderr)
            return 1
        print(f"VALID: {args.json}")
        return 0

    return 2


def _emit(obj, out) -> None:
    if out:
        Path(out).write_text(json.dumps(obj, indent=2, default=float), encoding="utf-8")
        print(f"wrote {out}")
    else:
        _print(obj)


if __name__ == "__main__":
    raise SystemExit(main())
