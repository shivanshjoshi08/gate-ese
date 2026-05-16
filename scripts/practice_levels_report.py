"""
Report how many Practice (AI) MCQ levels the bundled bank can cover.

Default app filters use exam=All for the AI bank so every MCQ counts.
Run from repo root:

  python scripts/practice_levels_report.py
  python scripts/practice_levels_report.py --path data/questions.json
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

BATCH = 10


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--path",
        type=Path,
        default=Path("data/questions.json"),
        help="Path to questions JSON array",
    )
    args = parser.parse_args()

    raw = json.loads(args.path.read_text(encoding="utf-8"))
    mcqs = [q for q in raw if str(q.get("type", "")).lower() == "mcq"]

    by_exam: dict[str, int] = {}
    for q in mcqs:
        ex = q.get("exam") or "unknown"
        by_exam[str(ex)] = by_exam.get(str(ex), 0) + 1

    n_all = len(mcqs)
    n_ese = sum(1 for q in mcqs if str(q.get("exam", "")).upper() == "ESE")

    blocks = max(1, (n_all + BATCH - 1) // BATCH)

    print(f"File: {args.path.resolve()}")
    print(f"Total MCQs: {n_all}  (ESE-tagged only: {n_ese})")
    print(f"Levels per full bank cycle (10 per level, last level may be shorter): {blocks}")
    print("By exam tag:", dict(sorted(by_exam.items(), key=lambda x: -x[1])))
    print()
    print(
        "Tip: add more rows to data/questions.json (or use the admin import pipeline) "
        "to grow the bank; this script does not auto-generate exam-quality questions."
    )


if __name__ == "__main__":
    main()
