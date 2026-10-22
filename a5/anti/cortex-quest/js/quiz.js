/**
 * ============================================================================
 * CORTEX QUEST — QUIZ ENGINE (quiz.js)
 * ============================================================================
 * Exposes window.CortexQuiz
 * Manages question selection, answer evaluation, streaks, scoring, rewards,
 * hints, puzzle triggers, audio voice triggers, and level progression.
 */

(function (window) {
  'use strict';

  // --------------------------------------------------------------------------
  // Internal State
  // --------------------------------------------------------------------------
  let currentModule = null;
  let currentSubmodule = null;
  let currentLevel = 1;
  let currentDifficulty = 'medium';
  let questions = [];
  let currentIndex = 0;
  let answers = []; // [{ optionIndex, isCorrect, correctIndex, timeSpent, xpEarned, coinsEarned }]
  let levelStartTime = 0;
  let questionStartTime = 0;
  let hintUsedThisQuestion = false;
  let levelRewardGiven = false;
  let streakCount = 0;

  // --------------------------------------------------------------------------
  // Comprehensive Fallback Question Bank (Covers all 24 submodules)
  // Ensures quiz engine works standalone even before external questions load
  // --------------------------------------------------------------------------
  const fallbackQuestionBank = {
    // 1. General Aptitude
    'arithmetic': [
      {
        id: 'arith_1',
        text: 'What is 15% of 240?',
        options: ['32', '36', '40', '42'],
        correct: 1,
        explanation: '10% of 240 is 24, and 5% is 12. 24 + 12 = 36.',
        difficulty: 'easy',
        hint: 'Calculate 10% first, then add half of that amount.'
      },
      {
        id: 'arith_2',
        text: 'If the cost price of an item is $80 and it is sold for $100, what is the profit percentage?',
        options: ['20%', '25%', '30%', '15%'],
        correct: 1,
        explanation: 'Profit = $100 - $80 = $20. Profit % = (20 / 80) * 100 = 25%.',
        difficulty: 'easy',
        hint: 'Profit percentage is (Profit / Cost Price) × 100.'
      },
      {
        id: 'arith_3',
        text: 'Find the average of the first 5 prime numbers: 2, 3, 5, 7, 11.',
        options: ['5.2', '5.6', '6.0', '6.4'],
        correct: 1,
        explanation: 'Sum = 2 + 3 + 5 + 7 + 11 = 28. Average = 28 / 5 = 5.6.',
        difficulty: 'medium',
        hint: 'Sum the numbers and divide by 5.'
      },
      {
        id: 'arith_4',
        text: 'A sum of money doubles itself in 5 years at simple interest. What is the annual interest rate?',
        options: ['15%', '18%', '20%', '25%'],
        correct: 2,
        explanation: 'Simple interest = Principal. Rate = (100 * Interest) / (Principal * Time) = 100 / 5 = 20%.',
        difficulty: 'medium',
        hint: 'Simple Interest = P * R * T / 100.'
      },
      {
        id: 'arith_5',
        text: 'What is the compound interest on $10,000 for 2 years at 10% per annum compounded annually?',
        options: ['$2,000', '$2,100', '$2,200', '$2,050'],
        correct: 1,
        explanation: 'Amount = 10000 * (1.1)^2 = 12,100. Compound interest = 12,100 - 10,000 = $2,100.',
        difficulty: 'hard',
        hint: 'Calculate amount after year 1 ($11,000) and year 2 ($12,100).'
      }
    ],
    'quantitative': [
      {
        id: 'quant_1',
        text: 'The ratio of boys to girls in a class of 45 students is 3:2. How many girls are there?',
        options: ['15', '18', '27', '21'],
        correct: 1,
        explanation: 'Total parts = 3 + 2 = 5. Value of 1 part = 45 / 5 = 9. Girls = 2 * 9 = 18.',
        difficulty: 'easy',
        hint: 'Divide the total by the sum of ratio parts.'
      },
      {
        id: 'quant_2',
        text: 'If x + 1/x = 4, what is the value of x² + 1/x²?',
        options: ['14', '16', '18', '12'],
        correct: 0,
        explanation: '(x + 1/x)² = x² + 2 + 1/x² = 16. Therefore, x² + 1/x² = 16 - 2 = 14.',
        difficulty: 'medium',
        hint: 'Square both sides of the original equation.'
      },
      {
        id: 'quant_3',
        text: 'A train 150m long passes a pole in 9 seconds. What is the speed of the train in km/h?',
        options: ['50 km/h', '60 km/h', '54 km/h', '72 km/h'],
        correct: 1,
        explanation: 'Speed = 150 / 9 m/s = (150 / 9) * (18 / 5) = 60 km/h.',
        difficulty: 'medium',
        hint: 'Multiply m/s by 18/5 to get km/h.'
      },
      {
        id: 'quant_4',
        text: 'In how many different ways can the letters of the word "LEADER" be arranged?',
        options: ['720', '360', '180', '120'],
        correct: 1,
        explanation: 'LEADER has 6 letters with E repeated twice. Arrangements = 6! / 2! = 720 / 2 = 360.',
        difficulty: 'hard',
        hint: 'Divide total factorial by the factorial of repeated letters.'
      }
    ],
    'time-work': [
      {
        id: 'tw_1',
        text: 'A can do a piece of work in 6 days and B in 12 days. In how many days can they finish it working together?',
        options: ['3 days', '4 days', '5 days', '4.5 days'],
        correct: 1,
        explanation: 'Combined 1-day work = 1/6 + 1/12 = 3/12 = 1/4. So total days = 4.',
        difficulty: 'easy',
        hint: 'Add their 1-day work rates together.'
      },
      {
        id: 'tw_2',
        text: 'Pipe A can fill a tank in 4 hours while Pipe B can empty it in 6 hours. If both are open, how long to fill the tank?',
        options: ['10 hours', '12 hours', '8 hours', '15 hours'],
        correct: 1,
        explanation: 'Net rate = 1/4 - 1/6 = 1/12 tank per hour. Tank fills in 12 hours.',
        difficulty: 'medium',
        hint: 'Subtract emptying rate from filling rate.'
      },
      {
        id: 'tw_3',
        text: '12 men can complete a project in 16 days. How many men are needed to finish the same work in 8 days?',
        options: ['18', '20', '24', '28'],
        correct: 2,
        explanation: 'Total man-days = 12 * 16 = 192. Men required = 192 / 8 = 24 men.',
        difficulty: 'medium',
        hint: 'Use M1 × D1 = M2 × D2.'
      }
    ],

    // 2. Data Interpretation
    'tables-charts': [
      {
        id: 'tc_1',
        text: 'In a company sales table, Q1 sales were $40k and Q2 sales were $50k. What is the percentage increase?',
        options: ['20%', '25%', '15%', '30%'],
        correct: 1,
        explanation: 'Increase = $10k. Percentage increase = (10 / 40) * 100 = 25%.',
        difficulty: 'easy',
        hint: 'Percentage change = (Difference / Initial value) × 100.'
      },
      {
        id: 'tc_2',
        text: 'A pie chart shows Expenses: Rent 30%, Food 25%, Savings 20%, Misc 25%. What angle represents Rent?',
        options: ['90°', '108°', '120°', '100°'],
        correct: 1,
        explanation: '30% of 360° = 0.3 * 360 = 108°.',
        difficulty: 'medium',
        hint: 'A full circle is 360 degrees.'
      }
    ],
    'graph-analysis': [
      {
        id: 'ga_1',
        text: 'If a line graph shows temperature rising from 18°C at 6 AM to 30°C at 2 PM, what is the average hourly increase?',
        options: ['1.2°C/hr', '1.5°C/hr', '2.0°C/hr', '1.8°C/hr'],
        correct: 1,
        explanation: 'Time = 8 hours. Increase = 12°C. Average = 12 / 8 = 1.5°C per hour.',
        difficulty: 'medium',
        hint: 'Divide total increase by total elapsed hours.'
      }
    ],
    'caselet': [
      {
        id: 'cas_1',
        text: 'In a class of 100 students, 60 like Math, 45 like Physics, and 20 like both. How many like neither?',
        options: ['10', '15', '20', '25'],
        correct: 1,
        explanation: 'Total liking either = 60 + 45 - 20 = 85. Like neither = 100 - 85 = 15.',
        difficulty: 'medium',
        hint: 'Use Principle of Inclusion-Exclusion: n(A ∪ B) = n(A) + n(B) - n(A ∩ B).'
      }
    ],

    // 3. Logical Reasoning
    'verbal-reasoning': [
      {
        id: 'vr_1',
        text: 'Book is to Reading as Fork is to: ?',
        options: ['Drawing', 'Eating', 'Writing', 'Cooking'],
        correct: 1,
        explanation: 'A book is used for reading; a fork is used for eating.',
        difficulty: 'easy',
        hint: 'Identify the functional purpose of the tool.'
      },
      {
        id: 'vr_2',
        text: 'Statement: "All roses are flowers. Some flowers fade quickly." Conclusion: Some roses fade quickly.',
        options: ['Definitely True', 'Definitely False', 'Not Necessarily True', 'Irrelevant'],
        correct: 2,
        explanation: 'The subset of flowers that fade quickly might not include any roses.',
        difficulty: 'medium',
        hint: 'Consider whether the overlap is mandatory or just possible.'
      }
    ],
    'analytical-reasoning': [
      {
        id: 'ar_1',
        text: 'If A is taller than B, and B is taller than C, who is the shortest?',
        options: ['A', 'B', 'C', 'Cannot be determined'],
        correct: 2,
        explanation: 'A > B > C, therefore C is the shortest.',
        difficulty: 'easy',
        hint: 'Order the individuals by descending height.'
      },
      {
        id: 'ar_2',
        text: 'In a certain code, ROAD is written as URDG. How is SWAN written in that code?',
        options: ['VZDQ', 'VXDO', 'VZDQ', 'VZDP'],
        correct: 0,
        explanation: 'Each letter is shifted by +3 forward: S(+3)=V, W(+3)=Z, A(+3)=D, N(+3)=Q.',
        difficulty: 'medium',
        hint: 'Check the alphabetical shift from R to U (+3).'
      }
    ],
    'non-verbal': [
      {
        id: 'nv_1',
        text: 'If a clock shows 3:15, what is the angle between the hour hand and the minute hand?',
        options: ['0°', '7.5°', '12°', '15°'],
        correct: 1,
        explanation: 'At 3:15, the hour hand has moved 15 * 0.5° = 7.5° past the 3 mark.',
        difficulty: 'medium',
        hint: 'The hour hand moves 0.5 degrees per minute.'
      }
    ],

    // 4. General Knowledge
    'science-tech': [
      {
        id: 'st_1',
        text: 'Which chemical element has the symbol "Fe"?',
        options: ['Fluorine', 'Iron', 'Francium', 'Lead'],
        correct: 1,
        explanation: 'Fe comes from Ferrum, the Latin word for Iron.',
        difficulty: 'easy',
        hint: 'Think of the Latin name Ferrum.'
      },
      {
        id: 'st_2',
        text: 'What is the powerhouse of the eukaryotic cell?',
        options: ['Ribosome', 'Nucleus', 'Mitochondria', 'Endoplasmic Reticulum'],
        correct: 2,
        explanation: 'Mitochondria generate most of the chemical energy needed by cells (ATP).',
        difficulty: 'easy',
        hint: 'Produces ATP through cellular respiration.'
      },
      {
        id: 'st_3',
        text: 'What principle explains why airplanes achieve lift?',
        options: ['Archimedes Principle', 'Bernoulli Principle', 'Pascal Law', 'Coulomb Law'],
        correct: 1,
        explanation: 'Bernoullis principle states that an increase in fluid speed occurs simultaneously with a decrease in pressure.',
        difficulty: 'medium',
        hint: 'Relates fluid velocity to static pressure.'
      }
    ],
    'history-geo': [
      {
        id: 'hg_1',
        text: 'Which is the longest river in the world?',
        options: ['Amazon', 'Nile', 'Yangtze', 'Mississippi'],
        correct: 1,
        explanation: 'The Nile River is traditionally considered the longest river on Earth (~6,650 km).',
        difficulty: 'easy',
        hint: 'Flows north through northeastern Africa.'
      },
      {
        id: 'hg_2',
        text: 'In which year did the Apollo 11 mission land the first humans on the Moon?',
        options: ['1965', '1969', '1971', '1973'],
        correct: 1,
        explanation: 'Neil Armstrong and Buzz Aldrin landed on July 20, 1969.',
        difficulty: 'easy',
        hint: 'Took place at the end of the 1960s.'
      }
    ],
    'current-affairs': [
      {
        id: 'ca_1',
        text: 'Which renewable energy source accounts for the highest global capacity additions in recent years?',
        options: ['Geothermal', 'Solar Photovoltaic', 'Biomass', 'Tidal'],
        correct: 1,
        explanation: 'Solar PV accounts for the majority of global renewable power capacity additions.',
        difficulty: 'easy',
        hint: 'Harnesses sunlight directly.'
      }
    ],

    // 5. Programming
    'prog-fundamentals': [
      {
        id: 'pf_1',
        text: 'Which of the following is NOT a primitive data type in modern JavaScript?',
        options: ['string', 'boolean', 'symbol', 'ArrayList'],
        correct: 3,
        explanation: 'JavaScript primitive types are string, number, bigint, boolean, undefined, symbol, and null. ArrayList is a Java class.',
        difficulty: 'easy',
        hint: 'Think about standard JavaScript versus Java classes.'
      },
      {
        id: 'pf_2',
        text: 'What is the time complexity of looking up a key in a standard Hash Table on average?',
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
        correct: 0,
        explanation: 'Hash table lookups are O(1) constant time on average due to direct key hashing.',
        difficulty: 'easy',
        hint: 'Hash tables offer constant time access in the average case.'
      },
      {
        id: 'pf_3',
        text: 'What does the keyword "const" guarantee in JavaScript for an object?',
        options: ['Object properties are immutable', 'The variable identifier cannot be reassigned', 'Object cannot have new keys added', 'Object is frozen'],
        correct: 1,
        explanation: 'const creates a read-only reference to a value; the identifier cannot be reassigned, but object properties can still be mutated.',
        difficulty: 'medium',
        hint: 'const binds the variable binding, not the contents of referenced objects.'
      }
    ],
    'control-statements': [
      {
        id: 'cs_1',
        text: 'What will happen if a break statement is omitted in a switch case clause?',
        options: ['Syntax Error', 'Execution falls through to the next case', 'Switch block immediately terminates', 'Infinite loop'],
        correct: 1,
        explanation: 'Without a break, execution falls through to execute subsequent case blocks unconditionally.',
        difficulty: 'easy',
        hint: 'Think about standard switch-case fall-through behavior.'
      },
      {
        id: 'cs_2',
        text: 'How many times will this loop execute: for(let i = 0; i < 10; i += 2)?',
        options: ['4', '5', '6', '10'],
        correct: 1,
        explanation: 'i values will be 0, 2, 4, 6, 8 (total 5 iterations).',
        difficulty: 'easy',
        hint: 'List the values of i: 0, 2, 4, 6, 8.'
      }
    ],
    'arrays-ds': [
      {
        id: 'ads_1',
        text: 'Which data structure follows the Last-In, First-Out (LIFO) principle?',
        options: ['Queue', 'Stack', 'Linked List', 'Binary Tree'],
        correct: 1,
        explanation: 'A Stack is a LIFO structure where elements added last are popped first.',
        difficulty: 'easy',
        hint: 'Think of a stack of plates.'
      },
      {
        id: 'ads_2',
        text: 'What is the worst-case time complexity of QuickSort?',
        options: ['O(n log n)', 'O(n²)', 'O(n)', 'O(log n)'],
        correct: 1,
        explanation: 'When the pivot chosen is consistently the smallest or largest element, QuickSort degrades to O(n²).',
        difficulty: 'medium',
        hint: 'Degrades when partitions are completely unbalanced.'
      }
    ],

    // 6. Computer Science
    'operating-systems': [
      {
        id: 'os_1',
        text: 'Which condition is NOT one of Coffmans four conditions for deadlock?',
        options: ['Mutual Exclusion', 'Hold and Wait', 'Preemption Allowed', 'Circular Wait'],
        correct: 2,
        explanation: 'Coffmans condition requires No Preemption. Preemption being allowed prevents deadlock.',
        difficulty: 'medium',
        hint: 'Deadlock requires that resources cannot be forcibly seized.'
      },
      {
        id: 'os_2',
        text: 'What is the primary function of the OS Virtual Memory Manager?',
        options: ['Speed up CPU clock', 'Simulate more RAM using secondary storage', 'Encrypt files on disk', 'Manage network packets'],
        correct: 1,
        explanation: 'Virtual memory allows an OS to execute processes that require more memory than physically available in RAM.',
        difficulty: 'easy',
        hint: 'Uses paging/swap on disk to extend memory address space.'
      }
    ],
    'dbms': [
      {
        id: 'db_1',
        text: 'In relational database design, what does ACID stand for?',
        options: [
          'Atomicity, Consistency, Isolation, Durability',
          'Accuracy, Completeness, Integrity, Durability',
          'Access, Control, Indexing, Distribution',
          'Allocation, Concurrency, Isolation, Deletion'
        ],
        correct: 0,
        explanation: 'ACID transactions guarantee Atomicity, Consistency, Isolation, and Durability.',
        difficulty: 'easy',
        hint: 'First word is Atomicity (all or nothing).'
      },
      {
        id: 'db_2',
        text: 'Which SQL clause is used to filter records resulting from an aggregate GROUP BY query?',
        options: ['WHERE', 'HAVING', 'FILTER', 'ORDER BY'],
        correct: 1,
        explanation: 'HAVING filters aggregated groups, whereas WHERE filters individual rows before grouping.',
        difficulty: 'easy',
        hint: 'WHERE filters rows; this clause filters grouped rows.'
      }
    ],
    'networks': [
      {
        id: 'net_1',
        text: 'Which layer of the OSI model does the TCP protocol operate at?',
        options: ['Network Layer', 'Transport Layer', 'Data Link Layer', 'Session Layer'],
        correct: 1,
        explanation: 'TCP (Transmission Control Protocol) operates at Layer 4: Transport Layer.',
        difficulty: 'easy',
        hint: 'Responsible for end-to-end communication and reliability.'
      },
      {
        id: 'net_2',
        text: 'What is the default port used by HTTPS secure web traffic?',
        options: ['80', '8080', '443', '22'],
        correct: 2,
        explanation: 'Port 80 is HTTP, 443 is HTTPS, 22 is SSH.',
        difficulty: 'easy',
        hint: 'Standard HTTP is 80, secure is 443.'
      }
    ],

    // 7. Engineering
    'electrical': [
      {
        id: 'ee_1',
        text: 'According to Ohms Law, what is the formula connecting Voltage (V), Current (I), and Resistance (R)?',
        options: ['V = I / R', 'V = I * R', 'V = R / I', 'I = V * R'],
        correct: 1,
        explanation: 'Ohms law states that Voltage equals Current multiplied by Resistance (V = I * R).',
        difficulty: 'easy',
        hint: 'V equals current times resistance.'
      },
      {
        id: 'ee_2',
        text: 'What is the unit of electrical capacitance?',
        options: ['Henry', 'Farad', 'Tesla', 'Siemens'],
        correct: 1,
        explanation: 'The SI unit of capacitance is the Farad (F), named after Michael Faraday.',
        difficulty: 'easy',
        hint: 'Named after Michael Faraday.'
      }
    ],
    'mechanical': [
      {
        id: 'me_1',
        text: 'Which thermodynamic cycle represents the theoretical maximum efficiency for a heat engine?',
        options: ['Rankine Cycle', 'Otto Cycle', 'Carnot Cycle', 'Diesel Cycle'],
        correct: 2,
        explanation: 'The Carnot cycle is an ideal reversible cycle that gives the upper limit of efficiency.',
        difficulty: 'medium',
        hint: 'Named after French physicist Nicolas Leonard Sadi Carnot.'
      }
    ],
    'eng-math': [
      {
        id: 'em_1',
        text: 'What is the derivative of sin(x) with respect to x?',
        options: ['-cos(x)', 'cos(x)', '-sin(x)', 'tan(x)'],
        correct: 1,
        explanation: 'd/dx [sin(x)] = cos(x).',
        difficulty: 'easy',
        hint: 'The rate of change of sine is cosine.'
      },
      {
        id: 'em_2',
        text: 'What is the determinant of a 2x2 matrix [[a, b], [c, d]]?',
        options: ['ad + bc', 'ad - bc', 'ab - cd', 'ac - bd'],
        correct: 1,
        explanation: 'The determinant of [[a, b], [c, d]] is ad - bc.',
        difficulty: 'easy',
        hint: 'Product of main diagonal minus product of anti-diagonal.'
      }
    ],

    // 8. Medical
    'anatomy': [
      {
        id: 'an_1',
        text: 'How many chambers are there in the human heart?',
        options: ['2', '3', '4', '6'],
        correct: 2,
        explanation: 'The human heart has 4 chambers: two atria (left and right) and two ventricles (left and right).',
        difficulty: 'easy',
        hint: 'Two atria and two ventricles.'
      },
      {
        id: 'an_2',
        text: 'Which is the largest bone in the human body?',
        options: ['Tibia', 'Humerus', 'Femur', 'Fibula'],
        correct: 2,
        explanation: 'The femur (thigh bone) is the longest and strongest bone in the human skeleton.',
        difficulty: 'easy',
        hint: 'Found in the thigh.'
      }
    ],
    'physiology': [
      {
        id: 'ph_1',
        text: 'Which blood cells are primarily responsible for transporting oxygen throughout the body?',
        options: ['Leukocytes', 'Erythrocytes (Red Blood Cells)', 'Thrombocytes', 'Neutrophils'],
        correct: 1,
        explanation: 'Erythrocytes contain hemoglobin which binds and transports oxygen.',
        difficulty: 'easy',
        hint: 'Contain hemoglobin.'
      },
      {
        id: 'ph_2',
        text: 'What hormone produced by the pancreas regulates glucose levels by facilitating cellular uptake?',
        options: ['Glucagon', 'Insulin', 'Cortisol', 'Adrenaline'],
        correct: 1,
        explanation: 'Insulin is produced by beta cells in pancreatic islets and lowers blood glucose.',
        difficulty: 'easy',
        hint: 'Produced by beta cells in the pancreas.'
      }
    ],
    'medical-science': [
      {
        id: 'ms_1',
        text: 'Which Scottish physician and microbiologist discovered penicillin in 1928?',
        options: ['Alexander Fleming', 'Louis Pasteur', 'Robert Koch', 'Edward Jenner'],
        correct: 0,
        explanation: 'Alexander Fleming discovered penicillin in 1928 from Penicillium notatum mold.',
        difficulty: 'easy',
        hint: 'First name is Alexander.'
      }
    ]
  };

  // Helper: pseudo-random number generator with seed
  function seededRandom(seed) {
    let s = Math.sin(seed++) * 10000;
    return s - Math.floor(s);
  }

  // Shuffle array with seed offset
  function shuffleWithSeed(array, seedOffset = 0) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(seededRandom(seedOffset + i * 37) * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // Generate synthetic question variations if question pool is small
  function generateSyntheticQuestion(submoduleId, index, difficulty) {
    return {
      id: `${submoduleId}_gen_${index}`,
      text: `[${submoduleId.toUpperCase()}] Knowledge Check Q${index + 1}: Select the scientifically accurate statement:`,
      options: [
        `Optimal fundamental principle regarding ${submoduleId} application`,
        `Theoretical inverse variation of the core concept`,
        `Alternative heuristic without standard empirical validation`,
        `Superficial correlation observed under non-standard conditions`
      ],
      correct: 0,
      explanation: `In ${submoduleId}, the first proposition reflects foundational core theory and standard empirical validation.`,
      difficulty: difficulty,
      hint: `Recall the foundational definition and standard principles in ${submoduleId}.`
    };
  }

  // --------------------------------------------------------------------------
  // Core Quiz Engine Implementation
  // --------------------------------------------------------------------------
  const CortexQuiz = {
    /**
     * Start a new level
     * @param {string} moduleId - Parent module identifier
     * @param {string} submoduleId - Submodule identifier
     * @param {number} levelNumber - Current level (1-50)
     * @param {string} difficulty - 'easy' | 'medium' | 'hard'
     */
    startLevel: function (moduleId, submoduleId, levelNumber = 1, difficulty = 'medium') {
      currentModule = moduleId || 'general-aptitude';
      currentSubmodule = submoduleId || 'arithmetic';
      currentLevel = parseInt(levelNumber, 10) || 1;
      currentDifficulty = difficulty || 'medium';

      // Load questions for level
      questions = this.getQuestionsForLevel(currentSubmodule, currentLevel, currentDifficulty);
      currentIndex = 0;
      answers = new Array(questions.length);
      streakCount = 0;
      levelRewardGiven = false;
      hintUsedThisQuestion = false;
      levelStartTime = Date.now();
      questionStartTime = Date.now();

      // Trigger audio if available
      try {
        if (window.CortexAudio && typeof window.CortexAudio.playBGM === 'function') {
          // Play module-specific track or gameplay track
          const bgmKey = currentModule || 'gameplay';
          window.CortexAudio.playBGM(bgmKey);
        }
      } catch (err) {
        console.warn('[CortexQuiz] Audio start error:', err);
      }

      return {
        success: true,
        firstQuestion: this.getCurrentQuestion()
      };
    },

    /**
     * Get the current question object with index and state info
     */
    getCurrentQuestion: function () {
      if (!questions || questions.length === 0 || currentIndex >= questions.length) {
        return null;
      }

      const q = questions[currentIndex];
      const answerState = answers[currentIndex];

      return {
        id: q.id,
        text: q.text,
        options: [...q.options],
        correct: q.correct,
        explanation: q.explanation,
        hint: q.hint || 'Carefully analyze each option before choosing.',
        difficulty: q.difficulty || currentDifficulty,
        index: currentIndex,
        total: questions.length,
        isAnswered: Boolean(answerState),
        selectedOption: answerState ? answerState.optionIndex : null,
        isCorrect: answerState ? answerState.isCorrect : null
      };
    },

    /**
     * Submit an answer for the current question
     * @param {number} optionIndex - Chosen option index (0-3)
     */
    submitAnswer: function (optionIndex) {
      if (!questions || currentIndex >= questions.length) {
        return { error: 'No active question' };
      }

      // Check if already answered - prevent duplicate rewards
      if (answers[currentIndex] !== undefined && answers[currentIndex] !== null) {
        const existing = answers[currentIndex];
        return {
          alreadyAnswered: true,
          correct: existing.isCorrect,
          correctIndex: existing.correctIndex,
          explanation: questions[currentIndex].explanation,
          xpEarned: existing.xpEarned,
          coinsEarned: existing.coinsEarned,
          streak: streakCount
        };
      }

      const q = questions[currentIndex];
      const isCorrect = optionIndex === q.correct;
      const timeSpent = Math.max(1, Math.round((Date.now() - questionStartTime) / 1000));

      let xpEarned = 0;
      let coinsEarned = 0;

      if (isCorrect) {
        let baseXP = 20;
        coinsEarned = 5;

        // Check if Double XP Boost is active from Shop
        let doubleXpActive = false;
        try {
          if (window.CortexShop && typeof window.CortexShop.isDoubleXPActive === 'function') {
            doubleXpActive = window.CortexShop.isDoubleXPActive();
            if (doubleXpActive && typeof window.CortexShop.consumeDoubleXP === 'function') {
              window.CortexShop.consumeDoubleXP();
              baseXP *= 2;
            }
          }
        } catch (e) {
          console.warn('[CortexQuiz] Error checking double XP boost:', e);
        }

        xpEarned = baseXP;
        streakCount++;

        // Award player currency
        try {
          if (window.CortexPlayer) {
            if (typeof window.CortexPlayer.addXP === 'function') window.CortexPlayer.addXP(xpEarned);
            if (typeof window.CortexPlayer.addCoins === 'function') window.CortexPlayer.addCoins(coinsEarned);
          }
        } catch (e) {
          console.warn('[CortexQuiz] Error awarding player rewards:', e);
        }

        // Trigger block puzzle correct placement
        try {
          if (window.CortexPuzzle && typeof window.CortexPuzzle.triggerCorrect === 'function') {
            window.CortexPuzzle.triggerCorrect();
          }
        } catch (e) {
          console.warn('[CortexQuiz] Error triggering puzzle correct block:', e);
        }

        // Audio voice feedback for correct
        try {
          if (window.CortexAudio) {
            if (typeof window.CortexAudio.playCorrectVoice === 'function') {
              window.CortexAudio.playCorrectVoice();
            } else if (typeof window.CortexAudio.playVoice === 'function') {
              const voiceKey = streakCount >= 5 ? 'amazing' : streakCount >= 3 ? 'awesome' : 'great';
              window.CortexAudio.playVoice(voiceKey);
            }
          }
        } catch (e) {
          console.warn('[CortexQuiz] Audio correct feedback error:', e);
        }
      } else {
        // Wrong answer
        streakCount = 0;

        // Trigger block puzzle wrong placement
        try {
          if (window.CortexPuzzle && typeof window.CortexPuzzle.triggerWrong === 'function') {
            window.CortexPuzzle.triggerWrong();
          }
        } catch (e) {
          console.warn('[CortexQuiz] Error triggering puzzle wrong block:', e);
        }

        // Audio voice feedback for wrong
        try {
          if (window.CortexAudio) {
            if (typeof window.CortexAudio.playWrongVoice === 'function') {
              window.CortexAudio.playWrongVoice();
            } else if (typeof window.CortexAudio.playVoice === 'function') {
              window.CortexAudio.playVoice('try-again');
            }
          }
        } catch (e) {
          console.warn('[CortexQuiz] Audio wrong feedback error:', e);
        }
      }

      // Record answer
      const resultObj = {
        optionIndex: optionIndex,
        isCorrect: isCorrect,
        correctIndex: q.correct,
        timeSpent: timeSpent,
        xpEarned: xpEarned,
        coinsEarned: coinsEarned
      };
      answers[currentIndex] = resultObj;

      // Update player question stats
      try {
        if (window.CortexPlayer && typeof window.CortexPlayer.updateQuestionsStats === 'function') {
          window.CortexPlayer.updateQuestionsStats(isCorrect);
        }
      } catch (e) {
        console.warn('[CortexQuiz] Error updating question stats:', e);
      }

      // Daily challenge progress hook
      try {
        if (window.CortexGamification && typeof window.CortexGamification.updateDailyChallengeProgress === 'function') {
          window.CortexGamification.updateDailyChallengeProgress('quiz', {
            correct: isCorrect,
            submoduleId: currentSubmodule,
            streak: streakCount
          });
        }
      } catch (e) {
        console.warn('[CortexQuiz] Daily challenge update error:', e);
      }

      // Check achievements
      try {
        if (window.CortexGamification && typeof window.CortexGamification.checkAchievements === 'function') {
          window.CortexGamification.checkAchievements();
        }
      } catch (e) {
        console.warn('[CortexQuiz] Check achievements error:', e);
      }

      return {
        correct: isCorrect,
        correctIndex: q.correct,
        explanation: q.explanation,
        xpEarned: xpEarned,
        coinsEarned: coinsEarned,
        streak: streakCount
      };
    },

    /**
     * Advance to the next question
     * @returns {Object} { hasNext: boolean, question: Object|null }
     */
    nextQuestion: function () {
      if (currentIndex + 1 < questions.length) {
        currentIndex++;
        hintUsedThisQuestion = false;
        questionStartTime = Date.now();
        return {
          hasNext: true,
          question: this.getCurrentQuestion()
        };
      }
      return {
        hasNext: false,
        question: null
      };
    },

    /**
     * Calculate and return full results for the level
     */
    getLevelResults: function () {
      const total = questions.length;
      let correctCount = 0;
      let totalXpEarned = 0;
      let totalCoinsEarned = 0;

      for (let i = 0; i < total; i++) {
        if (answers[i]) {
          if (answers[i].isCorrect) correctCount++;
          totalXpEarned += answers[i].xpEarned || 0;
          totalCoinsEarned += answers[i].coinsEarned || 0;
        }
      }

      const percentage = total > 0 ? Math.round((correctCount / total) * 100) : 0;

      // Stars calculation:
      // 3 stars = 100%
      // 2 stars = 80%+
      // 1 star  = 60%+
      // 0 stars = < 60%
      let stars = 0;
      if (percentage === 100) {
        stars = 3;
      } else if (percentage >= 80) {
        stars = 2;
      } else if (percentage >= 60) {
        stars = 1;
      } else {
        stars = 0;
      }

      // Check Star Shield boost from shop
      try {
        if (window.CortexShop && typeof window.CortexShop.isStarShieldActive === 'function') {
          if (window.CortexShop.isStarShieldActive() && stars < 2) {
            stars = 2;
            if (typeof window.CortexShop.consumeStarShield === 'function') {
              window.CortexShop.consumeStarShield();
            }
          }
        }
      } catch (e) {
        console.warn('[CortexQuiz] Star shield error:', e);
      }

      // Check if first-time completion
      let isFirstCompletion = false;
      let bonusXp = 0;
      let bonusCoins = 0;
      let bonusStars = 0;

      try {
        if (window.CortexStore && typeof window.CortexStore.getPlayer === 'function') {
          const player = window.CortexStore.getPlayer() || {};
          const progress = player.progress || {};
          const subProgress = progress[currentSubmodule] || {};
          const completedLevels = subProgress.completedLevels || [];

          if (!completedLevels.includes(currentLevel) && stars > 0) {
            isFirstCompletion = true;
          }
        }
      } catch (e) {
        console.warn('[CortexQuiz] Error checking first completion status:', e);
      }

      // Award completion bonus only once
      if (isFirstCompletion && !levelRewardGiven) {
        bonusXp = 100;
        bonusCoins = 25;
        bonusStars = 1;
        levelRewardGiven = true;

        try {
          if (window.CortexPlayer) {
            if (typeof window.CortexPlayer.addXP === 'function') window.CortexPlayer.addXP(bonusXp);
            if (typeof window.CortexPlayer.addCoins === 'function') window.CortexPlayer.addCoins(bonusCoins);
            if (typeof window.CortexPlayer.addStars === 'function') window.CortexPlayer.addStars(bonusStars);
          }
        } catch (e) {
          console.warn('[CortexQuiz] Error awarding completion bonus:', e);
        }
      }

      // Mark level complete & unlock next level in CortexStore
      try {
        if (window.CortexStore && typeof window.CortexStore.getPlayer === 'function') {
          const player = window.CortexStore.getPlayer() || {};
          const progress = player.progress || {};
          const subProgress = progress[currentSubmodule] || {
            currentLevel: 1,
            completedLevels: [],
            highScores: {}
          };

          if (stars > 0 && !subProgress.completedLevels.includes(currentLevel)) {
            subProgress.completedLevels.push(currentLevel);
          }

          subProgress.highScores = subProgress.highScores || {};
          const oldScore = subProgress.highScores[currentLevel] || 0;
          subProgress.highScores[currentLevel] = Math.max(oldScore, stars);

          // Unlock next level if this level was completed with at least 1 star
          if (stars > 0) {
            subProgress.currentLevel = Math.max(subProgress.currentLevel || 1, currentLevel + 1);
          }

          progress[currentSubmodule] = subProgress;

          if (typeof window.CortexStore.updatePlayer === 'function') {
            window.CortexStore.updatePlayer({ progress });
          }
        }
      } catch (e) {
        console.warn('[CortexQuiz] Error saving level progress to store:', e);
      }

      // Gamification check
      try {
        if (window.CortexGamification && typeof window.CortexGamification.checkAchievements === 'function') {
          window.CortexGamification.checkAchievements();
        }
      } catch (e) {
        console.warn('[CortexQuiz] Achievements check error:', e);
      }

      // Audio feedback
      try {
        if (window.CortexAudio) {
          if (typeof window.CortexAudio.playVoice === 'function') {
            window.CortexAudio.playVoice('level-complete');
          }
          if (typeof window.CortexAudio.playBGM === 'function') {
            window.CortexAudio.playBGM('victory');
          }
        }
      } catch (e) {
        console.warn('[CortexQuiz] Victory audio error:', e);
      }

      return {
        correct: correctCount,
        total: total,
        percentage: percentage,
        stars: stars,
        xpEarned: totalXpEarned + bonusXp,
        coinsEarned: totalCoinsEarned + bonusCoins,
        starsEarned: bonusStars,
        isFirstCompletion: isFirstCompletion,
        levelNumber: currentLevel,
        submoduleId: currentSubmodule,
        nextLevelUnlocked: currentLevel + 1
      };
    },

    /**
     * Get snapshot of current level state
     */
    getCurrentLevelState: function () {
      return {
        index: currentIndex,
        total: questions.length,
        question: this.getCurrentQuestion(),
        elapsedTime: this.getTimeElapsed(),
        streak: streakCount,
        answersCount: answers.filter(Boolean).length
      };
    },

    /**
     * Use a hint for the current question
     */
    useHint: function () {
      if (hintUsedThisQuestion) {
        return {
          success: false,
          message: 'Hint already used for this question'
        };
      }

      const q = questions[currentIndex];
      if (!q) {
        return { success: false, message: 'No active question' };
      }

      // Check if player has hints in inventory from the Shop
      try {
        if (window.CortexShop && typeof window.CortexShop.getHintCount === 'function' && window.CortexShop.getHintCount() > 0) {
          if (typeof window.CortexShop.useHint === 'function') {
            window.CortexShop.useHint();
            hintUsedThisQuestion = true;
            return {
              success: true,
              hint: q.hint || 'Think carefully about each option.',
              cost: 0,
              fromInventory: true
            };
          }
        }
      } catch (e) {
        console.warn('[CortexQuiz] Inventory hint check error:', e);
      }

      // Otherwise check coins: cost is 10 coins
      const hintCost = 10;
      let canAfford = false;

      try {
        if (window.CortexPlayer && typeof window.CortexPlayer.getCoinsBalance === 'function') {
          canAfford = window.CortexPlayer.getCoinsBalance() >= hintCost;
        } else {
          canAfford = true;
        }
      } catch (e) {
        canAfford = true;
      }

      if (!canAfford) {
        return {
          success: false,
          message: 'Insufficient coins. Hints cost 10 coins.',
          cost: hintCost
        };
      }

      // Deduct coins
      try {
        if (window.CortexPlayer && typeof window.CortexPlayer.spendCoins === 'function') {
          const spent = window.CortexPlayer.spendCoins(hintCost);
          if (!spent) {
            return { success: false, message: 'Insufficient coins', cost: hintCost };
          }
        }
      } catch (e) {
        console.warn('[CortexQuiz] Spend coins error:', e);
      }

      hintUsedThisQuestion = true;
      return {
        success: true,
        hint: q.hint || 'Carefully re-read the premise and test extreme boundary cases.',
        cost: hintCost
      };
    },

    /**
     * Skip the current question (marks as wrong and advances)
     */
    skipQuestion: function () {
      if (answers[currentIndex] === undefined || answers[currentIndex] === null) {
        this.submitAnswer(-1); // -1 indicates skipped/unanswered
      }
      return this.nextQuestion();
    },

    /**
     * Get elapsed time in seconds for the current question
     */
    getTimeElapsed: function () {
      if (!questionStartTime) return 0;
      return Math.max(0, Math.floor((Date.now() - questionStartTime) / 1000));
    },

    /**
     * Get total elapsed time in seconds for the whole level
     */
    getLevelTimeElapsed: function () {
      if (!levelStartTime) return 0;
      return Math.max(0, Math.floor((Date.now() - levelStartTime) / 1000));
    },

    /**
     * Select 10 questions for a submodule & level
     * Level 1-10: easy questions prioritized
     * Level 11-30: medium questions prioritized
     * Level 31-50: hard questions prioritized
     */
    getQuestionsForLevel: function (submoduleId, levelNumber = 1, difficulty = 'medium') {
      const lvl = parseInt(levelNumber, 10) || 1;
      let targetDiff = difficulty;

      if (lvl <= 10) {
        targetDiff = 'easy';
      } else if (lvl <= 30) {
        targetDiff = 'medium';
      } else {
        targetDiff = 'hard';
      }

      let pool = [];

      // Try loading from window.CortexModulesData if present
      try {
        if (window.CortexModulesData && typeof window.CortexModulesData.getQuestionsForSubmodule === 'function') {
          const externalQuestions = window.CortexModulesData.getQuestionsForSubmodule(submoduleId);
          if (Array.isArray(externalQuestions) && externalQuestions.length > 0) {
            pool = [...externalQuestions];
          }
        }
      } catch (e) {
        console.warn('[CortexQuiz] CortexModulesData lookup error:', e);
      }

      // If pool is still empty or small, pull from fallbackQuestionBank
      if (pool.length === 0) {
        if (fallbackQuestionBank[submoduleId]) {
          pool = [...fallbackQuestionBank[submoduleId]];
        } else {
          // Grab from any available bank or generate
          const allBanks = Object.values(fallbackQuestionBank).flat();
          pool = allBanks.length > 0 ? [...allBanks] : [];
        }
      }

      // Prioritize questions by target difficulty
      let primary = pool.filter(q => q.difficulty === targetDiff);
      let secondary = pool.filter(q => q.difficulty !== targetDiff);

      // Deterministic shuffle with level-based seed offset
      primary = shuffleWithSeed(primary, lvl * 101);
      secondary = shuffleWithSeed(secondary, lvl * 211);

      let selected = [...primary, ...secondary];

      // If less than 10 questions, synthesize/cycle without infinite loops
      const targetCount = 10;
      let result = [];
      let cycleIndex = 0;

      while (result.length < targetCount) {
        if (selected.length > 0) {
          const item = selected[cycleIndex % selected.length];
          // Clone item to avoid mutation issues
          result.push({
            ...item,
            id: `${item.id}_lvl${lvl}_${result.length}`
          });
          cycleIndex++;
        } else {
          // Fallback synthesizer
          result.push(generateSyntheticQuestion(submoduleId, result.length, targetDiff));
        }
      }

      return result.slice(0, targetCount);
    }
  };

  // Expose on global window object
  window.CortexQuiz = CortexQuiz;

})(window);
