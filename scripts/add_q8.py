import json
import math
from pathlib import Path

# --- Generate SVG ---
svg_w = 600
svg_h = 400
margin_l = 80
margin_r = 20
margin_t = 20
margin_b = 60

plot_w = svg_w - margin_l - margin_r
plot_h = svg_h - margin_t - margin_b

def px(x):
    return margin_l + (x / 20000) * plot_w

def py(y):
    return margin_t + plot_h - (y / 1.0) * plot_h

path_d = []
for i in range(101):
    x = i * 200
    y = math.exp(-0.000171 * x)
    x_px = px(x)
    y_px = py(y)
    if i == 0:
        path_d.append(f"M {x_px},{y_px}")
    else:
        path_d.append(f"L {x_px},{y_px}")

svg = f"""<svg width="{svg_w}" height="{svg_h}" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="100%" height="100%" fill="white" />
  
  <!-- Grid Lines -->
"""
for y_tick in [0.2, 0.4, 0.6, 0.8]:
    svg += f'  <line x1="{px(0)}" y1="{py(y_tick)}" x2="{px(20000)}" y2="{py(y_tick)}" stroke="#888" stroke-dasharray="4,4" />\n'
for x_tick in [5000, 10000, 15000]:
    svg += f'  <line x1="{px(x_tick)}" y1="{py(0)}" x2="{px(x_tick)}" y2="{py(1)}" stroke="#ddd" />\n'

svg += f"""
  <!-- Border Box -->
  <rect x="{margin_l}" y="{margin_t}" width="{plot_w}" height="{plot_h}" fill="none" stroke="black" stroke-width="1.5" />
  
  <!-- Curve -->
  <path d="{' '.join(path_d)}" fill="none" stroke="#3b82f6" stroke-width="3" />
  
  <!-- Y-axis Labels -->
"""
for y_tick in [0, 0.2, 0.4, 0.6, 0.8, 1]:
    svg += f'  <text x="{margin_l - 10}" y="{py(y_tick) + 5}" font-family="sans-serif" font-size="14" text-anchor="end">{y_tick if y_tick == 1 or y_tick == 0 else f"{y_tick:.1f}"}</text>\n'

svg += f"""
  <!-- X-axis Labels -->
"""
for x_tick in [0, 5000, 10000, 15000, 20000]:
    svg += f'  <text x="{px(x_tick)}" y="{py(0) + 20}" font-family="sans-serif" font-size="14" text-anchor="middle">{x_tick}</text>\n'

svg += f"""
  <!-- Axes Titles -->
  <text x="{margin_l - 50}" y="{margin_t + plot_h/2}" font-family="sans-serif" font-size="16" text-anchor="middle" transform="rotate(-90, {margin_l - 50}, {margin_t + plot_h/2})">Mortality Risk of Cardiovascular Disease</text>
  <text x="{margin_l + plot_w/2}" y="{svg_h - 15}" font-family="sans-serif" font-size="16" text-anchor="middle">Steps/Day</text>
</svg>
"""

image_path = Path("public/images/gate_q8_plot.svg")
image_path.parent.mkdir(parents=True, exist_ok=True)
image_path.write_text(svg, encoding="utf-8")

# --- Append JSON ---
QUESTIONS_PATH = Path("data/questions.json")
new_qs = [
    {
        "id": "gate_aptitude_08",
        "question": "The plot below shows the relationship between the mortality risk of cardiovascular disease and the number of steps a person walks per day. Based on the data, which one of the following options is true?",
        "type": "mcq",
        "options": [
            "The risk reduction on increasing the steps/day from 0 to 10000 is less than the risk reduction on increasing the steps/day from 10000 to 20000.",
            "The risk reduction on increasing the steps/day from 0 to 5000 is less than the risk reduction on increasing the steps/day from 15000 to 20000.",
            "For any 5000 increment in steps/day the largest risk reduction occurs on going from 0 to 5000.",
            "For any 5000 increment in steps/day the largest risk reduction occurs on going from 15000 to 20000."
        ],
        "correct": 2,
        "solution": "The curve is convex and steeply decreasing at the beginning. The drop in mortality risk from 0 to 5000 steps is the steepest segment of the curve (from 1.0 down to approximately 0.43, a reduction of ~0.57). Any subsequent 5000 step increment yields a much smaller reduction in risk. Therefore, the largest risk reduction for a 5000 increment occurs between 0 and 5000 steps/day.",
        "subject": "General Aptitude",
        "topic": "Data Interpretation",
        "marks": 2,
        "year": 2024,
        "difficulty": "Medium",
        "exam": "GATE",
        "paper": None,
        "images": ["/images/gate_q8_plot.svg"]
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
