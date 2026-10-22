// Cortex Quest - Electrical Engineering Questions
// window.QuestionsElectrical

window.QuestionsElectrical = [
  {
    id: 'elec-1',
    text: 'Ohm\'s Law states that the current through a conductor is:',
    options: ['Directly proportional to the resistance', 'Inversely proportional to the voltage', 'Directly proportional to the voltage and inversely proportional to the resistance', 'Equal to the product of voltage and resistance'],
    correct: 2,
    explanation: 'Ohm\'s Law: I = V/R. Current (I) is directly proportional to voltage (V) and inversely proportional to resistance (R). This applies to ohmic conductors at constant temperature.',
    difficulty: 'easy',
    hint: 'The formula is I = V/R.'
  },
  {
    id: 'elec-2',
    text: 'What is the unit of electrical resistance?',
    options: ['Ampere', 'Volt', 'Ohm', 'Watt'],
    correct: 2,
    explanation: 'The SI unit of electrical resistance is the Ohm (Ω), named after Georg Simon Ohm. It is defined as the resistance of a conductor when a potential difference of 1 volt produces a current of 1 ampere.',
    difficulty: 'easy',
    hint: 'It is named after the same scientist who formulated the law.'
  },
  {
    id: 'elec-3',
    text: 'In a series circuit with resistors R1 = 4Ω and R2 = 6Ω connected to a 20V source, what is the current?',
    options: ['1A', '2A', '3A', '4A'],
    correct: 1,
    explanation: 'In a series circuit, total resistance = R1 + R2 = 4 + 6 = 10Ω. Using Ohm\'s Law: I = V/R = 20/10 = 2A.',
    difficulty: 'medium',
    hint: 'Add the resistances first, then apply Ohm\'s Law.'
  },
  {
    id: 'elec-4',
    text: 'Kirchhoff\'s Current Law (KCL) states that:',
    options: ['The sum of voltages around a closed loop is zero', 'The sum of all currents entering a node equals the sum of all currents leaving that node', 'Current is proportional to voltage', 'Power equals current squared times resistance'],
    correct: 1,
    explanation: 'KCL (Kirchhoff\'s Current Law) states that the algebraic sum of all currents meeting at a node is zero. In other words, current entering a node equals current leaving it (conservation of charge).',
    difficulty: 'easy',
    hint: 'It is based on conservation of charge at a junction.'
  },
  {
    id: 'elec-5',
    text: 'What is the power dissipated in a 10Ω resistor carrying 3A of current?',
    options: ['30W', '90W', '300W', '0.3W'],
    correct: 1,
    explanation: 'Power P = I²R = (3)² × 10 = 9 × 10 = 90W. Alternatively, P = IV = I(IR) = I²R.',
    difficulty: 'medium',
    hint: 'Use the formula P = I²R.'
  },
  {
    id: 'elec-6',
    text: 'What is the equivalent capacitance of two 6μF capacitors connected in series?',
    options: ['12μF', '6μF', '3μF', '2μF'],
    correct: 2,
    explanation: 'For capacitors in series: 1/Ceq = 1/C1 + 1/C2 = 1/6 + 1/6 = 2/6 = 1/3. Therefore Ceq = 3μF. Unlike resistors, capacitors in series decrease in total capacitance.',
    difficulty: 'medium',
    hint: 'Capacitors in series use the reciprocal formula (opposite of resistors).'
  },
  {
    id: 'elec-7',
    text: 'Which component stores energy in an electric field?',
    options: ['Resistor', 'Inductor', 'Capacitor', 'Diode'],
    correct: 2,
    explanation: 'A capacitor stores energy in an electric field between its plates. An inductor stores energy in a magnetic field. A resistor dissipates energy as heat.',
    difficulty: 'easy',
    hint: 'Think about the type of field involved.'
  },
  {
    id: 'elec-8',
    text: 'What is the frequency of AC power supply in India?',
    options: ['50 Hz', '60 Hz', '100 Hz', '120 Hz'],
    correct: 0,
    explanation: 'India uses 50 Hz AC power supply at 230V. The USA uses 60 Hz at 120V. The frequency determines how many times per second the current alternates direction.',
    difficulty: 'easy',
    hint: 'Most countries in Asia and Europe use this frequency.'
  },
  {
    id: 'elec-9',
    text: 'What is the relationship between peak voltage (Vp) and RMS voltage (Vrms) for a sinusoidal AC signal?',
    options: ['Vrms = Vp', 'Vrms = Vp/2', 'Vrms = Vp/√2', 'Vrms = Vp × √2'],
    correct: 2,
    explanation: 'For a sinusoidal AC signal, Vrms = Vp/√2 ≈ 0.707 × Vp. The RMS (Root Mean Square) voltage is the effective value that produces the same power as an equivalent DC voltage.',
    difficulty: 'hard',
    hint: 'The RMS is less than the peak value for AC.'
  },
  {
    id: 'elec-10',
    text: 'What is Kirchhoff\'s Voltage Law (KVL)?',
    options: ['Current at a node must sum to zero', 'The algebraic sum of all voltages around a closed loop equals zero', 'Voltage is proportional to current', 'Power input equals power output'],
    correct: 1,
    explanation: 'KVL states that the algebraic sum of all voltages (EMFs and voltage drops) around any closed loop in a circuit equals zero. It is based on conservation of energy.',
    difficulty: 'easy',
    hint: 'It is about voltages around a closed loop.'
  },
  {
    id: 'elec-11',
    text: 'Which type of transformer increases voltage?',
    options: ['Step-down transformer', 'Step-up transformer', 'Isolation transformer', 'Auto-transformer'],
    correct: 1,
    explanation: 'A step-up transformer increases the voltage from primary to secondary winding. It has more turns in the secondary coil than the primary. Step-down transformers decrease voltage.',
    difficulty: 'easy',
    hint: 'The name describes what it does to voltage.'
  },
  {
    id: 'elec-12',
    text: 'In a parallel circuit, if three identical resistors of 12Ω each are connected, what is the equivalent resistance?',
    options: ['36Ω', '12Ω', '6Ω', '4Ω'],
    correct: 3,
    explanation: '1/Req = 1/12 + 1/12 + 1/12 = 3/12 = 1/4. Therefore Req = 4Ω. For n identical resistors in parallel, Req = R/n = 12/3 = 4Ω.',
    difficulty: 'medium',
    hint: 'For parallel resistors, 1/Req = sum of 1/R for each resistor.'
  },
  {
    id: 'elec-13',
    text: 'What is the SI unit of electric charge?',
    options: ['Ampere', 'Coulomb', 'Volt', 'Farad'],
    correct: 1,
    explanation: 'The SI unit of electric charge is the Coulomb (C). One Coulomb is the amount of charge transported by a current of 1 Ampere flowing for 1 second (1C = 1A·s).',
    difficulty: 'easy',
    hint: 'It is named after the French physicist Charles-Augustin de Coulomb.'
  },
  {
    id: 'elec-14',
    text: 'What does a diode primarily do?',
    options: ['Amplifies current', 'Stores charge', 'Allows current to flow in only one direction', 'Resists current flow'],
    correct: 2,
    explanation: 'A diode is a semiconductor device that allows current to flow primarily in one direction (forward biased) and blocks it in the reverse direction. It acts as an electronic check valve.',
    difficulty: 'easy',
    hint: 'It has two terminals: anode and cathode.'
  },
  {
    id: 'elec-15',
    text: 'What is the resonant frequency of an LC circuit with L = 1H and C = 1F?',
    options: ['1 Hz', '1/2π Hz', '2π Hz', '0.5 Hz'],
    correct: 1,
    explanation: 'The resonant frequency f = 1/(2π√(LC)) = 1/(2π√(1×1)) = 1/(2π) ≈ 0.159 Hz = 1/2π Hz.',
    difficulty: 'hard',
    hint: 'Use the formula f = 1/(2π√LC).'
  },
  {
    id: 'elec-16',
    text: 'What is the unit of inductance?',
    options: ['Farad', 'Henry', 'Ohm', 'Tesla'],
    correct: 1,
    explanation: 'The SI unit of electrical inductance is the Henry (H), named after Joseph Henry. One henry is the inductance of a coil in which an EMF of 1 volt is induced when the current changes at 1 ampere per second.',
    difficulty: 'easy',
    hint: 'It is named after an American scientist.'
  },
  {
    id: 'elec-17',
    text: 'Which law relates the magnetic field around a conductor to the current flowing through it?',
    options: ['Ohm\'s Law', 'Faraday\'s Law', 'Ampere\'s Law', 'Lenz\'s Law'],
    correct: 2,
    explanation: 'Ampere\'s Law states that the magnetic field in space around an electric current is proportional to the current. The integral of the magnetic field around a closed path equals μ₀ times the enclosed current.',
    difficulty: 'hard',
    hint: 'It involves the magnetic field created by current.'
  },
  {
    id: 'elec-18',
    text: 'What is power factor in an AC circuit?',
    options: ['The ratio of apparent power to real power', 'The ratio of real power to apparent power', 'The ratio of reactive power to real power', 'The product of voltage and current'],
    correct: 1,
    explanation: 'Power factor (PF) = Real Power (W) / Apparent Power (VA) = cos(φ), where φ is the phase angle between voltage and current. A PF of 1 means all power is real (resistive load).',
    difficulty: 'hard',
    hint: 'A power factor of 1 is ideal (pure resistive load).'
  },
  {
    id: 'elec-19',
    text: 'If a 100W bulb operates at 220V, what is its resistance?',
    options: ['220Ω', '484Ω', '2.2Ω', '100Ω'],
    correct: 1,
    explanation: 'P = V²/R → R = V²/P = (220)² / 100 = 48400 / 100 = 484Ω.',
    difficulty: 'medium',
    hint: 'Use P = V²/R and rearrange for R.'
  },
  {
    id: 'elec-20',
    text: 'What is the effect of temperature on the resistance of a metallic conductor?',
    options: ['Resistance decreases with increasing temperature', 'Resistance increases with increasing temperature', 'Resistance remains constant', 'Resistance first decreases then increases'],
    correct: 1,
    explanation: 'For metallic conductors, resistance increases with temperature because higher temperatures cause more lattice vibrations, increasing collisions with electrons and impeding current flow. Semiconductors show the opposite behavior.',
    difficulty: 'medium',
    hint: 'More heat means more atomic vibration and more resistance in metals.'
  }
];
