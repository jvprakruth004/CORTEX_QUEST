// data/questions/arithmetic.js
// window.QuestionsArithmetic — 20 accurate arithmetic questions

window.QuestionsArithmetic = [
  {
    id: 'arith-001',
    text: 'What is 15% of 240?',
    options: ['32', '36', '38', '40'],
    correct: 1,
    explanation: '15% of 240 = (15/100) × 240 = 0.15 × 240 = 36.',
    difficulty: 'easy',
    hint: 'Multiply 240 by 0.15, or find 10% then add 5%.'
  },
  {
    id: 'arith-002',
    text: 'Simplify: 3/4 + 5/6.',
    options: ['8/10', '19/12', '11/12', '2/3'],
    correct: 1,
    explanation: 'LCM of 4 and 6 is 12. 3/4 = 9/12, 5/6 = 10/12. Sum = 19/12.',
    difficulty: 'easy',
    hint: 'Find the LCM of the denominators (4 and 6) to add the fractions.'
  },
  {
    id: 'arith-003',
    text: 'What is the ratio of 48 to 36 in simplest form?',
    options: ['4:3', '8:6', '12:9', '16:12'],
    correct: 0,
    explanation: 'HCF of 48 and 36 is 12. 48÷12 = 4, 36÷12 = 3. So ratio = 4:3.',
    difficulty: 'easy',
    hint: 'Divide both numbers by their HCF to simplify.'
  },
  {
    id: 'arith-004',
    text: 'Evaluate using BODMAS: 12 + 8 × 3 − 6 ÷ 2.',
    options: ['30', '33', '27', '51'],
    correct: 1,
    explanation: 'BODMAS: Division first: 6÷2=3. Multiplication: 8×3=24. Then: 12+24−3 = 33.',
    difficulty: 'easy',
    hint: 'Apply order: Division and Multiplication before Addition and Subtraction.'
  },
  {
    id: 'arith-005',
    text: 'What is the LCM of 12, 18, and 24?',
    options: ['36', '48', '72', '96'],
    correct: 2,
    explanation: '12 = 2²×3, 18 = 2×3², 24 = 2³×3. LCM = 2³×3² = 8×9 = 72.',
    difficulty: 'easy',
    hint: 'Find the highest power of each prime factor among all numbers.'
  },
  {
    id: 'arith-006',
    text: 'What is the HCF of 84 and 126?',
    options: ['21', '28', '42', '63'],
    correct: 2,
    explanation: '84 = 2²×3×7 and 126 = 2×3²×7. HCF = 2×3×7 = 42.',
    difficulty: 'easy',
    hint: 'Find common prime factors and take the lowest powers.'
  },
  {
    id: 'arith-007',
    text: 'Convert 0.625 to a fraction in simplest form.',
    options: ['5/8', '6/10', '62/100', '5/9'],
    correct: 0,
    explanation: '0.625 = 625/1000. HCF(625,1000)=125. So 625/1000 = 5/8.',
    difficulty: 'easy',
    hint: 'Write as 625/1000 and then simplify by dividing by the HCF.'
  },
  {
    id: 'arith-008',
    text: 'A number is increased by 20% and then decreased by 20%. What is the net change?',
    options: ['No change', '4% decrease', '4% increase', '2% decrease'],
    correct: 1,
    explanation: 'Let the number be 100. After 20% increase: 120. After 20% decrease: 120×0.8=96. Net change = −4, i.e., 4% decrease.',
    difficulty: 'medium',
    hint: 'Apply both percentage changes sequentially to 100 and compare with the original.'
  },
  {
    id: 'arith-009',
    text: 'What is 2/5 of 3/7 of 350?',
    options: ['50', '60', '70', '80'],
    correct: 1,
    explanation: '3/7 of 350 = 150. 2/5 of 150 = 60.',
    difficulty: 'medium',
    hint: 'First calculate 3/7 of 350, then take 2/5 of that result.'
  },
  {
    id: 'arith-010',
    text: 'If 40% of a number is 160, what is 75% of that number?',
    options: ['280', '300', '320', '350'],
    correct: 1,
    explanation: '40% of x = 160, so x = 400. 75% of 400 = 300.',
    difficulty: 'easy',
    hint: 'First find the full number, then calculate 75% of it.'
  },
  {
    id: 'arith-011',
    text: 'Evaluate: 48 ÷ (4 × 3) + 6 − 2².',
    options: ['4', '6', '8', '10'],
    correct: 1,
    explanation: 'Step by step: 2² = 4. 4×3 = 12. 48÷12 = 4. 4 + 6 − 4 = 6.',
    difficulty: 'medium',
    hint: 'Resolve brackets and exponents first, then divisions, then additions/subtractions.'
  },
  {
    id: 'arith-012',
    text: 'What fraction of 1 hour is 20 minutes?',
    options: ['1/4', '1/3', '2/5', '1/2'],
    correct: 1,
    explanation: '20 minutes out of 60 minutes = 20/60 = 1/3.',
    difficulty: 'easy',
    hint: 'Convert 1 hour to minutes (60) and form the fraction.'
  },
  {
    id: 'arith-013',
    text: 'In a class of 60 students, 40% are girls. How many boys are there?',
    options: ['24', '30', '36', '40'],
    correct: 2,
    explanation: 'Girls = 40% of 60 = 24. Boys = 60 − 24 = 36.',
    difficulty: 'easy',
    hint: 'Find the number of girls first, then subtract from total.'
  },
  {
    id: 'arith-014',
    text: 'Which of the following is the largest? 5/8, 3/5, 7/12, 11/20',
    options: ['5/8', '3/5', '7/12', '11/20'],
    correct: 0,
    explanation: 'Converting to decimals: 5/8=0.625, 3/5=0.6, 7/12≈0.583, 11/20=0.55. Largest is 5/8.',
    difficulty: 'medium',
    hint: 'Convert all fractions to decimals for easy comparison.'
  },
  {
    id: 'arith-015',
    text: 'If the ratio of boys to girls is 3:5 and there are 40 girls, how many boys are there?',
    options: ['20', '24', '28', '32'],
    correct: 1,
    explanation: 'If 5 parts = 40, then 1 part = 8. Boys = 3 parts = 3×8 = 24.',
    difficulty: 'easy',
    hint: 'Use the ratio to find the value of one part, then scale up.'
  },
  {
    id: 'arith-016',
    text: 'What is 125% of 80?',
    options: ['90', '95', '100', '105'],
    correct: 2,
    explanation: '125% of 80 = 1.25 × 80 = 100.',
    difficulty: 'easy',
    hint: '125% means 1.25 times the number.'
  },
  {
    id: 'arith-017',
    text: 'What is the value of (0.3)² + (0.4)²?',
    options: ['0.25', '0.49', '0.5', '0.52'],
    correct: 0,
    explanation: '(0.3)² = 0.09. (0.4)² = 0.16. Sum = 0.09 + 0.16 = 0.25.',
    difficulty: 'medium',
    hint: 'Square each decimal separately then add the results.'
  },
  {
    id: 'arith-018',
    text: 'A shopkeeper sells 3 items for the cost price of 4 items. What is his profit percentage?',
    options: ['25%', '33.33%', '30%', '20%'],
    correct: 1,
    explanation: 'CP of 3 items = SP of 3 items at cost of 4 items. Let CP of 1 item = ₹1. SP of 3 = ₹4. Profit = (4−3)/3 × 100 = 33.33%.',
    difficulty: 'hard',
    hint: 'Assume CP of each item = 1, then calculate SP and profit%.'
  },
  {
    id: 'arith-019',
    text: 'The product of two numbers is 1575 and their ratio is 7:9. What is the smaller number?',
    options: ['35', '42', '45', '63'],
    correct: 0,
    explanation: 'Let numbers be 7x and 9x. 7x × 9x = 1575 → 63x² = 1575 → x² = 25 → x = 5. Smaller = 7×5 = 35.',
    difficulty: 'hard',
    hint: 'Express the numbers as 7x and 9x, then solve for x using their product.'
  },
  {
    id: 'arith-020',
    text: 'What is the sum of all prime numbers between 30 and 50?',
    options: ['184', '199', '202', '211'],
    correct: 1,
    explanation: 'Prime numbers between 30 and 50: 31, 37, 41, 43, 47. Sum = 31+37+41+43+47 = 199.',
    difficulty: 'medium',
    hint: 'List all primes between 30 and 50 — recall a prime is only divisible by 1 and itself.'
  }
];
