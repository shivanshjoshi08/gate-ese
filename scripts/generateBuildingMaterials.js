const fs = require("fs");
const path = require("path");

const OUT = path.join(__dirname, "..", "data", "building-materials.json");

function q(n, text, options, image = false) {
  return {
    question_number: n,
    question_text: text,
    options,
    ...(image ? { image: `fig${n}` } : {}),
  };
}

const questions = [
  q(
    1,
    `Consider the following statements:
1. IS 3583 refers to Burnt Clay Paving Bricks.
2. IS 5779 refers to Burnt Clay Soling Bricks.
3. IS 3952 refers to Burnt Clay Hollow Bricks.
4. IS 2222 refers to Burnt Clay Lay Bricks.
Which of the above statements are correct?`,
    {
      a: "1, 2 and 3 only",
      b: "1, 2 and 4 only",
      c: "3 and 4 only",
      d: "1, 2, 3 and 4",
    }
  ),
  q(
    2,
    `Consider the following statements:
1. A high aggregate impact value indicates strong aggregates.
2. A low aggregate crushing value indicates high crushing strength of aggregates.
3. Aggregates having elongation index values greater than 15% are generally considered suitable for pavement construction.
4. Flakiness index of aggregates should not be less than 25% for use in road construction.
Which of the above statements are correct?`,
    {
      a: "2 and 3 only",
      b: "2 and 4 only",
      c: "1 and 3 only",
      d: "1 and 4 only",
    }
  ),
  q(
    3,
    `Consider the following statements regarding refractory bricks in furnaces:
1. The furnace is fired at temperatures more than 1700°C.
2. Silica content in the soil should be less than 40%.
3. Water absorption of bricks should not exceed 10%.
4. Chrome bricks are known as basic bricks.
Which of the above statements are correct?`,
    {
      a: "1 and 2 only",
      b: "2 and 4 only",
      c: "1 and 3 only",
      d: "3 and 4 only",
    }
  ),
  q(
    4,
    `Consider the following statements about lime:
1. Calcination of limestone results in quick lime.
2. Lime produced from pure variety of chalk is hydraulic lime.
3. Hydrated lime is obtained by treating quick lime with water.
Which of the above statements are correct?`,
    {
      a: "1, 2 and 3",
      b: "1 and 2 only",
      c: "2 and 3 only",
      d: "1 and 3 only",
    }
  ),
  q(
    5,
    `Consider the following statements:
1. If more water is added to concrete for increasing its workability, it results into concrete of low strength.
2. No slump is an indication of a good workable concrete.
3. Higher the slump of concrete, lower will be its workability.
4. Workability of concrete is affected by water content as well as water-cement ratio.
Which of the above statements are correct?`,
    {
      a: "1 and 3 only",
      b: "2 and 3 only",
      c: "1 and 4 only",
      d: "2 and 4 only",
    }
  ),
  q(
    6,
    `Pozzolana used as an admixture in concrete has the following advantages:
1. It improves workability with lesser amount of water.
2. It increases the heat of hydration and so lets the concrete set quickly.
3. It increases the resistance of concrete to attack by salts and sulphates.
4. It leaches out calcium hydroxide.
Select the correct answer using the codes given below:`,
    {
      a: "1, 2 and 3 only",
      b: "1, 2 and 4 only",
      c: "1, 3 and 4 only",
      d: "2, 3 and 4 only",
    }
  ),
  q(
    7,
    `Consider the following particulars in respect of a concrete mix design:

| | Weight | Specific Gravity |
|---|---|---|
| Cement | 400 kg/m³ | 3.2 |
| Fine aggregates | | 2.5 |
| Coarse aggregates | 1040 kg/m³ | 2.6 |
| Water | 200 kg/m³ | 1.0 |

What shall be the weight of the Fine aggregates?`,
    {
      a: "520 kg/m³",
      b: "570 kg/m³",
      c: "690 kg/m³",
      d: "1000 kg/m³",
    }
  ),
  q(
    8,
    `Consider the following statements regarding Cyclopean Concrete:
1. Size of aggregate is more than 150 mm.
2. Size of aggregate is less than 150 mm.
3. High slump.
4. High temperature rise due to heat of hydration.
Which of the above statements are correct?`,
    {
      a: "1 and 3 only",
      b: "1 and 4 only",
      c: "2 and 3 only",
      d: "2 and 4 only",
    }
  ),
  q(
    9,
    `What is the stress at the section x-x for the bar ABCD with uniform cross-section 1000 mm²? (Subjected to forces: 60 kN tensile at A, 20 kN compressive at B, 30 kN tensile at C, 110 kN tensile at D)`,
    {
      a: "20 N/mm² (Tensile)",
      b: "30 N/mm² (Compressive)",
      c: "80 N/mm² (Tensile)",
      d: "50 N/mm² (Compressive)",
    },
    true
  ),
  q(
    10,
    `The total elongation of the structural element (fixed at one end, free at the other end, and of varying cross-section) as shown in the figure, when subjected to load 2P at the free end is (Segments: Area A length l, Area 3A length l, Area A/2 length l):`,
    {
      a: "6.66 (P l) / (AE)",
      b: "5.55 (P l) / (AE)",
      c: "4.44 (P l) / (AE)",
      d: "3.33 (P l) / (AE)",
    },
    true
  ),
  q(
    11,
    `A chain, working a crane, has sectional area of 625 mm² and transmits a load of 10 kN. When the load is being lowered at a uniform rate of 40 m/min, the chain gets jammed suddenly at which time the length of the chain unwound is 10 m. Assuming E = 200 GPa, the stress induced in the chain due to this sudden jamming is`,
    {
      a: "100.6 N/mm²",
      b: "120.4 N/mm²",
      c: "140.2 N/mm²",
      d: "160.0 N/mm²",
    }
  ),
  q(
    12,
    `A simply supported beam of span l and flexural rigidity EI carries a unit load at its mid-span. The strain energy at this condition in the beam due to bending is`,
    {
      a: "l³ / (48 EI)",
      b: "l³ / (96 EI)",
      c: "l³ / (192 EI)",
      d: "l³ / (16 EI)",
    }
  ),
  q(
    13,
    `In mild steel specimens subjected to tensile test cycle, the elastic limit in tension is raised and the elastic limit in compression is lowered. This is called`,
    {
      a: "Annealing effect",
      b: "Bauschinger effect",
      c: "Strain rate effect",
      d: "Fatigue effect",
    }
  ),
  q(
    14,
    `A solid uniform metal bar of diameter D mm and length l mm hangs vertically from its upper end. The density of the material is ρ N/mm³ and its modulus of elasticity is E N/mm². The total extension of the rod due to its own weight would be`,
    {
      a: "(ρ l²) / (2 E)",
      b: "(ρ l) / (2 E)",
      c: "(ρ l) / (4 E)",
      d: "(ρ l²) / (4 E)",
    }
  ),
  q(
    15,
    `The state of stress at a certain point in a stressed body is as shown in the figure. Normal stress in x-direction is 80 MPa (Tensile) and in y-direction is 40 MPa (Compressive). The radius of the Mohr's circle for this state of stress will be`,
    {
      a: "60 MPa",
      b: "40 MPa",
      c: "20 MPa",
      d: "10 MPa",
    },
    true
  ),
  q(
    16,
    `For the state of stress shown in the figure (90 MPa Tensile in x-direction, 30 MPa Compressive in y-direction, and 25 MPa Shear Stress), the maximum and minimum principal stresses (taking tensile stress as +, and compressive stress as -) will be`,
    {
      a: "95 MPa and (-35) MPa",
      b: "60 MPa and 30 MPa",
      c: "95 MPa and (-30) MPa",
      d: "60 MPa and 35 MPa",
    },
    true
  ),
  q(
    17,
    `Consider the following statements:
1. The shear stress distribution across the section of a circular shaft subjected to twisting varies parabolically.
2. The shear stress at the centre of a circular shaft under twisting moment is zero.
3. The shear stress at the extreme fibres of a circular shaft under twisting moment is maximum.
Which of the above statements is/are correct?`,
    {
      a: "1, 2 and 3",
      b: "1 only",
      c: "2 only",
      d: "3 only",
    }
  ),
  q(
    18,
    `A uniform T-shaped arm of weight W, pinned about a horizontal point C, is supported by a vertical spring of stiffness K. The extension of the spring is`,
    {
      a: "(3 W) / (4 K)",
      b: "(4 W) / (3 K)",
      c: "(3 K) / (4 W)",
      d: "(4 K) / (3 W)",
    }
  ),
  q(
    19,
    `The span of a cantilever beam is 2 m. The cross-section of the beam is a hollow square with external sides 100 mm; and its I = 4 × 10⁵ mm⁴. The safe bending stress for the beam material is 100 N/mm². The safe concentrated load at the free end would be`,
    {
      a: "100 N",
      b: "200 N",
      c: "300 N",
      d: "400 N",
    }
  ),
  q(
    20,
    `A stepped steel shaft is subjected to a clockwise torque of 10 Nm at its free end. Shear modulus of steel is 80 GPa. The strain energy stored in the shaft is`,
    {
      a: "1.73 Nmm",
      b: "2.52 Nmm",
      c: "3.46 Nmm",
      d: "4.12 Nmm",
    }
  ),
  q(
    21,
    `An overhanging beam of uniform EI is loaded as shown below. The deflection at the free end is (Span between supports A and B is l, overhang from B to free end C is l/2, and a point load W is applied at C)`,
    {
      a: "W l³ / (81 EI)",
      b: "W l³ / (8 EI)",
      c: "W l³ / (27 EI)",
      d: "2 W l³ / (27 EI)",
    },
    true
  ),
  q(
    22,
    `The principal stresses at a point in a stressed material are σ1 = 200 N/mm², σ2 = 150 N/mm², and σ3 = 200 N/mm². E = 210 kN/mm² and μ = 0.3. The volumetric strain will be`,
    {
      a: "8.954 × 10⁻⁴",
      b: "8.954 × 10⁻²",
      c: "6.54 × 10⁻³",
      d: "6.54 × 10⁻⁴",
    }
  ),
  q(
    23,
    `A mild steel bar, circular in cross-section, tapers from 40 mm diameter to 20 mm diameter over its length of 800 mm. It is subjected to an axial pull of 20 kN. E = 2 × 10⁵ N/mm². The increase in the length of the rod will be`,
    {
      a: "1 / (10π) mm",
      b: "2 / (5π) mm",
      c: "4 / (5π) mm",
      d: "1 / (5π) mm",
    }
  ),
  q(
    24,
    `The state of stress at a point in an elastic material, with yield stress of 200 MPa in simple tension, and Poisson's ratio 0.3, is as shown in the figure (2σ compressive stress vertically and 1.4σ tensile stress horizontally). The permissible value of σ by maximum strain theory is`,
    {
      a: "75 MPa",
      b: "100 MPa",
      c: "150 MPa",
      d: "200 MPa",
    },
    true
  ),
  q(
    25,
    `Consider the following statements in respect of arched construction made of voussoirs:
1. The superimposed load is transferred to the sidewalls only by the strength of cohesion of the mortar between the voussoirs.
2. The arch may fail under crushing when the compressive stress or thrust in it exceeds the safe crushing strength of the voussoir material.
3. Every element in the arch is subjected to compression only.
4. Failure of the arch due to the sliding of any voussoir past the adjacent one due to transverse shear can be avoided by reducing the height of the voussoirs.
Which of the above statements are correct?`,
    {
      a: "1 and 4 only",
      b: "1 and 3 only",
      c: "2 and 4 only",
      d: "2 and 3 only",
    }
  ),
  q(
    26,
    `A homogeneous prismatic simply supported beam is subjected to a point load F. The load can be placed anywhere along the span of the beam. The very maximum flexural stress developed in the beam is (Span L, Width B, Depth D)`,
    {
      a: "3FL / (2BD²)",
      b: "3FL / (4BD²)",
      c: "2FL / (3BD²)",
      d: "4FL / (3BD²)",
    }
  ),
  q(
    27,
    `The ratio (s/t) of, (s) stiffness of a beam (of constant EI) at the near end when the far end is hinged, to (t) the stiffness of the same beam at the near end when the far end is fixed, is`,
    {
      a: "1/2",
      b: "3/4",
      c: "1/1",
      d: "4/3",
    }
  ),
  q(
    28,
    `Which of the following are examples of indeterminate structures?
1. Fixed beam
2. Continuous beam
3. Two-hinged arch
4. Beam overhanging on both sides
Select the correct answer using the codes given below:`,
    {
      a: "1, 2 and 3 only",
      b: "1, 2 and 4 only",
      c: "1, 3 and 4 only",
      d: "2, 3 and 4 only",
    }
  ),
  q(
    29,
    `The rotational stiffness coefficient indicated as K11 for the frame with details as shown is (Joint C is connected to a hinged support A via a member of EI, L and to a fixed support B via a member of EI, L)`,
    {
      a: "9EI / L",
      b: "8EI / L",
      c: "7EI / L",
      d: "6EI / L",
    },
    true
  ),
  q(
    30,
    `A single-bay portal frame of height h fixed at the base is subjected to a horizontal displacement Δ at the top. With constant EI, the base moment developed is proportional to`,
    {
      a: "1/h",
      b: "1/h²",
      c: "1/h³",
      d: "1/h⁴",
    }
  ),
  q(
    31,
    `Consider the following statements:
1. When the number of members (n) and joints (j) are such that the equation n = (2j - 3) is satisfied, the framed structure is said to be a perfect structure.
2. In a redundant frame, the number of members is less than that required for a perfect frame.
3. If, in a framed structure, the number of members provided is more than that required for a perfect frame, it is called as a deficient frame.
Which of the above statements is/are correct?`,
    {
      a: "1, 2 and 3",
      b: "1 only",
      c: "2 only",
      d: "3 only",
    }
  ),
  q(
    32,
    `A cantilever beam, 3 m long, carries a uniformly distributed load over the entire length. If the slope at the free end is 1°, the deflection at the free end is`,
    {
      a: "49.27 mm",
      b: "39.27 mm",
      c: "30.27 mm",
      d: "20.27 mm",
    }
  ),
  q(
    33,
    `The maximum bending moment at a given section, in which a train of wheel loads moves, occurs when the average load on the left segment is
1. Equal to the average load on the right segment.
2. More than the average load on the right segment.
3. Less than the average load on the right segment.
Select the correct answer using the codes given below:`,
    {
      a: "1, 2 and 3",
      b: "1 only",
      c: "2 only",
      d: "3 only",
    }
  ),
  q(
    34,
    `A single degree of freedom system of mass 22 kg and stiffness 17 kN/m vibrates freely. If damping in the system is 2%, the cyclic frequency and the damped circular frequency, respectively, are nearly`,
    {
      a: "4.4 Hz and 0.88 rad/sec",
      b: "0.88 Hz and 27.8 rad/sec",
      c: "4.4 Hz and 27.8 rad/sec",
      d: "0.88 Hz and 0.88 rad/sec",
    }
  ),
  q(
    35,
    `A cable of insignificant weight, 18 m long, is supported at its two ends, 16 m apart, at the same level. The cable supports at its mid-reach a load of 120 N. The tension in the cable is nearly`,
    {
      a: "136 N",
      b: "131 N",
      c: "126 N",
      d: "121 N",
    }
  ),
  q(
    36,
    `The design strength of a tension member is governed by
1. Rupture at a critical section
2. Yielding of gross area
3. Block shear of end region
Select the correct answer using the codes given below:`,
    {
      a: "1 only",
      b: "2 only",
      c: "3 only",
      d: "1, 2 and 3",
    }
  ),
  q(
    37,
    `Two parallel rails are running on railway sleepers. The centre-to-centre distance between the rails is 'b' with the sleepers projecting by an amount 'a' at each end beyond the rails. When the train passes over the rails, the reaction exerted by the ground can be taken as uniformly distributed over the sleeper. The ratio b/a for the condition that the maximum bending moment is as small as possible is`,
    {
      a: "2.83",
      b: "2.90",
      c: "2.50",
      d: "3.00",
    }
  ),
  q(
    38,
    `The kinetic indeterminacy of the structure shown in the figure is equal to (Image shows a two-story, two-bay 2D frame. Left column is fixed at the base, middle column is hinged at the base, and right column is fixed at the base)`,
    {
      a: "14",
      b: "15",
      c: "16",
      d: "17",
    },
    true
  ),
  q(
    39,
    `A beam-column is alternately bent either (1) in single curvature, or (2) in double curvature. The secondary moments induced are to be compared. These are indicated SM1 and SM2 as per the conditions (1) and (2) respectively.`,
    {
      a: "SM1 > SM2",
      b: "SM1 < SM2",
      c: "SM1 = SM2",
      d: "Cannot be ascertained",
    }
  ),
  q(
    40,
    `Gantry girders can be designed
1. As laterally supported beams.
2. As laterally unsupported beams.
3. By using channel sections.
Select the correct answer using the codes given below:`,
    {
      a: "1, 2 and 3",
      b: "1 and 2 only",
      c: "2 and 3 only",
      d: "1 and 3 only",
    }
  ),
];

const payload = {
  title: "Building Materials & Solid Mechanics",
  description: "PYQ set with diagrams — add images to public/images as fig1.png, fig16.png, etc.",
  subject: "Building Materials",
  exam: "GATE",
  year: 2024,
  questions,
};

fs.writeFileSync(OUT, JSON.stringify(payload, null, 2));
console.log(`Wrote ${questions.length} questions to ${OUT}`);
