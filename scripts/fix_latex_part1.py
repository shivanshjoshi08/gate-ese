import json

with open('data/questions.json', 'r', encoding='utf-8') as f:
    questions = json.load(f)

fixes = {
    "SOM_001": {
        "question": "A steel rod of $20 \\text{ mm}$ diameter and $2 \\text{ m}$ length is subjected to an axial tensile load of $50 \\text{ kN}$. If $E = 200 \\text{ GPa}$, the elongation of the rod is:",
        "options": ["$0.159 \\text{ mm}$", "$0.318 \\text{ mm}$", "$1.59 \\text{ mm}$", "$3.18 \\text{ mm}$"],
        "solution": "$$ \\Delta L = \\frac{PL}{AE} $$ $$ A = \\frac{\\pi}{4} \\times (20 \\text{ mm})^2 = 314.16 \\text{ mm}^2 $$ $$ \\Delta L = \\frac{50 \\times 10^3 \\text{ N} \\times 2000 \\text{ mm}}{314.16 \\text{ mm}^2 \\times 200 \\times 10^3 \\text{ N/mm}^2} \\approx 1.59 \\text{ mm} $$",
        "formulaUsed": ["$$ \\Delta L = \\frac{PL}{AE} $$", "$$ A = \\frac{\\pi d^2}{4} $$"]
    },
    "SOM_002": {
        "question": "A bar of length $L$ and uniform cross-section $A$ is subjected to an axial pull $P$. The strain energy stored per unit volume is:",
        "options": ["$$ \\frac{P^2}{2AE} $$", "$$ \\frac{\\sigma^2}{2E} $$", "$$ \\frac{P\\sigma}{2A} $$", "$$ \\frac{\\sigma^2 E}{2} $$"],
        "solution": "Strain energy per unit volume = $$ \\frac{1}{2} \\times \\text{stress} \\times \\text{strain} = \\frac{1}{2} \\times \\sigma \\times \\left(\\frac{\\sigma}{E}\\right) = \\frac{\\sigma^2}{2E} $$",
        "formulaUsed": ["$$ \\frac{U}{V} = \\frac{\\sigma^2}{2E} $$"]
    },
    "SOM_003": {
        "question": "The relationship between modulus of elasticity ($E$), modulus of rigidity ($G$), and bulk modulus ($K$) is given by:",
        "options": ["$$ E = \\frac{9KG}{3K+G} $$", "$$ E = \\frac{9KG}{G+3K} $$", "$$ E = \\frac{3KG}{9K+G} $$", "$$ E = \\frac{3KG}{K+3G} $$"],
        "solution": "Standard relation: $$ E = \\frac{9KG}{3K + G} $$, equivalently $$ \\frac{1}{E} = \\frac{1}{3G} + \\frac{1}{9K} $$."
    },
    "SOM_004": {
        "question": "A cantilever beam of length $L$ carries a point load $W$ at the free end. The bending moment at a distance $x$ from the fixed end is:",
        "options": ["$$ W(L-x) $$", "$$ Wx $$", "$$ W(L+x) $$", "$$ W(L/2 - x) $$"],
        "solution": "For a cantilever with point load at the free end, BM at section $x$ from fixed end = $$ W \\times (\\text{lever arm}) = W(L - x) $$."
    },
    "SOM_005": {
        "question": "A solid circular shaft of diameter $d$ transmits power $P$ at $N$ rpm. The maximum shear stress induced is $\\tau$. If the diameter is doubled and speed halved while power remains the same, the new maximum shear stress will be:",
        "options": ["$$ \\tau/4 $$", "$$ \\tau/8 $$", "$$ \\tau/16 $$", "$$ \\tau/2 $$"],
        "solution": "$$ P = \\frac{2\\pi NT}{60} $$ and $$ \\tau \\propto \\frac{T}{d^3} $$. For constant $P$, $$ T \\propto \\frac{1}{N} $$, so $$ \\tau \\propto \\frac{P}{N d^3} $$. New $$ \\tau' \\propto \\frac{P}{(N/2)(2d)^3} = \\frac{P}{4N d^3} = \\frac{\\tau}{4} $$.",
        "formulaUsed": ["$$ P = \\frac{2\\pi NT}{60} $$", "$$ \\tau \\propto \\frac{1}{N d^3} $$"]
    },
    "SOM_006": {
        "question": "A simply supported beam of span $L$ carries a uniformly distributed load $w$ per unit length. The maximum bending moment occurs at:",
        "options": ["Supports", "Mid-span", "$L/3$ from left", "$L/4$ from left"],
        "solution": "For UDL on a simply supported beam, maximum bending moment occurs at mid-span: $$ M_{\\text{max}} = \\frac{wL^2}{8} $$."
    },
    "SOM_007": {
        "question": "The ratio of Euler's buckling load for a column with both ends fixed to that of both ends hinged (same length and section) is:",
        "options": ["1", "2", "4", "8"],
        "solution": "$$ P_{\\text{cr}} = \\frac{\\pi^2 EI}{L_e^2} $$. For hinged ends $L_e = L$; for fixed ends $L_e = L/2$. Ratio = $$ \\frac{L^2}{(L/2)^2} = 4 $$."
    },
    "SOM_008": {
        "question": "A beam of rectangular cross-section ($b \\times d$) is subjected to a shear force $F$. The maximum shear stress developed is:",
        "options": ["$$ 1.5 \\frac{F}{bd} $$", "$$ 1.2 \\frac{F}{bd} $$", "$$ 0.5 \\frac{F}{bd} $$", "$$ 0.75 \\frac{F}{bd} $$"],
        "solution": "For a rectangular section, $$ \\tau_{\\text{max}} = 1.5 \\times (\\text{average shear stress}) = 1.5 \\times \\frac{F}{bd} $$."
    },
    "SOM_009": {
        "question": "A steel bar of $400 \\text{ mm}^2$ cross-section is subjected to an axial tensile load of $80 \\text{ kN}$. If $E = 200 \\text{ GPa}$ and Poisson's ratio $= 0.3$, the lateral strain is:",
        "options": ["$$ 300 \\times 10^{-6} $$", "$$ 200 \\times 10^{-6} $$", "$$ 150 \\times 10^{-6} $$", "$$ 100 \\times 10^{-6} $$"],
        "solution": "$$ \\sigma = \\frac{P}{A} = \\frac{80 \\times 10^3}{400} = 200 \\text{ MPa} $$. $$ \\varepsilon_{\\text{axial}} = \\frac{\\sigma}{E} = 10^{-3} $$. Lateral strain magnitude = $$ \\nu \\times \\varepsilon_{\\text{axial}} = 0.3 \\times 10^{-3} = 300 \\times 10^{-6} $$."
    },
    "SOM_010": {
        "question": "The principal stresses at a point in a stressed material are $120 \\text{ MPa}$ (tensile) and $80 \\text{ MPa}$ (compressive). The maximum shear stress at the point is:",
        "options": ["$100 \\text{ MPa}$", "$40 \\text{ MPa}$", "$60 \\text{ MPa}$", "$20 \\text{ MPa}$"],
        "solution": "$$ \\tau_{\\text{max}} = \\frac{\\sigma_1 - \\sigma_2}{2} = \\frac{120 - (-80)}{2} = \\frac{200}{2} = 100 \\text{ MPa} $$."
    },
    "SOM_011": {
        "question": "A rod of length $1 \\text{ m}$ and diameter $20 \\text{ mm}$ is subjected to a tensile load. The extension measured is $0.5 \\text{ mm}$. The modulus of elasticity is $200 \\text{ GPa}$. The strain energy stored in the rod is:",
        "options": ["$7.85 \\text{ J}$", "$5.0 \\text{ J}$", "$2.5 \\text{ J}$", "$10 \\text{ J}$"],
        "solution": "$$ U = \\frac{1}{2} P \\Delta L $$. With $$ A = \\frac{\\pi}{4} \\times (0.02)^2 \\text{ m}^2 $$, $$ P = \\frac{\\Delta L \\times A \\times E}{L} \\approx 31.42 \\text{ kN} $$, hence $$ U = \\frac{1}{2} \\times 31.42 \\times 10^3 \\times 0.5 \\times 10^{-3} \\approx 7.85 \\text{ J} $$."
    },
    "SOM_012": {
        "question": "A hollow circular shaft of outer diameter $100 \\text{ mm}$ and inner diameter $50 \\text{ mm}$ is subjected to a torque of $10 \\text{ kN}\\cdot\\text{m}$. The maximum shear stress (in MPa) is approximately:",
        "options": ["$54.3$", "$68.0$", "$34.0$", "$85.0$"],
        "solution": "$$ \\tau_{\\text{max}} = \\frac{TR}{J} $$ with $$ J = \\frac{\\pi}{32} (D^4 - d^4) = 9.20 \\times 10^{-6} \\text{ m}^4 $$, $$ R = 50 \\text{ mm} $$. $$ \\tau = \\frac{10 \\times 10^3 \\times 0.05}{9.20 \\times 10^{-6}} \\approx 54.3 \\text{ MPa} $$."
    },
    "SOM_013": {
        "question": "A beam of uniform rectangular cross-section is subjected to a bending moment $M$. If the depth is doubled while keeping width constant, the bending stress will:",
        "options": ["Become half", "Become one-fourth", "Become double", "Remain same"],
        "solution": "$$ \\sigma = \\frac{My}{I} $$. For rectangle $$ I = \\frac{bd^3}{12} $$, $$ y = \\frac{d}{2} \\implies \\sigma = \\frac{6M}{bd^2} $$. Doubling $d$ reduces $\\sigma$ to one-fourth."
    },
    "SOM_014": {
        "question": "A column of circular cross-section of diameter $40 \\text{ mm}$ and length $2 \\text{ m}$ is hinged at both ends. If $E = 200 \\text{ GPa}$, Euler's buckling load (in kN) is:",
        "options": ["$62$", "$124$", "$248$", "$496$"],
        "solution": "$$ I = \\frac{\\pi d^4}{64} = 1.257 \\times 10^{-7} \\text{ m}^4 $$. $$ P_{\\text{cr}} = \\frac{\\pi^2 EI}{L^2} = \\frac{\\pi^2 \\times 200 \\times 10^9 \\times 1.257 \\times 10^{-7}}{4} \\approx 62 \\text{ kN} $$."
    },
    "SOM_015": {
        "question": "A simply supported beam of span $4 \\text{ m}$ carries a point load of $15 \\text{ kN}$ at mid-span. The cross-section is rectangular $100 \\text{ mm}$ wide and $150 \\text{ mm}$ deep. The maximum bending stress (in MPa) is:",
        "options": ["$40$", "$80$", "$120$", "$160$"],
        "solution": "$$ M_{\\text{max}} = \\frac{PL}{4} = \\frac{15 \\times 4}{4} = 15 \\text{ kN}\\cdot\\text{m} $$. $$ Z = \\frac{bd^2}{6} = 375 \\times 10^3 \\text{ mm}^3 $$. $$ \\sigma = \\frac{M}{Z} = \\frac{15 \\times 10^6}{375 \\times 10^3} = 40 \\text{ MPa} $$."
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
