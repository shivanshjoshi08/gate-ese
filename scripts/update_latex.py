import json

file_path = "data/questions.json"

with open(file_path, "r", encoding="utf-8") as f:
    questions = json.load(f)

for q in questions:
    if q["id"] == "gate_math_11":
        q["question"] = "A partial differential equation $$ \\frac{\\partial^2 T}{\\partial x^2} + \\frac{\\partial^2 T}{\\partial y^2} = 0 $$ is defined for the two-dimensional field T: $T(x,y)$, inside a planar square domain of size $2\\text{ m} \\times 2\\text{ m}$. Three boundary edges of the square domain are maintained at value $T = 50$, whereas the fourth boundary edge is maintained at $T = 100$.\n\nThe value of $T$ at the center of the domain is"
        q["solution"] = "For Laplace's equation $$ \\nabla^2 T = 0 $$ in a square domain, the value at the center is the average of the boundary conditions on the four edges. The boundary values are 50, 50, 50, and 100. Average = $\\frac{50 + 50 + 50 + 100}{4} = 62.5$."
        
    elif q["id"] == "gate_math_12":
        q["question"] = "The statements P and Q are related to matrices A and B, which are conformable for both addition and multiplication.\n\nP: $$ (A + B)^T = A^T + B^T $$\nQ: $$ (AB)^T = A^T B^T $$\n\nWhich one of the following options is CORRECT?"
        q["solution"] = "The transpose of a sum is the sum of the transposes, so P is TRUE. However, the transpose of a product is the product of the transposes in reverse order: $$ (AB)^T = B^T A^T $$. Therefore, statement Q is FALSE."

    elif q["id"] == "gate_math_13":
        q["question"] = "The second derivative of a function $f$ is computed using the fourth-order Central Divided Difference method with a step length $h$.\n\nThe CORRECT expression for the second derivative is"
        q["options"] = [
            "$$ \\frac{1}{12h^2} [ -f_{i+2} + 16f_{i+1} - 30f_i + 16f_{i-1} - f_{i-2} ] $$",
            "$$ \\frac{1}{12h^2} [ f_{i+2} + 16f_{i+1} - 30f_i + 16f_{i-1} - f_{i-2} ] $$",
            "$$ \\frac{1}{12h^2} [ -f_{i+2} + 16f_{i+1} - 30f_i + 16f_{i-1} + f_{i-2} ] $$",
            "$$ \\frac{1}{12h^2} [ -f_{i+2} - 16f_{i+1} + 30f_i - 16f_{i-1} - f_{i-2} ] $$"
        ]
        q["solution"] = "The fourth-order central difference approximation for the second derivative is given by $$ f''(x) \\approx \\frac{-f_{i+2} + 16f_{i+1} - 30f_i + 16f_{i-1} - f_{i-2}}{12h^2} $$."

    elif q["id"] == "gate_math_14":
        q["question"] = "The function $$ f(x) = x^3 - 27x + 4 $$, for $$ 1 \\leq x \\leq 6 $$ has"

with open(file_path, "w", encoding="utf-8") as f:
    json.dump(questions, f, indent=2, ensure_ascii=False)
