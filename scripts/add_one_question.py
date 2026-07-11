import json
from pathlib import Path

QUESTIONS_PATH = Path("data/questions.json")

new_q = {
    "id": "gate_aptitude_01",
    "question": "If '->' denotes increasing order of intensity, then the meaning of the words [drizzle -> rain -> downpour] is analogous to [_______ -> quarrel -> feud]. Which one of the given options is appropriate to fill the blank?",
    "type": "mcq",
    "options": ["bicker", "bog", "dither", "dodge"],
    "correct": 0,
    "solution": "The sequence represents an increasing order of intensity. 'drizzle' is a light rain, 'rain' is standard, and 'downpour' is heavy rain. Similarly, 'bicker' is a mild argument, 'quarrel' is a stronger argument, and 'feud' is a prolonged and bitter quarrel.",
    "subject": "General Aptitude",
    "topic": "Verbal Aptitude",
    "marks": 1,
    "year": 2024,
    "difficulty": "Easy",
    "exam": "GATE",
    "paper": None,
}

existing = json.loads(QUESTIONS_PATH.read_text(encoding="utf-8"))
existing.append(new_q)
QUESTIONS_PATH.write_text(json.dumps(existing, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
print(f"Added 1 question ({len(existing)} total)")
