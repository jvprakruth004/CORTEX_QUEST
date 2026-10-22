/**
 * ============================================================================
 * CORTEX QUEST — MOCK TEST ENGINE (mock-test.js)
 * ============================================================================
 * Exposes window.CortexMockTest
 * 30 questions selected across all 8 modules (balanced weights).
 * 30-minute exam timer, flagging for review, summary grid,
 * delayed evaluation, module-by-module breakdown, and persistence.
 */

(function (window) {
  'use strict';

  // --------------------------------------------------------------------------
  // The 8 Core Modules & Submodules
  // --------------------------------------------------------------------------
  const MODULES_CONFIG = [
    { id: 'general-aptitude', name: 'General Aptitude', submodules: ['arithmetic', 'quantitative', 'time-work'] },
    { id: 'data-interpretation', name: 'Data Interpretation', submodules: ['tables-charts', 'graph-analysis', 'caselet'] },
    { id: 'logical-reasoning', name: 'Logical Reasoning', submodules: ['verbal-reasoning', 'analytical-reasoning', 'non-verbal'] },
    { id: 'general-knowledge', name: 'General Knowledge', submodules: ['science-tech', 'history-geo', 'current-affairs'] },
    { id: 'programming', name: 'Programming', submodules: ['prog-fundamentals', 'control-statements', 'arrays-ds'] },
    { id: 'computer-science', name: 'Computer Science', submodules: ['operating-systems', 'dbms', 'networks'] },
    { id: 'engineering', name: 'Engineering', submodules: ['electrical', 'mechanical', 'eng-math'] },
    { id: 'medical', name: 'Medical Sciences', submodules: ['anatomy', 'physiology', 'medical-science'] }
  ];

  // --------------------------------------------------------------------------
  // Curated Multi-Disciplinary Question Pool for Mock Tests
  // (Ensures high quality questions across all subjects)
  // --------------------------------------------------------------------------
  const MOCK_QUESTION_BANK = [
    // Aptitude
    {
      id: 'mock_apt_1',
      moduleId: 'general-aptitude',
      submoduleId: 'arithmetic',
      text: 'A merchant marks goods up by 40% and then gives a discount of 25%. What is his net profit percentage?',
      options: ['5%', '10%', '15%', '12%'],
      correct: 0,
      explanation: 'Let CP = 100. MP = 140. SP = 140 * 0.75 = 105. Net profit = 5%.'
    },
    {
      id: 'mock_apt_2',
      moduleId: 'general-aptitude',
      submoduleId: 'quantitative',
      text: 'Find the greatest number that will divide 148, 246, and 623 leaving remainders 4, 6, and 11 respectively.',
      options: ['12', '16', '18', '24'],
      correct: 0,
      explanation: 'HCF of (148-4=144), (246-6=240), and (623-11=612). HCF(144, 240, 612) = 12.'
    },
    {
      id: 'mock_apt_3',
      moduleId: 'general-aptitude',
      submoduleId: 'time-work',
      text: 'A and B together can do a job in 12 days. B alone can do it in 30 days. In how many days can A do it alone?',
      options: ['18 days', '20 days', '24 days', '15 days'],
      correct: 1,
      explanation: '1/A = 1/12 - 1/30 = (5 - 2)/60 = 3/60 = 1/20. So A takes 20 days.'
    },
    {
      id: 'mock_apt_4',
      moduleId: 'general-aptitude',
      submoduleId: 'arithmetic',
      text: 'Two trains running in opposite directions cross a man standing on the platform in 27s and 17s, and cross each other in 23s. What is the ratio of their speeds?',
      options: ['3:2', '1:2', '2:3', '3:4'],
      correct: 0,
      explanation: 'Using alligation: (23 - 17) / (27 - 23) = 6 / 4 = 3/2.'
    },

    // Data Interpretation
    {
      id: 'mock_di_1',
      moduleId: 'data-interpretation',
      submoduleId: 'tables-charts',
      text: 'In a company of 500 employees, 60% are male. If 20% of males and 30% of females are in management, how many managers are there?',
      options: ['110', '120', '130', '140'],
      correct: 1,
      explanation: 'Males = 300, Females = 200. Male managers = 60, Female managers = 60. Total = 120.'
    },
    {
      id: 'mock_di_2',
      moduleId: 'data-interpretation',
      submoduleId: 'graph-analysis',
      text: 'A radar chart evaluates 5 performance parameters each out of 10. Scores are 8, 7, 9, 6, 10. What is the average rating percentage?',
      options: ['75%', '80%', '82%', '85%'],
      correct: 1,
      explanation: 'Sum = 40 out of 50. Percentage = (40 / 50) * 100 = 80%.'
    },
    {
      id: 'mock_di_3',
      moduleId: 'data-interpretation',
      submoduleId: 'caselet',
      text: 'A school has 400 students in 3 clubs: Robotics (180), Debate (150), Drama (120). 40 are in both Robotics and Debate, 30 in Debate and Drama, 20 in Robotics and Drama, and 10 in all three. How many are in at least one club?',
      options: ['360', '370', '350', '380'],
      correct: 1,
      explanation: 'Union = 180 + 150 + 120 - 40 - 30 - 20 + 10 = 370 students.'
    },
    {
      id: 'mock_di_4',
      moduleId: 'data-interpretation',
      submoduleId: 'tables-charts',
      text: 'Quarterly revenues are Q1: $2M, Q2: $2.5M, Q3: $3M, Q4: $4.5M. What percentage of total revenue was generated in Q4?',
      options: ['35%', '37.5%', '40%', '42.5%'],
      correct: 1,
      explanation: 'Total = 2 + 2.5 + 3 + 4.5 = 12M. Q4 percentage = (4.5 / 12) * 100 = 37.5%.'
    },

    // Logical Reasoning
    {
      id: 'mock_lr_1',
      moduleId: 'logical-reasoning',
      submoduleId: 'verbal-reasoning',
      text: 'Which word does NOT belong with the others: Microscope, Telescope, Periscope, Stethoscope?',
      options: ['Microscope', 'Telescope', 'Periscope', 'Stethoscope'],
      correct: 3,
      explanation: 'Microscope, Telescope, and Periscope are optical instruments. A stethoscope is an acoustic medical instrument.'
    },
    {
      id: 'mock_lr_2',
      moduleId: 'logical-reasoning',
      submoduleId: 'analytical-reasoning',
      text: 'Pointing to a photograph, a woman says, "His mother is the only daughter of my mother." How is the woman related to the boy in the photo?',
      options: ['Mother', 'Aunt', 'Sister', 'Grandmother'],
      correct: 0,
      explanation: 'The only daughter of my mother is the woman herself. So she is the mother of the boy.'
    },
    {
      id: 'mock_lr_3',
      moduleId: 'logical-reasoning',
      submoduleId: 'non-verbal',
      text: 'If SOUTH-EAST becomes NORTH, and NORTH-EAST becomes WEST, what will WEST become?',
      options: ['SOUTH-EAST', 'SOUTH-WEST', 'NORTH-WEST', 'SOUTH'],
      correct: 0,
      explanation: 'Each direction rotates 135 degrees counter-clockwise. WEST rotated 135 degrees counter-clockwise becomes SOUTH-EAST.'
    },
    {
      id: 'mock_lr_4',
      moduleId: 'logical-reasoning',
      submoduleId: 'analytical-reasoning',
      text: 'Find the missing number in the series: 4, 9, 25, 49, 121, ?',
      options: ['144', '169', '196', '225'],
      correct: 1,
      explanation: 'These are squares of prime numbers: 2², 3², 5², 7², 11², 13² = 169.'
    },

    // General Knowledge
    {
      id: 'mock_gk_1',
      moduleId: 'general-knowledge',
      submoduleId: 'science-tech',
      text: 'Which gas is most abundant in the Earth atmosphere by volume?',
      options: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Argon'],
      correct: 1,
      explanation: 'Nitrogen makes up approximately 78.08% of the Earth atmosphere by volume.'
    },
    {
      id: 'mock_gk_2',
      moduleId: 'general-knowledge',
      submoduleId: 'history-geo',
      text: 'Which canal connects the Mediterranean Sea to the Red Sea?',
      options: ['Panama Canal', 'Suez Canal', 'Kiel Canal', 'Erie Canal'],
      correct: 1,
      explanation: 'The Suez Canal in Egypt connects the Mediterranean Sea directly to the Red Sea.'
    },
    {
      id: 'mock_gk_3',
      moduleId: 'general-knowledge',
      submoduleId: 'current-affairs',
      text: 'What is the primary function of the James Webb Space Telescope (JWST)?',
      options: ['Infrared astronomy and deep universe exploration', 'X-ray pulsar observation', 'Solar flare monitoring', 'Radio astronomy array'],
      correct: 0,
      explanation: 'JWST is primarily an infrared observatory designed to study early galaxy formation and exoplanet atmospheres.'
    },
    {
      id: 'mock_gk_4',
      moduleId: 'general-knowledge',
      submoduleId: 'science-tech',
      text: 'What particle is exchanged in the electromagnetic fundamental interaction?',
      options: ['Gluon', 'Photon', 'W and Z bosons', 'Graviton'],
      correct: 1,
      explanation: 'The photon is the gauge boson that mediates electromagnetic forces between charged particles.'
    },

    // Programming
    {
      id: 'mock_prg_1',
      moduleId: 'programming',
      submoduleId: 'prog-fundamentals',
      text: 'What will be the output of `typeof NaN` in JavaScript?',
      options: ['"undefined"', '"number"', '"NaN"', '"null"'],
      correct: 1,
      explanation: 'In JavaScript, NaN represents "Not-a-Number", but its data type according to IEEE 754 floating point standard is "number".'
    },
    {
      id: 'mock_prg_2',
      moduleId: 'programming',
      submoduleId: 'control-statements',
      text: 'Which recursion base case is essential for preventing infinite stack frame allocation?',
      options: ['Condition where the function returns without calling itself', 'Calling the function with inverted arguments', 'Dynamic memory allocation check', 'Exception throw block'],
      correct: 0,
      explanation: 'A base case is a stopping condition where the function terminates without recurring, preventing stack overflow.'
    },
    {
      id: 'mock_prg_3',
      moduleId: 'programming',
      submoduleId: 'arrays-ds',
      text: 'Which sorting algorithm has the best average-case performance with O(n log n) and is stable?',
      options: ['QuickSort', 'MergeSort', 'HeapSort', 'SelectionSort'],
      correct: 1,
      explanation: 'MergeSort is an O(n log n) divide-and-conquer sorting algorithm that is stable.'
    },
    {
      id: 'mock_prg_4',
      moduleId: 'programming',
      submoduleId: 'arrays-ds',
      text: 'What is the height of a balanced Binary Search Tree containing n elements?',
      options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'],
      correct: 1,
      explanation: 'A balanced BST maintains height logarithmic in the number of nodes, O(log n).'
    },

    // Computer Science
    {
      id: 'mock_cs_1',
      moduleId: 'computer-science',
      submoduleId: 'operating-systems',
      text: 'In operating systems, what is a "thrashing" condition?',
      options: ['CPU spending more time swapping pages than executing instructions', 'Disk read/write head physical collision', 'Malicious buffer overflow exploit', 'Deadlock among four background daemons'],
      correct: 0,
      explanation: 'Thrashing occurs when high paging activity causes the CPU to spend virtually all its time moving pages between RAM and disk.'
    },
    {
      id: 'mock_cs_2',
      moduleId: 'computer-science',
      submoduleId: 'dbms',
      text: 'Which normal form eliminates partial dependency on a composite primary key?',
      options: ['1NF', '2NF', '3NF', 'BCNF'],
      correct: 1,
      explanation: 'Second Normal Form (2NF) requires that no non-prime attribute is partially dependent on any candidate key.'
    },
    {
      id: 'mock_cs_3',
      moduleId: 'computer-science',
      submoduleId: 'networks',
      text: 'What is the maximum payload size of a standard Ethernet frame (MTU)?',
      options: ['512 bytes', '1024 bytes', '1500 bytes', '2048 bytes'],
      correct: 2,
      explanation: 'The standard Maximum Transmission Unit (MTU) for Ethernet is 1500 bytes.'
    },
    {
      id: 'mock_cs_4',
      moduleId: 'computer-science',
      submoduleId: 'operating-systems',
      text: 'Which scheduling algorithm is non-preemptive and selects the process with the shortest execution time?',
      options: ['Round Robin', 'Shortest Job First (SJF)', 'Shortest Remaining Time First (SRTF)', 'Priority Scheduling Preemptive'],
      correct: 1,
      explanation: 'SJF is non-preemptive; its preemptive variant is called SRTF.'
    },

    // Engineering
    {
      id: 'mock_eng_1',
      moduleId: 'engineering',
      submoduleId: 'electrical',
      text: 'What does Kirchhoffs Current Law (KCL) state regarding a node in an electric circuit?',
      options: ['Total voltage drop equals source voltage', 'Sum of currents entering a node equals sum of currents leaving', 'Power dissipated equals I squared R', 'Magnetic flux is proportional to coil turns'],
      correct: 1,
      explanation: 'KCL is based on charge conservation: algebraic sum of currents entering any node equals zero.'
    },
    {
      id: 'mock_eng_2',
      moduleId: 'engineering',
      submoduleId: 'mechanical',
      text: 'What does Hookes Law describe in material mechanics?',
      options: ['Stress is directly proportional to strain within the elastic limit', 'Viscosity is proportional to shear rate', 'Torque equals moment of inertia times acceleration', 'Turbulence transition at critical Reynolds number'],
      correct: 0,
      explanation: 'Hookes law states that within elastic deformation limits, stress σ is proportional to strain ε (σ = E * ε).'
    },
    {
      id: 'mock_eng_3',
      moduleId: 'engineering',
      submoduleId: 'eng-math',
      text: 'What is the value of the definite integral of e^(2x) dx from x = 0 to 1?',
      options: ['(e² - 1) / 2', 'e² - 1', '(e² + 1) / 2', '2 * (e² - 1)'],
      correct: 0,
      explanation: 'Integral is [ (1/2) * e^(2x) ] from 0 to 1 = (e² - e⁰) / 2 = (e² - 1) / 2.'
    },

    // Medical Sciences
    {
      id: 'mock_med_1',
      moduleId: 'medical',
      submoduleId: 'anatomy',
      text: 'Which cranial nerve is primarily responsible for sensory innervation to the face and motor control of chewing?',
      options: ['CN III (Oculomotor)', 'CN V (Trigeminal)', 'CN VII (Facial)', 'CN X (Vagus)'],
      correct: 1,
      explanation: 'The Trigeminal nerve (Cranial Nerve V) provides facial sensory input and innervates muscles of mastication.'
    },
    {
      id: 'mock_med_2',
      moduleId: 'medical',
      submoduleId: 'physiology',
      text: 'What is the normal resting glomerular filtration rate (GFR) in a healthy adult human kidney?',
      options: ['60 mL/min', '90-120 mL/min', '180-220 mL/min', '25 mL/min'],
      correct: 1,
      explanation: 'A normal healthy GFR is typically 90 to 120 mL/min per 1.73 m².'
    },
    {
      id: 'mock_med_3',
      moduleId: 'medical',
      submoduleId: 'medical-science',
      text: 'Which vitamin deficiency is classically associated with the development of scurvy?',
      options: ['Vitamin A', 'Vitamin B12', 'Vitamin C (Ascorbic acid)', 'Vitamin D'],
      correct: 2,
      explanation: 'Vitamin C is an essential cofactor for collagen synthesis; deficiency causes scurvy.'
    }
  ];

  // --------------------------------------------------------------------------
  // Mock Test State
  // --------------------------------------------------------------------------
  let activeTest = null;
  let timerInterval = null;
  let testHistory = [];

  // Helper: load test history from store / localStorage
  function loadTestHistory() {
    try {
      if (window.CortexStore && typeof window.CortexStore.getPlayer === 'function') {
        const p = window.CortexStore.getPlayer();
        if (p && Array.isArray(p.testHistory)) {
          testHistory = [...p.testHistory];
          return;
        }
      }
      const raw = localStorage.getItem('cq_mock_test_history');
      if (raw) {
        testHistory = JSON.parse(raw);
      }
    } catch (e) {
      console.warn('[CortexMockTest] Load history error:', e);
    }
  }

  function saveTestHistory(resultItem) {
    testHistory.unshift(resultItem);
    try {
      if (window.CortexStore && typeof window.CortexStore.updatePlayer === 'function') {
        window.CortexStore.updatePlayer({ testHistory: testHistory });
      }
      localStorage.setItem('cq_mock_test_history', JSON.stringify(testHistory));
    } catch (e) {
      console.warn('[CortexMockTest] Save history error:', e);
    }
  }

  // Load history at startup
  loadTestHistory();

  // --------------------------------------------------------------------------
  // CortexMockTest API
  // --------------------------------------------------------------------------
  const CortexMockTest = {
    /**
     * Generate a new 30-question mock test
     * @param {Object} options - { modules: [], difficulty: 'mixed', duration: 30 }
     */
    generateTest: function (options = {}) {
      const durationMinutes = options.duration || 30;
      const targetModules = options.modules && options.modules.length > 0
        ? options.modules
        : MODULES_CONFIG.map(m => m.id);

      // Gather pool of available questions
      let candidatePool = [...MOCK_QUESTION_BANK];

      // Pull from window.CortexModulesData if loaded
      try {
        if (window.CortexModulesData && typeof window.CortexModulesData.getAllQuestions === 'function') {
          const allExternal = window.CortexModulesData.getAllQuestions();
          if (Array.isArray(allExternal) && allExternal.length > 0) {
            candidatePool = candidatePool.concat(allExternal);
          }
        }
      } catch (e) {
        console.warn('[CortexMockTest] Error querying CortexModulesData:', e);
      }

      // Select questions balanced equally across target modules
      const questionsPerModule = Math.floor(30 / targetModules.length);
      const remainder = 30 % targetModules.length;
      const selectedQuestions = [];

      targetModules.forEach((modId, index) => {
        let modQuestions = candidatePool.filter(q => q.moduleId === modId);
        if (modQuestions.length === 0) {
          // fallback to any questions
          modQuestions = candidatePool;
        }

        // Shuffle module questions
        const shuffled = [...modQuestions].sort(() => 0.5 - Math.random());
        const countNeeded = questionsPerModule + (index < remainder ? 1 : 0);

        for (let i = 0; i < countNeeded; i++) {
          if (i < shuffled.length) {
            selectedQuestions.push({ ...shuffled[i], moduleId: modId });
          } else if (shuffled.length > 0) {
            selectedQuestions.push({ ...shuffled[i % shuffled.length], moduleId: modId });
          } else {
            // Synthesis safeguard
            selectedQuestions.push({
              id: `synth_mock_${modId}_${i}`,
              moduleId: modId,
              text: `Standard diagnostic question for ${modId.replace('-', ' ').toUpperCase()} section evaluation.`,
              options: ['Primary theoretical standard', 'Secondary variable', 'Non-conforming metric', 'Null hypothesis'],
              correct: 0,
              explanation: 'The primary theoretical standard satisfies normative examination criteria.'
            });
          }
        }
      });

      // Final shuffle of the 30 questions
      const final30 = selectedQuestions.slice(0, 30).sort(() => 0.5 - Math.random());

      const testId = `mock_exam_${Date.now()}`;
      activeTest = {
        id: testId,
        questions: final30,
        durationMinutes: durationMinutes,
        durationSeconds: durationMinutes * 60,
        startTime: null,
        endTime: null,
        currentIndex: 0,
        userAnswers: {},   // { [questionIndex]: optionIndex }
        flagged: {},       // { [questionIndex]: boolean }
        status: 'not_started', // 'not_started' | 'in_progress' | 'completed'
        results: null
      };

      return {
        id: testId,
        totalQuestions: final30.length,
        durationMinutes: durationMinutes,
        createdAt: Date.now()
      };
    },

    /**
     * Start the test and begin timer countdown
     * @param {string} testId (optional)
     */
    startTest: function (testId) {
      if (!activeTest || (testId && activeTest.id !== testId)) {
        this.generateTest();
      }

      activeTest.startTime = Date.now();
      activeTest.status = 'in_progress';
      activeTest.currentIndex = 0;
      activeTest.userAnswers = {};
      activeTest.flagged = {};

      if (timerInterval) {
        clearInterval(timerInterval);
      }

      timerInterval = setInterval(() => {
        if (!activeTest || activeTest.status !== 'in_progress') {
          clearInterval(timerInterval);
          return;
        }

        const remaining = this.getTimeRemaining();
        if (remaining <= 0) {
          clearInterval(timerInterval);
          this.finishTest();
        }
      }, 1000);

      return {
        success: true,
        testId: activeTest.id,
        currentQuestion: this.getCurrentQuestion()
      };
    },

    /**
     * Submit an answer for a question (No feedback revealed until final evaluation)
     * @param {number} questionIndex - 0-based question index
     * @param {number} optionIndex - Chosen option index (0-3)
     */
    submitAnswer: function (questionIndex, optionIndex) {
      if (!activeTest || activeTest.status !== 'in_progress') {
        return { error: 'No test in progress' };
      }

      const qIdx = questionIndex !== undefined ? questionIndex : activeTest.currentIndex;
      activeTest.userAnswers[qIdx] = optionIndex;

      return {
        success: true,
        questionIndex: qIdx,
        optionIndex: optionIndex
      };
    },

    /**
     * Toggle flag on question for later review
     */
    flagQuestion: function (index) {
      if (!activeTest) return false;
      const idx = index !== undefined ? index : activeTest.currentIndex;
      activeTest.flagged[idx] = !activeTest.flagged[idx];
      return activeTest.flagged[idx];
    },

    /**
     * Skip to next question without answering
     */
    skipQuestion: function (index) {
      if (!activeTest) return null;
      if (activeTest.currentIndex + 1 < activeTest.questions.length) {
        activeTest.currentIndex++;
      }
      return this.getCurrentQuestion();
    },

    /**
     * Go to a specific question by index
     */
    goToQuestion: function (index) {
      if (!activeTest) return null;
      if (index >= 0 && index < activeTest.questions.length) {
        activeTest.currentIndex = index;
      }
      return this.getCurrentQuestion();
    },

    /**
     * Get remaining time in seconds
     */
    getTimeRemaining: function () {
      if (!activeTest || !activeTest.startTime) return 0;
      const elapsed = Math.floor((Date.now() - activeTest.startTime) / 1000);
      return Math.max(0, activeTest.durationSeconds - elapsed);
    },

    /**
     * Get current question details
     */
    getCurrentQuestion: function () {
      if (!activeTest || !activeTest.questions || activeTest.questions.length === 0) {
        return null;
      }

      const idx = activeTest.currentIndex;
      const q = activeTest.questions[idx];

      return {
        index: idx,
        total: activeTest.questions.length,
        id: q.id,
        moduleId: q.moduleId || 'general-aptitude',
        text: q.text,
        options: [...q.options],
        selectedOption: activeTest.userAnswers[idx] !== undefined ? activeTest.userAnswers[idx] : null,
        isFlagged: Boolean(activeTest.flagged[idx]),
        timeRemaining: this.getTimeRemaining()
      };
    },

    /**
     * Get progress statistics
     */
    getProgress: function () {
      if (!activeTest) return { answered: 0, total: 0, flagged: 0, remaining: 0 };

      const total = activeTest.questions.length;
      let answered = 0;
      let flagged = 0;

      for (let i = 0; i < total; i++) {
        if (activeTest.userAnswers[i] !== undefined && activeTest.userAnswers[i] !== null) {
          answered++;
        }
        if (activeTest.flagged[i]) {
          flagged++;
        }
      }

      return {
        answered: answered,
        total: total,
        flagged: flagged,
        remaining: total - answered
      };
    },

    /**
     * Finish and evaluate the test
     */
    finishTest: function () {
      if (!activeTest) return null;

      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }

      activeTest.status = 'completed';
      activeTest.endTime = Date.now();

      const questions = activeTest.questions;
      const total = questions.length;
      let correctCount = 0;
      let wrongCount = 0;
      let unansweredCount = 0;

      // Module breakdown tracking
      const moduleStats = {};
      MODULES_CONFIG.forEach(m => {
        moduleStats[m.id] = { name: m.name, total: 0, correct: 0, percentage: 0 };
      });

      const questionResults = [];

      for (let i = 0; i < total; i++) {
        const q = questions[i];
        const userChoice = activeTest.userAnswers[i];
        const isAnswered = userChoice !== undefined && userChoice !== null;
        const isCorrect = isAnswered && userChoice === q.correct;

        const modId = q.moduleId || 'general-aptitude';
        if (!moduleStats[modId]) {
          moduleStats[modId] = { name: modId, total: 0, correct: 0, percentage: 0 };
        }
        moduleStats[modId].total++;

        if (isCorrect) {
          correctCount++;
          moduleStats[modId].correct++;
        } else if (isAnswered) {
          wrongCount++;
        } else {
          unansweredCount++;
        }

        questionResults.push({
          index: i + 1,
          id: q.id,
          moduleId: modId,
          text: q.text,
          options: q.options,
          userChoice: isAnswered ? userChoice : null,
          correctChoice: q.correct,
          isCorrect: isCorrect,
          explanation: q.explanation || 'Refer to subject syllabus for detailed theory.'
        });
      }

      // Calculate percentage per module
      Object.keys(moduleStats).forEach(mKey => {
        const item = moduleStats[mKey];
        item.percentage = item.total > 0 ? Math.round((item.correct / item.total) * 100) : 0;
      });

      const scorePercentage = total > 0 ? Math.round((correctCount / total) * 100) : 0;
      const timeTaken = Math.round((activeTest.endTime - (activeTest.startTime || activeTest.endTime)) / 1000);

      // Rewards: 1 XP per correct, 2 Coins per correct
      const xpEarned = correctCount * 1;
      const coinsEarned = correctCount * 2;

      try {
        if (window.CortexPlayer) {
          if (typeof window.CortexPlayer.addXP === 'function') window.CortexPlayer.addXP(xpEarned);
          if (typeof window.CortexPlayer.addCoins === 'function') window.CortexPlayer.addCoins(coinsEarned);
        }
      } catch (e) {
        console.warn('[CortexMockTest] Reward error:', e);
      }

      // Audio feedback
      try {
        if (window.CortexAudio) {
          if (typeof window.CortexAudio.playVoice === 'function') {
            window.CortexAudio.playVoice(scorePercentage >= 60 ? 'level-complete' : 'keep-going');
          }
          if (typeof window.CortexAudio.playBGM === 'function') {
            window.CortexAudio.playBGM('victory');
          }
        }
      } catch (e) {
        console.warn('[CortexMockTest] Audio error:', e);
      }

      // Compile final results object
      const finalResult = {
        testId: activeTest.id,
        date: new Date().toISOString(),
        totalQuestions: total,
        answeredCount: total - unansweredCount,
        unansweredCount: unansweredCount,
        correctCount: correctCount,
        wrongCount: wrongCount,
        scorePercentage: scorePercentage,
        timeTakenSeconds: timeTaken,
        xpEarned: xpEarned,
        coinsEarned: coinsEarned,
        moduleBreakdown: moduleStats,
        details: questionResults
      };

      activeTest.results = finalResult;

      // Save to history
      saveTestHistory({
        id: finalResult.testId,
        date: finalResult.date,
        scorePercentage: scorePercentage,
        correct: correctCount,
        total: total,
        timeTakenSeconds: timeTaken,
        xpEarned: xpEarned,
        coinsEarned: coinsEarned
      });

      // Gamification trigger
      try {
        if (window.CortexGamification && typeof window.CortexGamification.checkAchievements === 'function') {
          window.CortexGamification.checkAchievements();
        }
      } catch (e) {
        console.warn('[CortexMockTest] Gamification trigger error:', e);
      }

      return finalResult;
    },

    /**
     * Get stored results of last completed test
     */
    getResults: function () {
      return activeTest ? activeTest.results : null;
    },

    /**
     * Get history of all completed tests
     */
    getTestHistory: function () {
      return [...testHistory];
    }
  };

  // Expose globally
  window.CortexMockTest = CortexMockTest;

})(window);
