import json

with open('data/questions.json', 'r', encoding='utf-8') as f:
    questions = json.load(f)

print(f"Total questions: {len(questions)}")
count = 0
for q in questions:
    needs_latex = False
    text_to_check = q.get('question', '') + ' '.join(q.get('options', [])) + q.get('solution', '')
    if any(char in text_to_check for char in ['Δ', 'π', '²', '³', 'σ', 'τ', '∝', '×', '≈', '√', 'θ', '∫']) or ('/' in text_to_check and any(c.isdigit() for c in text_to_check)):
        if '$' not in text_to_check:
            needs_latex = True
            
    if needs_latex:
        count += 1
        print(f"ID: {q['id']}")

print(f"Questions potentially needing LaTeX: {count}")
