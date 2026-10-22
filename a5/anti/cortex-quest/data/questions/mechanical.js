// Cortex Quest - Mechanical Engineering Questions
// window.QuestionsMechanical

window.QuestionsMechanical = [
  {
    id: 'mech-1',
    text: 'The First Law of Thermodynamics states that:',
    options: [
      'Entropy of an isolated system always increases',
      'Energy cannot be created or destroyed, only converted from one form to another',
      'Heat always flows from cold to hot objects',
      'At absolute zero, all molecular motion stops'
    ],
    correct: 1,
    explanation: 'The First Law of Thermodynamics is the law of conservation of energy. It states that the total energy of an isolated system remains constant; energy can be transformed, but not created or destroyed. ΔU = Q - W.',
    difficulty: 'easy',
    hint: 'It is about conservation of energy.'
  },
  {
    id: 'mech-2',
    text: 'Which of the following is a statement of the Second Law of Thermodynamics?',
    options: [
      'Energy is conserved in all processes',
      'Heat flows spontaneously from cold to hot bodies',
      'The entropy of the universe tends to increase',
      'Temperature is proportional to pressure at constant volume'
    ],
    correct: 2,
    explanation: 'The Second Law of Thermodynamics states that the total entropy of an isolated system always increases over time or remains constant in ideal (reversible) processes. Heat naturally flows from hot to cold, not cold to hot.',
    difficulty: 'easy',
    hint: 'It involves the concept of entropy.'
  },
  {
    id: 'mech-3',
    text: 'What is the efficiency of a Carnot engine operating between temperatures of 600K (hot reservoir) and 300K (cold reservoir)?',
    options: ['25%', '33%', '50%', '75%'],
    correct: 2,
    explanation: 'Carnot efficiency η = 1 - (Tc/Th) = 1 - (300/600) = 1 - 0.5 = 0.5 = 50%. The Carnot engine represents the maximum theoretical efficiency for a heat engine.',
    difficulty: 'medium',
    hint: 'Use the formula η = 1 - (Tc/Th).'
  },
  {
    id: 'mech-4',
    text: 'In a simply supported beam with a central point load, where does the maximum bending moment occur?',
    options: ['At the supports', 'At the center of the beam', 'At the quarter point', 'At the three-quarter point'],
    correct: 1,
    explanation: 'For a simply supported beam with a central point load, the maximum bending moment occurs at the center (midspan) of the beam. Bending moment = WL/4, where W is the load and L is the span.',
    difficulty: 'medium',
    hint: 'Symmetry tells you where the maximum occurs.'
  },
  {
    id: 'mech-5',
    text: 'What is stress in a material?',
    options: [
      'The change in length per unit original length',
      'The force per unit area applied to a material',
      'The ratio of stress to strain',
      'The maximum force a material can withstand'
    ],
    correct: 1,
    explanation: 'Stress (σ) is defined as the force per unit area: σ = F/A. It is measured in Pascals (Pa) or N/m². Strain is the deformation per unit length (ΔL/L). The ratio of stress to strain is Young\'s Modulus.',
    difficulty: 'easy',
    hint: 'Think of it as force distributed over an area.'
  },
  {
    id: 'mech-6',
    text: 'What is Young\'s Modulus?',
    options: [
      'The ratio of shear stress to shear strain',
      'The ratio of volumetric stress to volumetric strain',
      'The ratio of tensile stress to tensile strain',
      'The ratio of lateral strain to longitudinal strain'
    ],
    correct: 2,
    explanation: 'Young\'s Modulus (E) is the ratio of tensile (or compressive) stress to tensile (or compressive) strain: E = σ/ε. It measures a material\'s stiffness or resistance to elastic deformation.',
    difficulty: 'medium',
    hint: 'It measures stiffness under tension or compression.'
  },
  {
    id: 'mech-7',
    text: 'In fluid mechanics, what does Bernoulli\'s equation relate?',
    options: [
      'Pressure, velocity, and elevation along a streamline',
      'Viscosity, temperature, and pressure',
      'Density, volume, and mass',
      'Shear stress and velocity gradient'
    ],
    correct: 0,
    explanation: 'Bernoulli\'s equation states that for an ideal fluid along a streamline: P + ½ρv² + ρgh = constant. It relates static pressure, dynamic pressure (velocity), and gravitational potential energy (elevation).',
    difficulty: 'medium',
    hint: 'It applies to ideal, incompressible fluids along a streamline.'
  },
  {
    id: 'mech-8',
    text: 'What is the principle behind a hydraulic jack?',
    options: [
      'Newton\'s Third Law',
      'Pascal\'s Law — pressure applied to a confined fluid is transmitted equally in all directions',
      'Bernoulli\'s Principle',
      'Archimedes\' Principle'
    ],
    correct: 1,
    explanation: 'Hydraulic jacks work on Pascal\'s Law: pressure applied to an enclosed fluid is transmitted undiminished throughout the fluid. A small force on a small piston creates enough pressure to lift heavy loads on a large piston.',
    difficulty: 'easy',
    hint: 'Pressure in a confined fluid is transmitted equally.'
  },
  {
    id: 'mech-9',
    text: 'What is the Poisson\'s ratio of a material?',
    options: [
      'Ratio of longitudinal stress to lateral stress',
      'Ratio of lateral strain to longitudinal strain (magnitude)',
      'Ratio of shear stress to normal stress',
      'Ratio of elastic deformation to plastic deformation'
    ],
    correct: 1,
    explanation: 'Poisson\'s ratio (ν) is the negative ratio of transverse (lateral) strain to axial (longitudinal) strain. For most materials, ν is between 0 and 0.5. An incompressible material has ν = 0.5.',
    difficulty: 'hard',
    hint: 'It relates how a material deforms in one direction to another.'
  },
  {
    id: 'mech-10',
    text: 'Which mode of heat transfer does NOT require a medium (works in vacuum)?',
    options: ['Conduction', 'Convection', 'Radiation', 'Advection'],
    correct: 2,
    explanation: 'Radiation is the transfer of heat through electromagnetic waves and does not require a medium. It can travel through vacuum. Conduction and convection both require a material medium.',
    difficulty: 'easy',
    hint: 'Think about how the sun heats the Earth through space.'
  },
  {
    id: 'mech-11',
    text: 'In a gear train, if the driver gear has 20 teeth and the driven gear has 60 teeth, the gear ratio is:',
    options: ['1:3', '3:1', '1:2', '2:1'],
    correct: 0,
    explanation: 'Gear ratio = Teeth on driven gear / Teeth on driver gear = 60/20 = 3. This is expressed as 1:3 (driver:driven). The driven gear rotates at 1/3 the speed of the driver but produces 3× the torque.',
    difficulty: 'medium',
    hint: 'Gear ratio = driven teeth / driver teeth.'
  },
  {
    id: 'mech-12',
    text: 'What is the Reynolds number used to determine in fluid flow?',
    options: [
      'The speed of sound in the fluid',
      'Whether the flow is laminar or turbulent',
      'The pressure drop across a pipe',
      'The buoyancy force on an object'
    ],
    correct: 1,
    explanation: 'The Reynolds number (Re = ρvD/μ) is a dimensionless number that predicts whether flow is laminar (Re < 2000) or turbulent (Re > 4000). Laminar flow is smooth and orderly; turbulent flow is chaotic.',
    difficulty: 'medium',
    hint: 'Low Re = laminar; high Re = turbulent.'
  },
  {
    id: 'mech-13',
    text: 'What is Fourier\'s Law of Heat Conduction?',
    options: [
      'Heat flux is proportional to temperature gradient',
      'Total heat is conserved',
      'Heat flows from cold to hot',
      'Entropy increases with heat transfer'
    ],
    correct: 0,
    explanation: 'Fourier\'s Law states that heat flux (rate of heat transfer per unit area) is proportional to the negative temperature gradient: q = -k(dT/dx), where k is thermal conductivity. Heat flows from hot to cold.',
    difficulty: 'hard',
    hint: 'It relates heat flow to temperature difference.'
  },
  {
    id: 'mech-14',
    text: 'Which property of a material describes its ability to absorb energy before fracturing?',
    options: ['Stiffness', 'Hardness', 'Toughness', 'Strength'],
    correct: 2,
    explanation: 'Toughness is the ability of a material to absorb energy and plastically deform without fracturing. It is the area under the stress-strain curve. Hardness resists surface indentation; strength is max stress before failure.',
    difficulty: 'medium',
    hint: 'It is represented by the area under the stress-strain curve.'
  },
  {
    id: 'mech-15',
    text: 'In a four-stroke internal combustion engine, the correct order of strokes is:',
    options: [
      'Compression, Intake, Power, Exhaust',
      'Intake, Compression, Power, Exhaust',
      'Intake, Power, Compression, Exhaust',
      'Power, Intake, Compression, Exhaust'
    ],
    correct: 1,
    explanation: 'The four strokes of an IC engine are: 1) Intake (air-fuel mixture drawn in), 2) Compression (mixture compressed), 3) Power (ignition, piston pushed down), 4) Exhaust (burned gases expelled).',
    difficulty: 'easy',
    hint: 'Remember: Suck, Squeeze, Bang, Blow.'
  },
  {
    id: 'mech-16',
    text: 'What is the SI unit of pressure?',
    options: ['Newton', 'Joule', 'Pascal', 'Bar'],
    correct: 2,
    explanation: 'The SI unit of pressure is the Pascal (Pa), defined as one Newton per square meter (N/m²). It is named after Blaise Pascal. 1 atmosphere ≈ 101,325 Pa.',
    difficulty: 'easy',
    hint: 'It is named after the same scientist as Pascal\'s Law.'
  },
  {
    id: 'mech-17',
    text: 'What happens to the viscosity of liquids as temperature increases?',
    options: [
      'Viscosity increases',
      'Viscosity decreases',
      'Viscosity remains constant',
      'Viscosity first increases then decreases'
    ],
    correct: 1,
    explanation: 'For liquids, viscosity decreases as temperature increases because higher temperature breaks intermolecular bonds more easily, allowing layers to flow past each other more freely. For gases, viscosity increases with temperature.',
    difficulty: 'medium',
    hint: 'Think about how honey behaves when heated.'
  },
  {
    id: 'mech-18',
    text: 'Fatigue failure in a material occurs due to:',
    options: [
      'A single large static load',
      'Repeated cyclic loading below the ultimate tensile strength',
      'Exposure to high temperatures',
      'Chemical corrosion'
    ],
    correct: 1,
    explanation: 'Fatigue failure occurs when a material is subjected to repeated cyclic loading. Even if the stress level is below the yield strength, repeated cycles can initiate cracks that propagate and eventually cause sudden failure.',
    difficulty: 'hard',
    hint: 'Repeated stress cycles cause crack initiation and growth.'
  },
  {
    id: 'mech-19',
    text: 'What is the law of conservation of momentum?',
    options: [
      'Momentum equals mass times acceleration',
      'The total momentum of a closed system remains constant unless acted upon by external forces',
      'Action and reaction forces are equal and opposite',
      'Energy equals mass times the speed of light squared'
    ],
    correct: 1,
    explanation: 'Conservation of momentum: the total momentum of an isolated system remains constant. For a system with no external forces, Σp (before) = Σp (after). Momentum p = mv.',
    difficulty: 'easy',
    hint: 'It applies to collisions and explosions.'
  },
  {
    id: 'mech-20',
    text: 'What does COP (Coefficient of Performance) measure in refrigeration systems?',
    options: [
      'The efficiency of the compressor motor',
      'The ratio of heat removed to work input',
      'The temperature difference between hot and cold reservoirs',
      'The refrigerant flow rate'
    ],
    correct: 1,
    explanation: 'COP for a refrigerator = Qc/W, where Qc is the heat removed from the cold reservoir and W is the work input. A higher COP means more heat is removed per unit of work done — a more efficient refrigerator.',
    difficulty: 'hard',
    hint: 'It tells you how much cooling you get per unit of energy spent.'
  }
];
