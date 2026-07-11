import json
from pathlib import Path

QUESTIONS_PATH = Path("data/questions.json")

new_qs = [
    {
        "id": "gate_math_15",
        "question": "Consider two Ordinary Differential Equations (ODEs):\n\nP: $$ \\frac{dy}{dx} = \\frac{x^4+3x^2y^2+2y^4}{x^3y} $$\n\nQ: $$ \\frac{dy}{dx} = \\frac{-y^2}{x^2} $$\n\nWhich one of the following options is CORRECT?",
        "type": "mcq",
        "options": [
            "P is a homogeneous ODE and Q is an exact ODE.",
            "P is a homogeneous ODE and Q is not an exact ODE.",
            "P is a nonhomogeneous ODE and Q is an exact ODE.",
            "P is a nonhomogeneous ODE and Q is not an exact ODE."
        ],
        "correct": 1,
        "solution": "For ODE P, the numerator is a homogeneous polynomial of degree 4, and the denominator is also of degree 4. Thus, it is a homogeneous ODE. For ODE Q, rearranging gives $$ y^2 dx + x^2 dy = 0 $$. Here $$ M = y^2 $$ and $$ N = x^2 $$. We check for exactness: $$ \\frac{\\partial M}{\\partial y} = 2y $$ and $$ \\frac{\\partial N}{\\partial x} = 2x $$. Since they are not equal, Q is NOT an exact ODE. Therefore, P is homogeneous and Q is not exact.",
        "subject": "Engineering Mathematics",
        "topic": "Differential Equations",
        "marks": 2,
        "year": 2024,
        "difficulty": "Medium",
        "exam": "GATE",
        "paper": "CE"
    },
    {
        "id": "gate_ce_16",
        "question": "A 3 m long, horizontal, rigid, uniform beam PQ has negligible mass. The beam is subjected to a 3 kN concentrated vertically downward force at 1 m from P, as shown in the figure. The beam is resting on vertical linear springs at the ends P and Q. For the spring at the end P, the spring constant $K_P = 100 \\text{ kN/m}$.\n\nIf the beam DOES NOT rotate under the application of the force and displaces only vertically, the value of the spring constant $K_Q$ (in kN/m) for the spring at the end Q is",
        "images": ["/images/gate_q16_diagram.svg"],
        "type": "mcq",
        "options": [
            "150",
            "100",
            "50",
            "200"
        ],
        "correct": 2,
        "solution": "If the beam does not rotate and translates only vertically, the deflection at both springs is equal, i.e., $$ \\delta_P = \\delta_Q = \\delta $$. The spring forces are $$ R_P = K_P \\delta $$ and $$ R_Q = K_Q \\delta $$. Taking moments about the point of application of the 3 kN force: $$ R_P \\times 1 = R_Q \\times 2 $$. Substituting the spring forces: $$ K_P \\delta \\times 1 = K_Q \\delta \\times 2 $$. Therefore, $$ K_P = 2 K_Q $$. Given $$ K_P = 100 \\text{ kN/m} $$, we get $$ K_Q = 100 / 2 = 50 \\text{ kN/m} $$.",
        "subject": "Civil Engineering",
        "topic": "Structural Analysis",
        "marks": 2,
        "year": 2024,
        "difficulty": "Medium",
        "exam": "GATE",
        "paper": "CE"
    },
    {
        "id": "gate_ce_17",
        "question": "Consider the statements P and Q.\n\nP: In a Pure project organization, the project manager maintains complete authority and has maximum control over the project.\n\nQ: A Matrix organization structure facilitates quick response to changes, conflicts, and project needs.\n\nWhich one of the following options is CORRECT?",
        "type": "mcq",
        "options": [
            "Both P and Q are TRUE",
            "P is TRUE and Q is FALSE",
            "Both P and Q are FALSE",
            "P is FALSE and Q is TRUE"
        ],
        "correct": 0,
        "solution": "Statement P is TRUE because in a pure project organization, team members report solely to the project manager, granting maximum control. Statement Q is also TRUE because matrix organizations allow for efficient sharing of resources and faster responses to dynamic project needs across departments. Thus, both statements are true.",
        "subject": "Civil Engineering",
        "topic": "Construction Management",
        "marks": 1,
        "year": 2024,
        "difficulty": "Easy",
        "exam": "GATE",
        "paper": "CE"
    },
    {
        "id": "gate_ce_18",
        "question": "For a thin-walled section shown in the figure, points P, Q, and R are located on the major bending axis X - X of the section. Point Q is located on the web whereas point S is located at the intersection of the web and the top flange of the section.\n\nQualitatively, the shear center of the section lies at",
        "images": ["/images/gate_q18_diagram.svg"],
        "type": "mcq",
        "options": [
            "P",
            "Q",
            "R",
            "S"
        ],
        "correct": 2,
        "solution": "Since the left portion of the flanges (6 cm) is longer than the right portion (3 cm), the horizontal shear flows in the left portions will be greater. This creates a net resultant horizontal shear force to the right in the top flange and to the left in the bottom flange, which produces a clockwise torque about the web. For equilibrium (zero twist), the applied vertical shear force must produce an equal and opposite counter-clockwise torque. Therefore, the downward shear force must be applied to the right of the web, i.e., at point R.",
        "subject": "Civil Engineering",
        "topic": "Solid Mechanics",
        "marks": 2,
        "year": 2024,
        "difficulty": "Hard",
        "exam": "GATE",
        "paper": "CE"
    },
    {
        "id": "gate_ce_19",
        "question": "Consider the following data for a project of 300 days duration.\n\nBudgeted Cost of Work Scheduled (BCWS) = Rs. 200\nBudgeted Cost of Work Performed (BCWP) = Rs. 150\nActual Cost of Work Performed (ACWP) = Rs. 190\n\nThe 'schedule variance' for the project is",
        "type": "mcq",
        "options": [
            "(-)Rs. 50",
            "(-)50 days",
            "(+)Rs. 50",
            "(+)50 days"
        ],
        "correct": 0,
        "solution": "In Earned Value Management, Schedule Variance (SV) is defined as the difference between the Budgeted Cost of Work Performed (BCWP) and the Budgeted Cost of Work Scheduled (BCWS). Thus, SV = BCWP - BCWS = 150 - 200 = -50. It is expressed in terms of cost (Rs.), so the answer is (-) Rs. 50.",
        "subject": "Civil Engineering",
        "topic": "Construction Management",
        "marks": 1,
        "year": 2024,
        "difficulty": "Easy",
        "exam": "GATE",
        "paper": "CE"
    }
]

with open(QUESTIONS_PATH, "r", encoding="utf-8") as f:
    data = json.load(f)

# Remove any existing with same IDs to avoid duplicates if re-run
existing_ids = {q["id"] for q in new_qs}
data = [q for q in data if q["id"] not in existing_ids]

data.extend(new_qs)

with open(QUESTIONS_PATH, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"Appended {len(new_qs)} questions.")
