"""Merge JSON array file(s) into data/questions.json (skip duplicate ids)."""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
QUESTIONS_PATH = ROOT / "data" / "questions.json"


def merge_file(path: Path) -> int:
    incoming = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(incoming, list):
        raise ValueError(f"{path} must be a JSON array")
    existing = json.loads(QUESTIONS_PATH.read_text(encoding="utf-8"))
    ids = {q.get("id") for q in existing}
    added = 0
    for q in incoming:
        qid = q.get("id")
        if not qid or qid in ids:
            continue
        existing.append(q)
        ids.add(qid)
        added += 1
    QUESTIONS_PATH.write_text(
        json.dumps(existing, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    return added


def main() -> None:
    paths = [Path(p) for p in sys.argv[1:]] or list((ROOT / "data" / "import").glob("*.json"))
    total = 0
    for p in paths:
        n = merge_file(p)
        print(f"{p.name}: +{n}")
        total += n
    bank = json.loads(QUESTIONS_PATH.read_text(encoding="utf-8"))
    print(f"Total added: {total} ({len(bank)} in bank)")


if __name__ == "__main__":
    main()
