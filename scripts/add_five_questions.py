import json
from pathlib import Path

QUESTIONS_PATH = Path("data/questions.json")

new_qs = [
    {
        "id": "gate_aptitude_02",
        "question": "Statements:\n1. All heroes are winners.\n2. All winners are lucky people.\n\nInferences:\nI. All lucky people are heroes.\nII. Some lucky people are heroes.\nIII. Some winners are heroes.\n\nWhich of the above inferences can be logically deduced from statements 1 and 2?",
        "type": "mcq",
        "options": ["Only I and II", "Only II and III", "Only I and III", "Only III"],
        "correct": 1,
        "solution": "From 'All heroes are winners' and 'All winners are lucky people', we know 'All heroes are lucky people'. This means 'Some lucky people are heroes' is true (Inference II). Also, 'All heroes are winners' implies 'Some winners are heroes' (Inference III). 'All lucky people are heroes' is not necessarily true.",
        "subject": "General Aptitude",
        "topic": "Verbal Aptitude",
        "marks": 2,
        "year": 2024,
        "difficulty": "Medium",
        "exam": "GATE",
        "paper": None,
    },
    {
        "id": "gate_aptitude_03",
        "question": "A student was supposed to multiply a positive real number p with another positive real number q. Instead, the student divided p by q. If the percentage error in the student's answer is 80%, the value of q is",
        "type": "mcq",
        "options": ["5", "√2", "2", "√5"],
        "correct": 3,
        "solution": "The correct answer should be pq. The student calculated p/q. The error is (pq - p/q). Percentage error = ((pq - p/q) / pq) * 100 = 80.\n1 - 1/q^2 = 0.8\n1/q^2 = 0.2\nq^2 = 5\nq = √5.",
        "subject": "General Aptitude",
        "topic": "Quantitative Aptitude",
        "marks": 2,
        "year": 2024,
        "difficulty": "Medium",
        "exam": "GATE",
        "paper": None,
    },
    {
        "id": "gate_aptitude_04",
        "question": "If the sum of the first 20 consecutive positive odd numbers is divided by 20², the result is",
        "type": "mcq",
        "options": ["1", "20", "2", "1/2"],
        "correct": 0,
        "solution": "The sum of the first n consecutive positive odd numbers is given by the formula n². Here, n = 20, so the sum is 20². When divided by 20², the result is 1.",
        "subject": "General Aptitude",
        "topic": "Quantitative Aptitude",
        "marks": 1,
        "year": 2024,
        "difficulty": "Easy",
        "exam": "GATE",
        "paper": None,
    },
    {
        "id": "gate_aptitude_05",
        "question": "The ratio of the number of girls to boys in class VIII is the same as the ratio of the number of boys to girls in class IX. The total number of students (boys and girls) in classes VIII and IX is 450 and 360, respectively. If the number of girls in classes VIII and IX is the same, then the number of girls in each class is",
        "type": "mcq",
        "options": ["150", "200", "250", "175"],
        "correct": 1,
        "solution": "Let the number of girls be g. Boys in VIII = 450 - g. Boys in IX = 360 - g.\nRatio in VIII: g / (450 - g). Ratio in IX: (360 - g) / g.\ng / (450 - g) = (360 - g) / g\ng² = 162000 - 450g - 360g + g²\n810g = 162000\ng = 200.",
        "subject": "General Aptitude",
        "topic": "Quantitative Aptitude",
        "marks": 2,
        "year": 2024,
        "difficulty": "Medium",
        "exam": "GATE",
        "paper": None,
    },
    {
        "id": "gate_aptitude_06",
        "question": "In the given text, the blanks are numbered (i)–(iv). Select the best match for all the blanks.\n\nYoko Roi stands ____(i)____ as an author for standing ____(ii)____ as an honorary fellow, after she stood ____(iii)____ her writings that stand ____(iv)____ the freedom of speech.",
        "type": "mcq",
        "options": [
            "(i) out   (ii) down   (iii) in   (iv) for",
            "(i) down  (ii) out    (iii) by   (iv) in",
            "(i) down  (ii) out    (iii) for  (iv) in",
            "(i) out   (ii) down   (iii) by   (iv) for"
        ],
        "correct": 3,
        "solution": "'stands out' means to be prominent. 'standing down' means to resign. 'stood by' means to support or remain loyal to. 'stand for' means to represent or support a cause. Therefore, the sequence is out, down, by, for.",
        "subject": "General Aptitude",
        "topic": "Verbal Aptitude",
        "marks": 2,
        "year": 2024,
        "difficulty": "Medium",
        "exam": "GATE",
        "paper": None,
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
