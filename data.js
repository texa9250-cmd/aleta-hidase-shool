/* ==========================================================
   EDIT THIS FILE to change what the portal shows.
   Everything marked "SAMPLE" is placeholder text: replace it.
   ========================================================== */

// Exam date as "YYYY-MM-DD". Leave "" to hide the countdown on the home page.
const EXAM_DATE = "";

const SUBJECTS = ["Mathematics","Physics","Chemistry","Biology","English","Aptitude","Geography","History","Economics","Civics"];

/* ---------- 1. QUESTION SOURCES ----------
   type: "Past exam" | "Textbook" | "Video" | "Practice" | "Reference"
   url: paste the real link. Leave "" if you don't have one yet. */
const RESOURCES = [
  {subject:"Mathematics",type:"Past exam",title:"Grade 12 Mathematics past national exams",desc:"Previous years' papers with answer keys. Add the link your teacher or school uses.",url:""},
  {subject:"Mathematics",type:"Video",title:"Khan Academy: Calculus",desc:"Free lessons and practice on limits, derivatives and integrals.",url:"https://www.khanacademy.org/math/calculus-1"},
  {subject:"Physics",type:"Past exam",title:"Grade 12 Physics past national exams",desc:"Previous years' papers. Add your link.",url:""},
  {subject:"Physics",type:"Practice",title:"PhET simulations",desc:"Interactive experiments for circuits, motion, waves and more.",url:"https://phet.colorado.edu"},
  {subject:"Chemistry",type:"Past exam",title:"Grade 12 Chemistry past national exams",desc:"Previous years' papers. Add your link.",url:""},
  {subject:"Chemistry",type:"Video",title:"Khan Academy: Chemistry",desc:"Equilibrium, acids and bases, electrochemistry.",url:"https://www.khanacademy.org/science/chemistry"},
  {subject:"Biology",type:"Past exam",title:"Grade 12 Biology past national exams",desc:"Previous years' papers. Add your link.",url:""},
  {subject:"Biology",type:"Video",title:"Khan Academy: Biology",desc:"Genetics, evolution, cell processes.",url:"https://www.khanacademy.org/science/biology"},
  {subject:"English",type:"Practice",title:"English reading practice",desc:"Add reading passages and grammar quizzes your teacher recommends.",url:""},
  {subject:"Aptitude",type:"Practice",title:"Scholastic aptitude practice tests",desc:"Add practice sets for verbal and quantitative reasoning.",url:""},
  {subject:"Geography",type:"Textbook",title:"Grade 12 Geography textbook (PDF)",desc:"Add the link to your official textbook file.",url:""},
  {subject:"History",type:"Textbook",title:"Grade 12 History textbook (PDF)",desc:"Add the link to your official textbook file.",url:""},
  {subject:"Economics",type:"Textbook",title:"Grade 12 Economics textbook (PDF)",desc:"Add the link to your official textbook file.",url:""},
  {subject:"Civics",type:"Textbook",title:"Grade 12 Civics textbook (PDF)",desc:"Add the link to your official textbook file.",url:""}
];

/* ---------- 2. EXAM NEWS (newest first doesn't matter, they are sorted by date) ---------- */
const NEWS = [
  {date:"2026-10-08",tag:"SAMPLE",title:"Replace this with real exam news",body:"Add registration dates, exam schedules, rule changes and announcements from your school or the exam agency. Delete these sample items."},
  {date:"2026-10-05",tag:"SAMPLE",title:"Exam timetable announcement",body:"Example entry. Put the real timetable here once it is published."},
  {date:"2026-10-01",tag:"SAMPLE",title:"Study group meeting",body:"Example entry. Use this for school-level news such as revision classes and study groups."}
];

/* ---------- 3. TOPICS → TEXTBOOK PAGES ----------
   unit: e.g. "Unit 4"   page: e.g. "pp. 112-130"
   Look these up in your own Grade 12 textbook, then fill them in.
   Empty unit/page shows "not added yet". */
const TOPICS = [
  {subject:"Mathematics",topic:"Limits and continuity",unit:"",page:"",tip:"Practise evaluating limits at a point and at infinity."},
  {subject:"Mathematics",topic:"Differentiation and its applications",unit:"",page:"",tip:"Rules, then maxima/minima and rate-of-change problems."},
  {subject:"Mathematics",topic:"Integration and area",unit:"",page:"",tip:"Definite integrals and area between curves appear often."},
  {subject:"Physics",topic:"Electricity and circuits",unit:"",page:"",tip:"Series/parallel resistance and Ohm's law calculations."},
  {subject:"Physics",topic:"Electromagnetism",unit:"",page:"",tip:"Know the right-hand rules and induced emf."},
  {subject:"Physics",topic:"Rotational motion",unit:"",page:"",tip:"Torque, angular momentum and their linear analogues."},
  {subject:"Chemistry",topic:"Chemical equilibrium",unit:"",page:"",tip:"Kc calculations and Le Chatelier's principle."},
  {subject:"Chemistry",topic:"Acids, bases and pH",unit:"",page:"",tip:"pH and pOH calculations, buffers, titration curves."},
  {subject:"Chemistry",topic:"Electrochemistry",unit:"",page:"",tip:"Cell potentials and electrolysis calculations."},
  {subject:"Biology",topic:"Genetics and inheritance",unit:"",page:"",tip:"Monohybrid and dihybrid crosses, pedigrees."},
  {subject:"Biology",topic:"Evolution",unit:"",page:"",tip:"Natural selection, evidence for evolution, speciation."},
  {subject:"English",topic:"Reading comprehension",unit:"",page:"",tip:"Main idea, inference, vocabulary in context."},
  {subject:"English",topic:"Grammar: tenses and conditionals",unit:"",page:"",tip:"Practise sentence completion and error identification."},
  {subject:"Economics",topic:"National income and growth",unit:"",page:"",tip:"GDP definitions and calculations."}
];

/* ---------- 4. SHORT NOTES ---------- */
const NOTES = [
  {subject:"Mathematics",title:"Differentiation rules",points:["Power rule: d/dx (xⁿ) = n·xⁿ⁻¹","Product rule: (uv)′ = u′v + uv′","Quotient rule: (u/v)′ = (u′v − uv′) / v²","Chain rule: d/dx f(g(x)) = f′(g(x))·g′(x)"]},
  {subject:"Mathematics",title:"Integration basics",points:["∫ xⁿ dx = xⁿ⁺¹/(n+1) + C, for n ≠ −1","∫ 1/x dx = ln|x| + C","∫ eˣ dx = eˣ + C","Definite integral: ∫ₐᵇ f(x) dx = F(b) − F(a)"]},
  {subject:"Mathematics",title:"Logarithms and quadratics",points:["log(ab) = log a + log b","log(a/b) = log a − log b","log(aⁿ) = n·log a","Quadratic formula: x = (−b ± √(b² − 4ac)) / 2a","Discriminant b² − 4ac: positive = 2 real roots, zero = 1, negative = none"]},
  {subject:"Physics",title:"Kinematics (constant acceleration)",points:["v = u + at","s = ut + ½at²","v² = u² + 2as","Free fall: use a = g ≈ 9.8 m/s² downward"]},
  {subject:"Physics",title:"Electricity",points:["Ohm's law: V = IR","Power: P = VI = I²R = V²/R","Resistors in series: R = R₁ + R₂","Resistors in parallel: 1/R = 1/R₁ + 1/R₂"]},
  {subject:"Physics",title:"Force, work and momentum",points:["Newton's second law: F = ma","Momentum: p = mv; impulse = FΔt = Δp","Work: W = Fd·cosθ","Kinetic energy: KE = ½mv²"]},
  {subject:"Chemistry",title:"The mole concept",points:["n = m / M (mass ÷ molar mass)","1 mole of any gas = 22.4 L at STP","Ideal gas: PV = nRT","Molarity: M = n / V (V in litres)"]},
  {subject:"Chemistry",title:"Acids, bases and equilibrium",points:["pH = −log[H⁺]","pH + pOH = 14 at 25 °C","Kc = [products]ᵖᵒʷᵉʳˢ / [reactants]ᵖᵒʷᵉʳˢ","Le Chatelier: a system shifts to oppose any change applied to it"]},
  {subject:"Biology",title:"Genetics ratios",points:["Monohybrid cross (Aa × Aa): 3 dominant : 1 recessive","Dihybrid cross: 9 : 3 : 3 : 1","Test cross: cross with a homozygous recessive","Genotype = alleles carried; phenotype = visible trait"]},
  {subject:"Biology",title:"Photosynthesis and respiration",points:["Photosynthesis: 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂ (light, chlorophyll)","Aerobic respiration: C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + energy (ATP)","Photosynthesis happens in chloroplasts; respiration in mitochondria"]},
  {subject:"English",title:"Conditional sentences",points:["Zero: if + present, present (facts)","First: if + present, will + verb (real future)","Second: if + past, would + verb (unreal present)","Third: if + past perfect, would have + past participle (unreal past)"]},
  {subject:"English",title:"Reading comprehension strategy",points:["Read the questions first, then the passage","The main idea is usually in the first or last sentences","For vocabulary questions, put each option back into the sentence","Eliminate two wrong answers before choosing"]}
];

/* ---------- 5. STUDENT STORIES (samples; students can add more on the page) ---------- */
const STORIES = [
  {name:"Sample",subject:"General",title:"Replace with a real student story",text:"Ask last year's students how they studied, what they would do differently, and what helped most. Paste their answers here.",date:"2026-10-08"}
];
