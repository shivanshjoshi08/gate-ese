import json

with open('data/questions.json', 'r', encoding='utf-8') as f:
    questions = json.load(f)

fixes = {
    "gate_ce_steel_09": {
        "question": "The density of steel used in structural design is generally taken as:",
        "options": ["$7850 \\text{ kg/m}^3$", "$8000 \\text{ kg/m}^3$", "$7500 \\text{ kg/m}^3$", "$8500 \\text{ kg/m}^3$"],
        "solution": "According to IS 800:2007, the mass density of structural steel is taken as $7850 \\text{ kg/m}^3$."
    },
    "ese_ce_irrigation_12": {
        "question": "The relation between Duty ($D$) in hectares/cumec, Delta ($\\Delta$) in meters, and Base period ($B$) in days is:",
        "options": ["$$ \\Delta = \\frac{8.64 B}{D} $$", "$$ \\Delta = \\frac{8.64 D}{B} $$", "$$ \\Delta = 8.64 B D $$", "$$ \\Delta = \\frac{864 B}{D} $$"],
        "solution": "The fundamental relation is $$ \\Delta = \\frac{8.64 B}{D} $$, where $\\Delta$ is in meters, $B$ is in days, and $D$ is in ha/cumec."
    },
    "gate_ce_env_15": {
        "question": "Biochemical Oxygen Demand (BOD) of safe drinking water must be:",
        "options": ["$0 \\text{ mg/L}$", "$5 \\text{ mg/L}$", "$10 \\text{ mg/L}$", "$20 \\text{ mg/L}$"],
        "solution": "Safe drinking water should be free of any organic biodegradable matter, hence its BOD must be strictly $0 \\text{ mg/L}$."
    },
    "gate_ce_cpm_17": {
        "question": "In a PERT network, the expected time ($t_e$) of an activity is given by:",
        "options": ["$$ \\frac{t_o + t_m + t_p}{6} $$", "$$ \\frac{t_o + 4t_m + t_p}{6} $$", "$$ \\frac{t_o + 2t_m + t_p}{6} $$", "$$ \\frac{t_o + 4t_m + t_p}{4} $$"],
        "solution": "The expected time in PERT follows a Beta distribution and is calculated as $$ t_e = \\frac{t_o + 4t_m + t_p}{6} $$, where $t_o$=optimistic, $t_m$=most likely, $t_p$=pessimistic time."
    },
    "gate_aptitude_03": {
        "question": "A student was supposed to multiply a positive real number $p$ with another positive real number $q$. Instead, the student divided $p$ by $q$. If the percentage error in the student's answer is $80\\%$, the value of $q$ is",
        "options": ["$5$", "$\\sqrt{2}$", "$2$", "$\\sqrt{5}$"],
        "solution": "The correct answer should be $pq$. The student calculated $p/q$. The error is $(pq - p/q)$. Percentage error = $$\\frac{pq - p/q}{pq} \\times 100 = 80$$ $$ 1 - \\frac{1}{q^2} = 0.8 $$ $$ \\frac{1}{q^2} = 0.2 $$ $$ q^2 = 5 \\implies q = \\sqrt{5} $$."
    },
    "gate_aptitude_04": {
        "question": "If the sum of the first 20 consecutive positive odd numbers is divided by $20^2$, the result is",
        "options": ["$1$", "$20$", "$2$", "$1/2$"],
        "solution": "The sum of the first $n$ consecutive positive odd numbers is given by the formula $n^2$. Here, $n = 20$, so the sum is $20^2$. When divided by $20^2$, the result is $1$."
    },
    "gate_aptitude_05": {
        "question": "The ratio of the number of girls to boys in class VIII is the same as the ratio of the number of boys to girls in class IX. The total number of students (boys and girls) in classes VIII and IX is 450 and 360, respectively. If the number of girls in classes VIII and IX is the same, then the number of girls in each class is",
        "options": ["150", "200", "250", "175"],
        "solution": "Let the number of girls be $g$. Boys in VIII = $450 - g$. Boys in IX = $360 - g$.\nRatio in VIII: $$ \\frac{g}{450 - g} $$. Ratio in IX: $$ \\frac{360 - g}{g} $$.\n$$ \\frac{g}{450 - g} = \\frac{360 - g}{g} $$\n$$ g^2 = 162000 - 450g - 360g + g^2 $$\n$$ 810g = 162000 \\implies g = 200 $$."
    },
    "gate_aptitude_07": {
        "question": "Seven identical cylindrical chalk-sticks are fitted tightly in a cylindrical container. The figure below shows the arrangement of the chalk-sticks inside the cylinder.\n\nThe length of the container is equal to the length of the chalk-sticks. The ratio of the occupied space to the empty space of the container is",
        "options": ["$5/2$", "$7/2$", "$9/2$", "$3$"],
        "solution": "Let the radius of one chalk-stick be $r$ and its length be $h$.\nThe volume of one chalk-stick is $\\pi r^2 h$.\nSince there are 7 chalk-sticks, the total occupied volume is $7\\pi r^2 h$.\n\nFrom the figure, the container's radius ($R$) must accommodate the central chalk-stick and one chalk-stick on each side along the diameter. So, the diameter of the container is 3 times the diameter of a chalk-stick. Therefore, $R = 3r$.\n\nThe total volume of the container is $$\\pi R^2 h = \\pi(3r)^2 h = 9\\pi r^2 h$$.\nThe empty space in the container = Total volume - Occupied volume = $$ 9\\pi r^2 h - 7\\pi r^2 h = 2\\pi r^2 h $$.\n\nThe ratio of the occupied space to the empty space = $$ \\frac{7\\pi r^2 h}{2\\pi r^2 h} = \\frac{7}{2} $$."
    },
    "gate_math_10": {
        "question": "Visualize a cube that is held with one of the four body diagonals aligned to the vertical axis. Rotate the cube about this axis such that its view remains unchanged. The magnitude of the minimum angle of rotation is",
        "options": ["$120^\\circ$", "$60^\\circ$", "$90^\\circ$", "$180^\\circ$"],
        "solution": "When a cube is rotated about its body diagonal, it possesses 3-fold rotational symmetry. This means that rotating the cube by $360^\\circ/3 = 120^\\circ$ brings it back to its original orientation."
    }
}

for q in questions:
    if q['id'] in fixes:
        q['question'] = fixes[q['id']]['question']
        q['options'] = fixes[q['id']]['options']
        q['solution'] = fixes[q['id']]['solution']
        if 'formulaUsed' in fixes[q['id']]:
            q['formulaUsed'] = fixes[q['id']]['formulaUsed']

with open('data/questions.json', 'w', encoding='utf-8') as f:
    json.dump(questions, f, indent=2, ensure_ascii=False)
