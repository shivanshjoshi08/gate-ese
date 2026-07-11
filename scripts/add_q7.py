import json
from pathlib import Path

QUESTIONS_PATH = Path("data/questions.json")

new_qs = [
    {
        "id": "gate_aptitude_07",
        "question": "Seven identical cylindrical chalk-sticks are fitted tightly in a cylindrical container. The figure below shows the arrangement of the chalk-sticks inside the cylinder.\n\nThe length of the container is equal to the length of the chalk-sticks. The ratio of the occupied space to the empty space of the container is",
        "type": "mcq",
        "options": ["5/2", "7/2", "9/2", "3"],
        "correct": 1,
        "solution": "Let the radius of one chalk-stick be r and its length be h.\nThe volume of one chalk-stick is πr²h.\nSince there are 7 chalk-sticks, the total occupied volume is 7πr²h.\n\nFrom the figure, the container's radius (R) must accommodate the central chalk-stick and one chalk-stick on each side along the diameter. So, the diameter of the container is 3 times the diameter of a chalk-stick. Therefore, R = 3r.\n\nThe total volume of the container is πR²h = π(3r)²h = 9πr²h.\nThe empty space in the container = Total volume - Occupied volume = 9πr²h - 7πr²h = 2πr²h.\n\nThe ratio of the occupied space to the empty space = 7πr²h / 2πr²h = 7/2.",
        "subject": "General Aptitude",
        "topic": "Spatial Aptitude",
        "marks": 2,
        "year": 2024,
        "difficulty": "Hard",
        "exam": "GATE",
        "paper": None,
        "images": ["/images/gate_q7_diagram.svg"]
    }
]

existing = json.loads(QUESTIONS_PATH.read_text(encoding="utf-8"))
ids = {q.get("id") for q in existing}
added = 0
for q in new_qs:
    if q["id"] not in ids:
        existing.append(q)
        ids.add(q["id"])
        added += 1

QUESTIONS_PATH.write_text(json.dumps(existing, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
print(f"Added {added} questions ({len(existing)} total)")
