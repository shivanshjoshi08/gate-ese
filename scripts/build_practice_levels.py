"""
Build data/practice-levels.json — fixed 10-question sets per level from bundled MCQs.

Run from repo root after editing data/questions.json:

  python scripts/build_practice_levels.py
"""

from __future__ import annotations

import json
from pathlib import Path

BATCH = 10
QUESTIONS_PATH = Path("data/questions.json")
OUT_PATH = Path("data/practice-levels.json")


def main() -> None:
    raw = json.loads(QUESTIONS_PATH.read_text(encoding="utf-8"))
    mcqs = sorted(
        [q for q in raw if str(q.get("type", "")).lower() == "mcq"],
        key=lambda q: str(q.get("id", "")),
    )
    ids = [str(q["id"]) for q in mcqs if q.get("id")]

    levels: list[dict] = []
    for i in range(0, len(ids), BATCH):
        chunk = ids[i : i + BATCH]
        if not chunk:
            break
        levels.append({"level": len(levels) + 1, "questionIds": chunk})

    doc = {
        "version": 1,
        "batchSize": BATCH,
        "source": "data/questions.json",
        "totalMcqs": len(ids),
        "levelCount": len(levels),
        "levels": levels,
    }

    OUT_PATH.write_text(
        json.dumps(doc, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    print(f"Wrote {OUT_PATH} — {len(levels)} levels from {len(ids)} MCQs")


if __name__ == "__main__":
    main()
