import json

with open('data/questions.json', 'r', encoding='utf-8') as f:
    questions = json.load(f)

needs_latex_ids = [
    "SOM_001", "SOM_002", "SOM_003", "SOM_004", "SOM_005", "SOM_006", 
    "SOM_007", "SOM_008", "SOM_009", "SOM_010", "SOM_011", "SOM_012", 
    "SOM_013", "SOM_014", "SOM_015", "gate_ce_steel_09", "ese_ce_irrigation_12", 
    "gate_ce_steel_13", "gate_ce_env_15", "gate_ce_cpm_17", "gate_aptitude_03", 
    "gate_aptitude_04", "gate_aptitude_05", "gate_aptitude_07", "gate_aptitude_08", 
    "gate_math_10"
]

out = []
for q in questions:
    if q['id'] in needs_latex_ids:
        out.append({
            'id': q['id'],
            'question': q.get('question', ''),
            'options': q.get('options', []),
            'solution': q.get('solution', '')
        })

import os
os.makedirs('scratch', exist_ok=True)
with open('scratch/need_latex.json', 'w', encoding='utf-8') as f:
    json.dump(out, f, indent=2, ensure_ascii=False)
