// Cortex Quest - Human Physiology Questions
// window.QuestionsPhysiology

window.QuestionsPhysiology = [
  {
    id: 'phys-1',
    text: 'What is the normal resting heart rate for adults?',
    options: ['40-60 bpm', '60-100 bpm', '100-120 bpm', '120-160 bpm'],
    correct: 1,
    explanation: 'The normal resting heart rate for adults is 60-100 beats per minute. Athletes may have lower rates (40-60 bpm). Tachycardia is >100 bpm; bradycardia is <60 bpm.',
    difficulty: 'easy',
    hint: 'It is measured in beats per minute (bpm).'
  },
  {
    id: 'phys-2',
    text: 'Which hormone is responsible for regulating blood glucose levels by lowering them?',
    options: ['Glucagon', 'Insulin', 'Cortisol', 'Adrenaline'],
    correct: 1,
    explanation: 'Insulin (produced by beta cells in the pancreas) lowers blood glucose by promoting uptake of glucose into cells and glycogen synthesis in the liver. Glucagon raises blood glucose when levels are low.',
    difficulty: 'easy',
    hint: 'Its absence or ineffectiveness causes diabetes.'
  },
  {
    id: 'phys-3',
    text: 'What is the normal pH range of human blood?',
    options: ['6.8-7.0', '7.0-7.2', '7.35-7.45', '7.6-7.8'],
    correct: 2,
    explanation: 'Normal blood pH is 7.35-7.45 (slightly alkaline). Acidosis (pH < 7.35) and alkalosis (pH > 7.45) are dangerous. The body uses buffer systems, respiration, and kidneys to maintain this narrow range.',
    difficulty: 'medium',
    hint: 'Blood is slightly alkaline, not neutral.'
  },
  {
    id: 'phys-4',
    text: 'What happens during the diastole phase of the cardiac cycle?',
    options: [
      'Ventricles contract and pump blood out',
      'Heart muscle relaxes and ventricles fill with blood',
      'Heart valves close',
      'Electrical impulse is generated in the SA node'
    ],
    correct: 1,
    explanation: 'Diastole is the relaxation phase of the cardiac cycle when the ventricles relax and fill with blood from the atria. Systole is the contraction phase when ventricles pump blood out.',
    difficulty: 'medium',
    hint: 'It is the relaxation and filling phase (opposite of systole).'
  },
  {
    id: 'phys-5',
    text: 'Which gas is transported in blood primarily bound to hemoglobin?',
    options: ['Carbon dioxide', 'Nitrogen', 'Oxygen', 'Hydrogen'],
    correct: 2,
    explanation: 'Oxygen is transported primarily bound to hemoglobin (as oxyhemoglobin) in red blood cells. About 97% of oxygen is carried this way. Carbon dioxide is transported mostly as bicarbonate ions in plasma.',
    difficulty: 'easy',
    hint: 'This gas turns hemoglobin bright red.'
  },
  {
    id: 'phys-6',
    text: 'What is the role of the sinoatrial (SA) node in the heart?',
    options: [
      'Pumps blood to the lungs',
      'Regulates valve opening',
      'Acts as the natural pacemaker generating electrical impulses',
      'Oxygenates the blood'
    ],
    correct: 2,
    explanation: 'The SA node is the heart\'s natural pacemaker located in the right atrium. It spontaneously generates electrical impulses at 60-100 times/min, initiating each heartbeat.',
    difficulty: 'medium',
    hint: 'It is the natural pacemaker of the heart.'
  },
  {
    id: 'phys-7',
    text: 'What is the function of the renal tubules in the kidney?',
    options: [
      'Filter blood under pressure',
      'Reabsorb useful substances and secrete waste products',
      'Produce urine from scratch',
      'Regulate blood pressure by producing red blood cells'
    ],
    correct: 1,
    explanation: 'Renal tubules reabsorb useful substances (glucose, amino acids, water, ions) back into the blood and secrete additional waste products into the filtrate. This fine-tunes urine composition.',
    difficulty: 'medium',
    hint: 'They recover valuable substances from the filtrate.'
  },
  {
    id: 'phys-8',
    text: 'Which vitamin is synthesized by the skin upon exposure to sunlight?',
    options: ['Vitamin A', 'Vitamin B12', 'Vitamin C', 'Vitamin D'],
    correct: 3,
    explanation: 'Vitamin D is synthesized in the skin when exposed to UVB radiation from sunlight. It is essential for calcium absorption, bone health, and immune function. Deficiency causes rickets (in children) and osteomalacia (in adults).',
    difficulty: 'easy',
    hint: 'Sunlight helps the body make this "sunshine vitamin".'
  },
  {
    id: 'phys-9',
    text: 'What is tidal volume in respiratory physiology?',
    options: [
      'Maximum air that can be exhaled after maximum inhalation',
      'Volume of air inhaled or exhaled in a single normal breath',
      'Air remaining in lungs after forceful exhalation',
      'Maximum volume of air the lungs can hold'
    ],
    correct: 1,
    explanation: 'Tidal volume is the amount of air inhaled or exhaled during a normal resting breath, approximately 500 mL in adults. Total lung capacity is about 6 liters; vital capacity is ~4.8 liters.',
    difficulty: 'medium',
    hint: 'It is the normal, quiet breath volume.'
  },
  {
    id: 'phys-10',
    text: 'What triggers the "fight-or-flight" response in the body?',
    options: [
      'Insulin release from the pancreas',
      'Adrenaline (epinephrine) release from the adrenal glands',
      'Serotonin release from the brain',
      'Thyroid hormone release'
    ],
    correct: 1,
    explanation: 'Adrenaline (epinephrine) and noradrenaline, released from the adrenal medulla, trigger the fight-or-flight response. Effects include increased heart rate, dilated pupils, increased blood glucose, and reduced digestion.',
    difficulty: 'easy',
    hint: 'This hormone makes your heart race in a scary situation.'
  },
  {
    id: 'phys-11',
    text: 'What is the function of platelets (thrombocytes)?',
    options: [
      'Carry oxygen throughout the body',
      'Fight infections',
      'Initiate blood clotting to stop bleeding',
      'Produce antibodies'
    ],
    correct: 2,
    explanation: 'Platelets (thrombocytes) are small cell fragments that initiate the clotting cascade when a blood vessel is damaged. They aggregate at injury sites and release clotting factors to form a fibrin clot.',
    difficulty: 'easy',
    hint: 'Their absence leads to excessive bleeding.'
  },
  {
    id: 'phys-12',
    text: 'How does the body regulate body temperature (thermoregulation) when overheated?',
    options: [
      'Vasoconstriction and shivering',
      'Vasodilation and sweating',
      'Increased metabolism',
      'Decreased breathing rate'
    ],
    correct: 1,
    explanation: 'When overheated, the body vasodilates (widens blood vessels near the skin) to radiate heat and sweats so evaporative cooling can occur. When cold, the body vasoconstricts and shivers to generate heat.',
    difficulty: 'medium',
    hint: 'The body needs to lose heat, so what mechanisms help dissipate it?'
  },
  {
    id: 'phys-13',
    text: 'What is the resting membrane potential of a typical neuron?',
    options: ['+70 mV', '-70 mV', '0 mV', '+35 mV'],
    correct: 1,
    explanation: 'The resting membrane potential of a typical neuron is approximately -70 mV (inside negative relative to outside). This is maintained by Na⁺/K⁺ pumps and selective ion permeability.',
    difficulty: 'hard',
    hint: 'It is negative — the inside of the cell is negatively charged at rest.'
  },
  {
    id: 'phys-14',
    text: 'Which enzyme begins starch digestion in the mouth?',
    options: ['Pepsin', 'Lipase', 'Salivary amylase', 'Lactase'],
    correct: 2,
    explanation: 'Salivary amylase (ptyalin) in saliva begins breaking down starch into maltose and shorter chains. Digestion continues in the small intestine with pancreatic amylase.',
    difficulty: 'medium',
    hint: 'Digestion starts in the mouth, where saliva contains this enzyme.'
  },
  {
    id: 'phys-15',
    text: 'What is the primary function of the lymphatic system?',
    options: [
      'Transport oxygen to tissues',
      'Pump blood through the body',
      'Return excess interstitial fluid to the bloodstream and support immunity',
      'Filter blood and produce urine'
    ],
    correct: 2,
    explanation: 'The lymphatic system collects excess interstitial fluid (lymph) from tissues and returns it to the bloodstream. It also transports fats from the gut, and lymph nodes filter pathogens as part of the immune system.',
    difficulty: 'medium',
    hint: 'It works alongside the circulatory system and the immune system.'
  },
  {
    id: 'phys-16',
    text: 'What is the name of the process by which cells produce ATP using oxygen?',
    options: [
      'Anaerobic glycolysis',
      'Fermentation',
      'Aerobic cellular respiration',
      'Chemiosmosis only'
    ],
    correct: 2,
    explanation: 'Aerobic cellular respiration uses oxygen to produce ATP from glucose: C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + ~30-36 ATP. It occurs in three stages: glycolysis, Krebs cycle, and oxidative phosphorylation.',
    difficulty: 'medium',
    hint: 'It uses oxygen and produces much more ATP than anaerobic pathways.'
  },
  {
    id: 'phys-17',
    text: 'The hormone melatonin is secreted by which gland?',
    options: ['Pituitary gland', 'Adrenal gland', 'Pineal gland', 'Thyroid gland'],
    correct: 2,
    explanation: 'Melatonin is secreted by the pineal gland in response to darkness. It regulates the circadian rhythm (sleep-wake cycle). Light suppresses melatonin production.',
    difficulty: 'medium',
    hint: 'It is sometimes called the "sleep hormone".'
  },
  {
    id: 'phys-18',
    text: 'What is the Bowman\'s capsule in the kidney?',
    options: [
      'The duct that carries urine to the bladder',
      'The cup-shaped structure surrounding each glomerulus that collects filtrate',
      'The collecting duct that concentrates urine',
      'The artery supplying blood to the kidney'
    ],
    correct: 1,
    explanation: 'Bowman\'s capsule is a cup-shaped structure that surrounds the glomerulus (a network of capillaries). Blood is filtered under pressure in the glomerulus, and the filtrate is collected in Bowman\'s capsule to enter the renal tubule.',
    difficulty: 'hard',
    hint: 'It is the first part of the nephron where filtration begins.'
  },
  {
    id: 'phys-19',
    text: 'What is the normal systolic blood pressure for a healthy adult?',
    options: ['60-80 mmHg', '80-100 mmHg', '120 mmHg (approximately)', '150-180 mmHg'],
    correct: 2,
    explanation: 'Normal blood pressure is approximately 120/80 mmHg. Systolic pressure (~120 mmHg) is measured when the heart contracts; diastolic (~80 mmHg) when it relaxes. Values consistently above 130/80 indicate hypertension.',
    difficulty: 'easy',
    hint: 'Normal blood pressure is often stated as "120 over 80".'
  },
  {
    id: 'phys-20',
    text: 'Osmosis is the movement of water across a semipermeable membrane from:',
    options: [
      'High solute concentration to low solute concentration',
      'Low solute concentration to high solute concentration',
      'High pressure to low pressure',
      'Low temperature to high temperature'
    ],
    correct: 1,
    explanation: 'Osmosis is the diffusion of water through a semipermeable membrane from a region of low solute concentration (high water concentration) to a region of high solute concentration (low water concentration).',
    difficulty: 'medium',
    hint: 'Water moves to dilute the more concentrated solution.'
  }
];
