/**
 * Cortex Quest - Graph Analysis Questions
 * Submodule: graph-analysis | Module: data-interpretation
 * 20 questions (6 Easy, 8 Medium, 6 Hard)
 */

(function () {
  'use strict';

  window.QuestionsGraphAnalysis = [
    // --- EASY (1 to 6) ---
    {
      id: 'graph_01',
      text: 'A pie chart shows monthly household expenditure: Housing: 35%, Food: 25%, Healthcare: 15%, Savings: 15%, Entertainment: 10%. If total monthly income is $4,000, how much is allocated to Housing?',
      options: ['$1,200', '$1,350', '$1,400', '$1,500'],
      correct: 2,
      explanation: 'Housing expenditure = 35% of $4,000 = 0.35 * 4,000 = $1,400.',
      difficulty: 'easy',
      hint: 'Multiply 4,000 by 0.35.'
    },
    {
      id: 'graph_02',
      text: 'A bar graph depicts smartphone sales (thousands of units): Q1: 50, Q2: 70, Q3: 65, Q4: 95. What is the absolute increase in sales from Q1 to Q4?',
      options: ['35 thousand', '40 thousand', '45 thousand', '50 thousand'],
      correct: 2,
      explanation: 'Absolute increase = Q4 - Q1 = 95 - 50 = 45 thousand units.',
      difficulty: 'easy',
      hint: 'Subtract Q1 sales from Q4 sales.'
    },
    {
      id: 'graph_03',
      text: 'A circular pie chart represents municipal election results: Candidate A: 45%, Candidate B: 30%, Candidate C: 25%. What is the central angle (in degrees) for Candidate B?',
      options: ['90°', '108°', '120°', '126°'],
      correct: 1,
      explanation: 'Central angle = (Percentage / 100) * 360° = (30 / 100) * 360° = 108°.',
      difficulty: 'easy',
      hint: 'Multiply 360 degrees by 0.30.'
    },
    {
      id: 'graph_04',
      text: 'A line graph tracks an equity price over a week: Mon: $100, Tue: $105, Wed: $110, Thu: $108, Fri: $120. On which day did the stock price decline relative to the prior day?',
      options: ['Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      correct: 2,
      explanation: 'The stock dipped from $110 on Wednesday to $108 on Thursday, which is a decline.',
      difficulty: 'easy',
      hint: 'Look for the day where the price dropped from the previous day.'
    },
    {
      id: 'graph_05',
      text: 'A column chart displays library books read by 4 students: Emma: 12, Liam: 18, Noah: 15, Olivia: 25. What simplified fraction of all 70 books was read by Liam?',
      options: ['9/35', '3/14', '1/4', '2/7'],
      correct: 0,
      explanation: 'Total books = 12 + 18 + 15 + 25 = 70. Liam’s share = 18 / 70 = 9 / 35.',
      difficulty: 'easy',
      hint: 'Divide 18 by 70 and reduce by factor of 2.'
    },
    {
      id: 'graph_06',
      text: 'A degree-based pie chart depicts university majors: Arts: 90°, Engineering: 120°, Science: 90°, Business: 60°. What percentage of all enrolled students are in Business?',
      options: ['12.5%', '15.0%', '16.67%', '20.0%'],
      correct: 2,
      explanation: 'Business share = (60° / 360°) * 100 = (1/6) * 100 ≈ 16.67%.',
      difficulty: 'easy',
      hint: 'Divide 60 by 360 and multiply by 100.'
    },

    // --- MEDIUM (7 to 14) ---
    {
      id: 'graph_07',
      text: 'A clustered bar chart compares male and female students across 3 programs:\nProgram A: 40 Male, 60 Female\nProgram B: 70 Male, 30 Female\nProgram C: 50 Male, 50 Female.\nWhat percentage of all male students are enrolled in Program B?',
      options: ['37.50%', '41.25%', '43.75%', '46.50%'],
      correct: 2,
      explanation: 'Total male students = 40 + 70 + 50 = 160. Program B male students = 70. Percentage = (70 / 160) * 100 = 43.75%.',
      difficulty: 'medium',
      hint: 'Add the male student counts across all three programs and divide 70 by that sum.'
    },
    {
      id: 'graph_08',
      text: 'A line graph tracks monthly inflation over 5 consecutive monthly intervals (Jan to Jun): Jan: 2.0%, Feb: 2.4%, Mar: 3.0%, Apr: 3.6%, May: 4.2%, Jun: 4.8%. What is the average monthly rate of change in inflation over this period?',
      options: ['0.48% per month', '0.52% per month', '0.56% per month', '0.60% per month'],
      correct: 2,
      explanation: 'Net change = 4.8% - 2.0% = 2.8%. Number of monthly intervals = 5. Average rate of change = 2.8% / 5 = 0.56% per month.',
      difficulty: 'medium',
      hint: 'Divide the net increase (4.8 - 2.0) by the 5 intervals between Jan and Jun.'
    },
    {
      id: 'graph_09',
      text: 'A pie chart shows smartphone market shares: Brand A: 40%, Brand B: 25%, Brand C: 20%, Others: 15%. If Brand A sold 200,000 units, how many units did Brand C sell?',
      options: ['80,000 units', '100,000 units', '120,000 units', '125,000 units'],
      correct: 1,
      explanation: 'Total market volume = 200,000 / 0.40 = 500,000 units. Brand C volume = 20% of 500,000 = 100,000 units.',
      difficulty: 'medium',
      hint: 'Since Brand C has half the market share of Brand A (20% vs 40%), it sold half as many units.'
    },
    {
      id: 'graph_10',
      text: 'A stacked bar chart shows computer unit sales (thousands):\n2020: Laptops 30k, Desktops 50k (Total 80k)\n2021: Laptops 45k, Desktops 45k (Total 90k)\n2022: Laptops 70k, Desktops 30k (Total 100k).\nBy how many percentage points did the Laptop share of total sales increase from 2020 to 2022?',
      options: ['25.0 percentage points', '30.0 percentage points', '32.5 percentage points', '35.0 percentage points'],
      correct: 2,
      explanation: '2020 Laptop share = 30 / 80 = 37.5%. 2022 Laptop share = 70 / 100 = 70.0%. Difference = 70.0% - 37.5% = 32.5 percentage points.',
      difficulty: 'medium',
      hint: 'Compute Laptop share in 2020 (30/80) and in 2022 (70/100), then subtract.'
    },
    {
      id: 'graph_11',
      text: 'A speed-time graph shows an electric vehicle accelerating uniformly from 0 to 30 m/s in 10 seconds, cruising at 30 m/s for 20 seconds, and decelerating uniformly to 0 m/s in 10 seconds. What is the total distance traveled (area under curve)?',
      options: ['750 meters', '800 meters', '900 meters', '1,050 meters'],
      correct: 2,
      explanation: 'The profile forms a trapezoid: base1 = 40 s (total time), base2 = 20 s (cruising time), height = 30 m/s. Area = 0.5 * (40 + 20) * 30 = 0.5 * 60 * 30 = 900 meters.',
      difficulty: 'medium',
      hint: 'Use the trapezoid area formula: 0.5 * (top parallel + bottom parallel) * height.'
    },
    {
      id: 'graph_12',
      text: 'An airport pie chart divides flight traffic into Domestic (216°) and International (144°). If International flights handled 1.2 million passengers, what was the total passenger volume across all flights?',
      options: ['2.4 million', '2.8 million', '3.0 million', '3.6 million'],
      correct: 2,
      explanation: 'International fraction = 144° / 360° = 2/5 = 40%. Total traffic = 1.2 million / 0.40 = 3.0 million passengers.',
      difficulty: 'medium',
      hint: '144 / 360 simplifies to 2/5 or 40%.'
    },
    {
      id: 'graph_13',
      text: 'A dual line chart plots Revenue and Expenses ($M) over 3 years:\nYear 1: Revenue 100, Expenses 80\nYear 2: Revenue 140, Expenses 100\nYear 3: Revenue 180, Expenses 120.\nWhat is the percentage growth in annual net profit from Year 1 to Year 3?',
      options: ['100%', '150%', '200%', '250%'],
      correct: 2,
      explanation: 'Profit = Revenue - Expenses. Year 1 Profit = 100 - 80 = 20M. Year 3 Profit = 180 - 120 = 60M. Percentage growth = [(60 - 20) / 20] * 100 = 200%.',
      difficulty: 'medium',
      hint: 'Find Year 1 profit (20) and Year 3 profit (60), then compute growth percentage.'
    },
    {
      id: 'graph_14',
      text: 'A histogram shows test score frequencies of 20 students: Score 60: 4 students, Score 70: 6 students, Score 80: 8 students, Score 90: 2 students. What is the median score?',
      options: ['70', '72.5', '75', '80'],
      correct: 2,
      explanation: 'With 20 ordered scores, the median is the average of the 10th and 11th values. Scores 1-4 are 60; scores 5-10 are 70; scores 11-18 are 80. The 10th score is 70 and 11th score is 80. Median = (70 + 80) / 2 = 75.',
      difficulty: 'medium',
      hint: 'Find the average of the 10th and 11th observations in cumulative order.'
    },

    // --- HARD (15 to 20) ---
    {
      id: 'graph_15',
      text: 'A comparative line graph shows annual revenues ($M) for Company P and Company Q:\nYear 1: P=40, Q=50\nYear 2: P=60, Q=55\nYear 3: P=80, Q=75\nYear 4: P=110, Q=90.\nIn which year was Company P’s percentage lead over Company Q the greatest?',
      options: ['Year 1', 'Year 2', 'Year 3', 'Year 4'],
      correct: 3,
      explanation: 'Percentage lead = [(P - Q) / Q] * 100. Year 1: P is lower; Year 2: (5/55)*100 ≈ 9.09%; Year 3: (5/75)*100 ≈ 6.67%; Year 4: (20/90)*100 ≈ 22.22%. Year 4 had the highest lead.',
      difficulty: 'hard',
      hint: 'Evaluate (P - Q) / Q for each year where P is greater than Q.'
    },
    {
      id: 'graph_16',
      text: 'Two concentric pie charts show corporate revenues: 2020 revenue was $10M with Software comprising 30%. 2023 revenue expanded to $25M with Software comprising 24%. What was the absolute dollar growth in Software revenue?',
      options: ['$2.5 million', '$3.0 million', '$3.5 million', '$4.0 million'],
      correct: 1,
      explanation: '2020 Software revenue = 30% of $10M = $3.0M. 2023 Software revenue = 24% of $25M = $6.0M. Growth = $6.0M - $3.0M = $3.0 million.',
      difficulty: 'hard',
      hint: 'Calculate the actual dollar revenue in 2020 and 2023 before subtracting.'
    },
    {
      id: 'graph_17',
      text: 'An ogive (cumulative frequency curve) displays salaries of 200 corporate staff: Cumulative counts are: $40k: 30 employees, $60k: 90 employees, $80k: 160 employees, $100k: 200 employees. How many employees earn between $60k and $80k?',
      options: ['50 employees', '60 employees', '70 employees', '80 employees'],
      correct: 2,
      explanation: 'The number earning between $60k and $80k is the difference between cumulative totals at $80k and $60k: 160 - 90 = 70 employees.',
      difficulty: 'hard',
      hint: 'Subtract cumulative count at $60k from cumulative count at $80k.'
    },
    {
      id: 'graph_18',
      text: 'A paired bar graph displays Exports and Imports ($M):\nCountry X: Exports 350, Imports 300\nCountry Y: Exports 480, Imports 400\nCountry Z: Exports 270, Imports 200.\nWhich country exhibits the highest ratio of Exports to Imports?',
      options: ['Country X', 'Country Y', 'Country Z', 'Countries X and Y tied'],
      correct: 2,
      explanation: 'Export / Import ratios: Country X = 350 / 300 ≈ 1.167; Country Y = 480 / 400 = 1.200; Country Z = 270 / 200 = 1.350. Country Z is highest.',
      difficulty: 'hard',
      hint: 'Calculate Export divided by Import for each country.'
    },
    {
      id: 'graph_19',
      text: 'A cost breakdown pie chart: R&D: 108°, Operations: 144°, Marketing: 72°, Administration: 36°. If Marketing expenditure is trimmed by 25% and that exact saved expenditure is transferred entirely to R&D, what will be the new central angle for R&D?',
      options: ['118°', '120°', '126°', '132°'],
      correct: 2,
      explanation: 'Marketing angle = 72°. Reduction = 25% of 72° = 18°. Transferred to R&D = 108° + 18° = 126°.',
      difficulty: 'hard',
      hint: 'Calculate 25% of 72 degrees and add it to 108 degrees.'
    },
    {
      id: 'graph_20',
      text: 'A spider (radar) chart evaluates two software platforms on 5 parameters (score 1-10):\nSecurity: Alpha 8, Beta 6\nSpeed: Alpha 7, Beta 9\nUsability: Alpha 9, Beta 7\nReliability: Alpha 8, Beta 8\nScalability: Alpha 8, Beta 10.\nWhat is the difference between the mean overall scores of Alpha and Beta?',
      options: ['0.0', '0.2', '0.4', '0.6'],
      correct: 0,
      explanation: 'Alpha sum = 8 + 7 + 9 + 8 + 8 = 40 (Mean = 8.0). Beta sum = 6 + 9 + 7 + 8 + 10 = 40 (Mean = 8.0). Difference = 8.0 - 8.0 = 0.0.',
      difficulty: 'hard',
      hint: 'Sum all 5 scores for each platform and compare the totals.'
    }
  ];
})();
