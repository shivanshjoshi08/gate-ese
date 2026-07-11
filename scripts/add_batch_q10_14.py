import json
from pathlib import Path

QUESTIONS_PATH = Path("data/questions.json")

new_qs = [
    {
        "id": "gate_math_10",
        "question": "Visualize a cube that is held with one of the four body diagonals aligned to the vertical axis. Rotate the cube about this axis such that its view remains unchanged. The magnitude of the minimum angle of rotation is",
        "type": "mcq",
        "options": ["120°", "60°", "90°", "180°"],
        "correct": 0,
        "solution": "When a cube is rotated about its body diagonal, it possesses 3-fold rotational symmetry. This means that rotating the cube by 360°/3 = 120° brings it back to its original orientation.",
        "subject": "Engineering Mathematics",
        "topic": "Spatial Geometry",
        "marks": 1,
        "year": 2024,
        "difficulty": "Medium",
        "exam": "GATE",
        "paper": None,
    },
    {
        "id": "gate_math_11",
        "question": "A partial differential equation (∂²T/∂x²) + (∂²T/∂y²) = 0 is defined for the two-dimensional field T: T(x,y), inside a planar square domain of size 2 m × 2 m. Three boundary edges of the square domain are maintained at value T = 50, whereas the fourth boundary edge is maintained at T = 100.\n\nThe value of T at the center of the domain is",
        "type": "mcq",
        "options": ["50.0", "62.5", "75.0", "87.5"],
        "correct": 1,
        "solution": "For Laplace's equation ∇²T = 0 in a square domain, the value at the center is the average of the boundary conditions on the four edges. The boundary values are 50, 50, 50, and 100. Average = (50 + 50 + 50 + 100)/4 = 250/4 = 62.5.",
        "subject": "Engineering Mathematics",
        "topic": "Partial Differential Equations",
        "marks": 2,
        "year": 2024,
        "difficulty": "Medium",
        "exam": "GATE",
        "paper": None,
    },
    {
        "id": "gate_math_12",
        "question": "The statements P and Q are related to matrices A and B, which are conformable for both addition and multiplication.\n\nP: (A + B)ᵀ = Aᵀ + Bᵀ\nQ: (AB)ᵀ = AᵀBᵀ\n\nWhich one of the following options is CORRECT?",
        "type": "mcq",
        "options": ["P is TRUE and Q is FALSE", "Both P and Q are TRUE", "P is FALSE and Q is TRUE", "Both P and Q are FALSE"],
        "correct": 0,
        "solution": "The transpose of a sum is the sum of the transposes, so P is TRUE. However, the transpose of a product is the product of the transposes in reverse order: (AB)ᵀ = BᵀAᵀ. Therefore, statement Q is FALSE.",
        "subject": "Engineering Mathematics",
        "topic": "Linear Algebra",
        "marks": 1,
        "year": 2024,
        "difficulty": "Easy",
        "exam": "GATE",
        "paper": None,
    },
    {
        "id": "gate_math_13",
        "question": "The second derivative of a function f is computed using the fourth-order Central Divided Difference method with a step length h.\n\nThe CORRECT expression for the second derivative is",
        "type": "mcq",
        "options": [
            "1/(12h²) [ -f(i+2) + 16f(i+1) - 30f(i) + 16f(i-1) - f(i-2) ]",
            "1/(12h²) [ f(i+2) + 16f(i+1) - 30f(i) + 16f(i-1) - f(i-2) ]",
            "1/(12h²) [ -f(i+2) + 16f(i+1) - 30f(i) + 16f(i-1) + f(i-2) ]",
            "1/(12h²) [ -f(i+2) - 16f(i+1) + 30f(i) - 16f(i-1) - f(i-2) ]"
        ],
        "correct": 0,
        "solution": "The fourth-order central difference approximation for the second derivative is given by f''(x) ≈ (-f_{i+2} + 16f_{i+1} - 30f_i + 16f_{i-1} - f_{i-2}) / (12h²).",
        "subject": "Engineering Mathematics",
        "topic": "Numerical Methods",
        "marks": 2,
        "year": 2024,
        "difficulty": "Hard",
        "exam": "GATE",
        "paper": None,
    },
    {
        "id": "gate_math_14",
        "question": "The function f(x) = x³ - 27x + 4, 1 ≤ x ≤ 6 has",
        "type": "mcq",
        "options": ["Maxima point", "Minima point", "Saddle point", "Inflection point"],
        "correct": 1,
        "solution": "Given f(x) = x³ - 27x + 4. First derivative f'(x) = 3x² - 27. Setting f'(x) = 0 gives x² = 9, so x = 3 (since x is in [1, 6]). Second derivative f''(x) = 6x. At x = 3, f''(3) = 18 > 0, which indicates a local minima point.",
        "subject": "Engineering Mathematics",
        "topic": "Calculus",
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
