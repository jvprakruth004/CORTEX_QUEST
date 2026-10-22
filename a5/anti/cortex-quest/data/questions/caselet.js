/**
 * Cortex Quest - Caselet Data Interpretation Questions
 * Submodule: caselet | Module: data-interpretation
 * 20 questions (6 Easy, 8 Medium, 6 Hard)
 */

(function () {
  'use strict';

  window.QuestionsCaselet = [
    // --- EASY (1 to 6) ---
    {
      id: 'caselet_01',
      text: 'In an artisanal bakery, 500 items were baked on Sunday morning. 40% of the total production was sourdough bread loaves, 35% were croissants, and the remainder were blueberry muffins. How many blueberry muffins were baked?',
      options: ['110 muffins', '125 muffins', '135 muffins', '150 muffins'],
      correct: 1,
      explanation: 'Percentage of muffins = 100% - (40% + 35%) = 25%. Number of muffins = 0.25 * 500 = 125.',
      difficulty: 'easy',
      hint: 'Muffins make up the remaining 25% of 500 items.'
    },
    {
      id: 'caselet_02',
      text: 'In an academy of 600 students, 300 play soccer, 200 play basketball, and 80 play both sports. How many students play at least one of these two sports?',
      options: ['420 students', '440 students', '460 students', '500 students'],
      correct: 0,
      explanation: 'Using the principle of inclusion-exclusion: |A ∪ B| = |A| + |B| - |A ∩ B| = 300 + 200 - 80 = 420 students.',
      difficulty: 'easy',
      hint: 'Add soccer and basketball players, then subtract those who play both.'
    },
    {
      id: 'caselet_03',
      text: 'A bookshop sold 800 titles during a holiday fair. Fiction comprised 3/8 of the sales, Non-fiction comprised 1/2 of the sales, and Poetry books made up the entire remainder. How many Poetry books were sold?',
      options: ['80 books', '100 books', '120 books', '140 books'],
      correct: 1,
      explanation: 'Fiction = (3/8)*800 = 300. Non-fiction = (1/2)*800 = 400. Total = 700. Poetry books = 800 - 700 = 100 books.',
      difficulty: 'easy',
      hint: 'Calculate Fiction (300) and Non-fiction (400) and subtract from 800.'
    },
    {
      id: 'caselet_04',
      text: 'A transit survey of 250 downtown commuters revealed that 150 commute by train, 70 commute by bus, and 30 commute by bicycle. What percentage of the surveyed commuters travel by train?',
      options: ['50%', '55%', '60%', '65%'],
      correct: 2,
      explanation: 'Train share = (150 / 250) * 100 = 60%.',
      difficulty: 'easy',
      hint: 'Divide 150 by 250 and multiply by 100.'
    },
    {
      id: 'caselet_05',
      text: 'An AI developer summit convened 80 participants consisting exclusively of software developers and data analysts in the ratio of 5:3. How many software developers attended?',
      options: ['40 developers', '45 developers', '50 developers', '55 developers'],
      correct: 2,
      explanation: 'Total parts = 5 + 3 = 8. Developers = (5/8) * 80 = 50.',
      difficulty: 'easy',
      hint: 'Multiply 80 by 5/8.'
    },
    {
      id: 'caselet_06',
      text: 'A luxury lodge operates 50 guest rooms. On Friday evening, 42 rooms were occupied by guests while the rest remained empty. What was the vacancy rate?',
      options: ['12%', '14%', '16%', '18%'],
      correct: 2,
      explanation: 'Vacant rooms = 50 - 42 = 8. Vacancy rate = (8 / 50) * 100 = 16%.',
      difficulty: 'easy',
      hint: 'Divide 8 vacant rooms by 50 total rooms.'
    },

    // --- MEDIUM (7 to 14) ---
    {
      id: 'caselet_07',
      text: 'Among 120 faculty professors at a polytechnic institute, 65 speak fluent French, 55 speak fluent German, and 20 speak both languages fluently. How many professors speak neither French nor German?',
      options: ['15 professors', '20 professors', '25 professors', '30 professors'],
      correct: 1,
      explanation: 'Professors speaking at least one language = 65 + 55 - 20 = 100. Those speaking neither = 120 - 100 = 20 professors.',
      difficulty: 'medium',
      hint: 'Compute the union of French and German speakers, then subtract from 120.'
    },
    {
      id: 'caselet_08',
      text: 'A high-end garment warehouse stocked 400 shirts. 60% of all shirts are crafted from cotton, while the rest are pure linen. Among the cotton shirts, 25% are dyed blue. How many cotton shirts in the warehouse are NOT blue?',
      options: ['150 shirts', '160 shirts', '180 shirts', '200 shirts'],
      correct: 2,
      explanation: 'Total cotton shirts = 60% of 400 = 240. Non-blue cotton shirts = 75% of 240 = 0.75 * 240 = 180 shirts.',
      difficulty: 'medium',
      hint: 'Find the total cotton shirts (240), then calculate 75% of that number.'
    },
    {
      id: 'caselet_09',
      text: 'A health center admitted 150 patients over the weekend: 40% were pediatric, 30% were adult general, and the remainder were geriatric. If 40% of the geriatric patients were female, how many geriatric female patients were admitted?',
      options: ['15 patients', '18 patients', '21 patients', '24 patients'],
      correct: 1,
      explanation: 'Geriatric percentage = 100% - (40% + 30%) = 30%. Geriatric patients = 30% of 150 = 45. Female geriatric patients = 40% of 45 = 18.',
      difficulty: 'medium',
      hint: 'Calculate 30% of 150 to get 45 geriatric patients, then take 40% of 45.'
    },
    {
      id: 'caselet_10',
      text: 'In a college student body of 500, 280 belong to the Drama society, 210 belong to the Music society, and 90 participate in both societies. How many students belong EXCLUSIVELY to the Drama society?',
      options: ['170 students', '180 students', '190 students', '210 students'],
      correct: 2,
      explanation: 'Exclusively Drama = Total Drama members - Joint members = 280 - 90 = 190 students.',
      difficulty: 'medium',
      hint: 'Subtract the joint members (90) from the total Drama members (280).'
    },
    {
      id: 'caselet_11',
      text: 'An industrial facility employs 240 technicians across day and night shifts. The day shift employs 50% more technicians than the night shift. How many technicians work during the day shift?',
      options: ['120 technicians', '135 technicians', '144 technicians', '150 technicians'],
      correct: 2,
      explanation: 'Let night shift = N. Day shift = 1.5N. Total = 2.5N = 240 => N = 96. Day shift = 1.5 * 96 = 144 technicians.',
      difficulty: 'medium',
      hint: 'Set Day = 1.5 * Night and solve Day + Night = 240.'
    },
    {
      id: 'caselet_12',
      text: 'A streaming network boasts 10,000 active accounts. 70% use the complimentary free tier, while the remaining 30% hold paid premium memberships split between Silver and Gold tiers in the ratio 3:2. How many subscribers hold Gold memberships?',
      options: ['1,000', '1,200', '1,500', '1,800'],
      correct: 1,
      explanation: 'Paid subscribers = 30% of 10,000 = 3,000. Gold share = 2 / (3 + 2) = 2/5. Gold subscribers = (2/5) * 3,000 = 1,200.',
      difficulty: 'medium',
      hint: 'Calculate 3,000 paid subscribers and multiply by 2/5.'
    },
    {
      id: 'caselet_13',
      text: 'A cleanroom plant fabricates 1,000 semiconductor chips per day using two automated lines: Line 1 builds 600 chips with a 2% defect rate; Line 2 builds 400 chips with a 5% defect rate. How many defective chips are produced daily in total?',
      options: ['28 chips', '30 chips', '32 chips', '36 chips'],
      correct: 2,
      explanation: 'Defects Line 1 = 0.02 * 600 = 12 chips. Defects Line 2 = 0.05 * 400 = 20 chips. Total daily defects = 12 + 20 = 32 chips.',
      difficulty: 'medium',
      hint: 'Multiply each line’s volume by its respective defect percentage and sum.'
    },
    {
      id: 'caselet_14',
      text: 'An automobile dealership sold 160 vehicles last quarter consisting of SUVs, Sedans, and Trucks in the ratio 5:2:1. If SUVs sell for an average price of $35,000, what was the total dollar revenue generated from SUV sales alone?',
      options: ['$2,800,000', '$3,150,000', '$3,500,000', '$4,000,000'],
      correct: 2,
      explanation: 'Total parts = 5 + 2 + 1 = 8. SUVs sold = (5/8) * 160 = 100 units. SUV revenue = 100 * $35,000 = $3,500,000 ($3.5M).',
      difficulty: 'medium',
      hint: 'Find the number of SUVs (5/8 of 160 = 100) and multiply by $35,000.'
    },

    // --- HARD (15 to 20) ---
    {
      id: 'caselet_15',
      text: 'In an engineering cohort of 200 students, 100 study Python, 90 study C++, and 70 study Java. Furthermore, 40 study Python and C++, 30 study C++ and Java, and 35 study Python and Java, while 15 students study all three languages. How many students study AT LEAST ONE of these languages?',
      options: ['160 students', '170 students', '175 students', '180 students'],
      correct: 1,
      explanation: 'By 3-set inclusion-exclusion: |P ∪ C ∪ J| = 100 + 90 + 70 - (40 + 30 + 35) + 15 = 260 - 105 + 15 = 170 students.',
      difficulty: 'hard',
      hint: 'Use |A∪B∪C| = Σ|A| - Σ|A∩B| + |A∩B∩C|.'
    },
    {
      id: 'caselet_16',
      text: 'Referring to the cohort of 200 students above (100 Python, 90 C++, 70 Java; pairwise: P&C=40, C&J=30, P&J=35; all three=15), how many students study EXACTLY TWO languages?',
      options: ['50 students', '55 students', '60 students', '65 students'],
      correct: 2,
      explanation: 'Exactly two = (P∩C - All 3) + (C∩J - All 3) + (P∩J - All 3) = (40 - 15) + (30 - 15) + (35 - 15) = 25 + 15 + 20 = 60 students.',
      difficulty: 'hard',
      hint: 'Subtract the 15 3-language students from each of the two-language intersections.'
    },
    {
      id: 'caselet_17',
      text: 'A strategy consulting firm operates three practices: Financial (100 consultants, 140 billable hrs/mo, $200/hr), Healthcare (80 consultants, 150 billable hrs/mo, $180/hr), and Technology (120 consultants, 160 billable hrs/mo, $250/hr). Which practice generates the highest monthly revenue?',
      options: ['Financial practice ($2.8M)', 'Healthcare practice ($2.16M)', 'Technology practice ($4.8M)', 'Financial and Technology are equal'],
      correct: 2,
      explanation: 'Revenues: Financial = 100 * 140 * $200 = $2,800,000; Healthcare = 80 * 150 * $180 = $2,160,000; Technology = 120 * 160 * $250 = $4,800,000. Technology is the highest.',
      difficulty: 'hard',
      hint: 'Compute monthly revenue = consultants * hours * hourly rate for each practice.'
    },
    {
      id: 'caselet_18',
      text: 'In a market research study of 400 consumers where every respondent drinks at least one of three coffee brands (A, B, C): 180 drink A, 190 drink B, and 170 drink C. In pairs, 60 drink A&B, 50 drink B&C, and 40 drink A&C. How many respondents consume ALL THREE coffee brands?',
      options: ['8 respondents', '10 respondents', '12 respondents', '15 respondents'],
      correct: 1,
      explanation: 'Total = 400 = (180 + 190 + 170) - (60 + 50 + 40) + x => 400 = 540 - 150 + x => 400 = 390 + x => x = 10 respondents.',
      difficulty: 'hard',
      hint: 'Substitute into the 3-set union formula: 400 = 540 - 150 + x.'
    },
    {
      id: 'caselet_19',
      text: 'An agricultural holding of 120 acres is apportioned to Wheat, Corn, and Soybeans in the ratio 3:2:1. Wheat yields 50 bu/acre and sells at $6/bu; Corn yields 140 bu/acre and sells at $4/bu; Soybeans yield 45 bu/acre and sell at $12/bu. What is the gross revenue generated across all three crops?',
      options: ['$48,600', '$50,400', '$51,200', '$54,000'],
      correct: 2,
      explanation: 'Acreages: Wheat = 60, Corn = 40, Soybeans = 20. Wheat = 60 * 50 * 6 = $18,000; Corn = 40 * 140 * 4 = $22,400; Soybeans = 20 * 45 * 12 = $10,800. Total = 18,000 + 22,400 + 10,800 = $51,200.',
      difficulty: 'hard',
      hint: 'Determine the acreage for each crop (60, 40, 20) and calculate revenue per crop.'
    },
    {
      id: 'caselet_20',
      text: 'In a competitive civil service examination taken by 10,000 candidates: 60% are male and 40% are female. Overall, 25% of all candidates qualified. If exactly 20% of the male candidates qualified, what was the qualification rate among the female candidates?',
      options: ['28.5%', '30.0%', '32.5%', '35.0%'],
      correct: 2,
      explanation: 'Total qualified = 25% of 10,000 = 2,500. Males = 6,000; Male qualified = 20% of 6,000 = 1,200. Females = 4,000; Female qualified = 2,500 - 1,200 = 1,300. Female pass rate = (1,300 / 4,000) * 100 = 32.5%.',
      difficulty: 'hard',
      hint: 'Total qualifiers = 2,500; subtract male qualifiers (1,200) to find female qualifiers (1,300).'
    }
  ];
})();
