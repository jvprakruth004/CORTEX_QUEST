/**
 * Cortex Quest - Tables and Charts Data Interpretation Questions
 * Submodule: tables-charts | Module: data-interpretation
 * 20 questions (6 Easy, 8 Medium, 6 Hard)
 */

(function () {
  'use strict';

  window.QuestionsTablesCharts = [
    // --- EASY (1 to 6) ---
    {
      id: 'table_01',
      text: 'A table shows annual production (in units) across four factories: Factory A: 120, Factory B: 180, Factory C: 150, Factory D: 250. What is the total production of all four factories combined?',
      options: ['650 units', '680 units', '700 units', '720 units'],
      correct: 2,
      explanation: 'Total production = 120 + 180 + 150 + 250 = 700 units.',
      difficulty: 'easy',
      hint: 'Sum the four individual factory production amounts.'
    },
    {
      id: 'table_02',
      text: 'Student exam scores are tabulated as follows: Alice: 84, Bob: 76, Charlie: 92, Diana: 88. What is the average score of the four students?',
      options: ['82.5', '84.0', '85.0', '86.5'],
      correct: 2,
      explanation: 'Total score = 84 + 76 + 92 + 88 = 340. Average = 340 / 4 = 85.0.',
      difficulty: 'easy',
      hint: 'Add all four scores and divide by 4.'
    },
    {
      id: 'table_03',
      text: 'A company reports quarterly revenue: Q1: $12M, Q2: $15M, Q3: $18M, Q4: $25M. What percentage of the annual total revenue ($70M) was generated in Q4?',
      options: ['30.5%', '33.3%', '35.7%', '38.2%'],
      correct: 2,
      explanation: 'Total revenue = 12 + 15 + 18 + 25 = 70M. Q4 percentage = (25 / 70) * 100 ≈ 35.71%.',
      difficulty: 'easy',
      hint: 'Divide 25 by 70 and multiply by 100.'
    },
    {
      id: 'table_04',
      text: 'Department headcount is recorded as: Sales: 45, HR: 15, Engineering: 90, Marketing: 30. What is the simplified ratio of Engineering staff to Sales staff?',
      options: ['1:2', '2:1', '3:2', '3:1'],
      correct: 1,
      explanation: 'Engineering = 90, Sales = 45. Ratio = 90 : 45 = 2 : 1.',
      difficulty: 'easy',
      hint: 'Divide both 90 and 45 by their common divisor 45.'
    },
    {
      id: 'table_05',
      text: 'A monthly budget table lists: Rent: $1,200, Food: $600, Utilities: $300, Transport: $400. What percentage of the total budget ($2,500) is allocated to Rent?',
      options: ['40%', '44%', '48%', '52%'],
      correct: 2,
      explanation: 'Total budget = 1200 + 600 + 300 + 400 = $2,500. Rent share = (1200 / 2500) * 100 = 48%.',
      difficulty: 'easy',
      hint: 'Multiply 1200 by 4 and divide by 100 (since 2500 * 4 = 10,000).'
    },
    {
      id: 'table_06',
      text: 'Daily visitor counts to a public gallery: Monday: 140, Tuesday: 160, Wednesday: 180, Thursday: 210, Friday: 260. Which day experienced the greatest absolute increase compared to its preceding day?',
      options: ['Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      correct: 3,
      explanation: 'Increases: Tue = 20, Wed = 20, Thu = 30, Fri = 260 - 210 = 50. Friday had the highest jump.',
      difficulty: 'easy',
      hint: 'Compute each day minus the prior day: Fri gained 50 visitors.'
    },

    // --- MEDIUM (7 to 14) ---
    {
      id: 'table_07',
      text: 'Sales volume (thousands) across two years:\nProduct X: 2021 = 50k, 2022 = 65k\nProduct Y: 2021 = 80k, 2022 = 96k\nProduct Z: 2021 = 40k, 2022 = 54k.\nWhich product recorded the highest percentage growth?',
      options: ['Product X', 'Product Y', 'Product Z', 'All grew equally'],
      correct: 2,
      explanation: 'Growth rates: X = (15/50)*100 = 30%; Y = (16/80)*100 = 20%; Z = (14/40)*100 = 35%. Product Z grew fastest at 35%.',
      difficulty: 'medium',
      hint: 'Calculate (Increase / 2021 Value) * 100 for each product.'
    },
    {
      id: 'table_08',
      text: 'Regional sales quotas and actual figures ($k):\nNorth: Target 200, Actual 220\nSouth: Target 150, Actual 135\nEast: Target 180, Actual 162\nWest: Target 250, Actual 275.\nWhat is the overall achievement percentage across all four regions combined?',
      options: ['98.5%', '100.0%', '101.5%', '103.2%'],
      correct: 2,
      explanation: 'Total Target = 200 + 150 + 180 + 250 = 780. Total Actual = 220 + 135 + 162 + 275 = 792. Achievement = (792 / 780) * 100 ≈ 101.54%.',
      difficulty: 'medium',
      hint: 'Sum all actual achievements and divide by the sum of all targets.'
    },
    {
      id: 'table_09',
      text: 'Batch quality records:\nBatch 1: Total 500, Defects 15\nBatch 2: Total 800, Defects 16\nBatch 3: Total 600, Defects 24\nBatch 4: Total 1,100, Defects 22.\nWhat is the aggregate defect rate across all 3,000 manufactured units?',
      options: ['2.25%', '2.57%', '2.85%', '3.10%'],
      correct: 1,
      explanation: 'Total units = 500 + 800 + 600 + 1100 = 3,000. Total defects = 15 + 16 + 24 + 22 = 77. Defect rate = (77 / 3000) * 100 ≈ 2.567% (2.57%).',
      difficulty: 'medium',
      hint: 'Sum all defects and divide by 3000 total items.'
    },
    {
      id: 'table_10',
      text: 'Financial performance ($k) of 3 ventures:\nCompany A: Revenue 80, Costs 50\nCompany B: Revenue 120, Costs 90\nCompany C: Revenue 150, Costs 105.\nWhich firm achieved the highest profit margin (Net Profit / Revenue)?',
      options: ['Company A', 'Company B', 'Company C', 'Companies A and C tied'],
      correct: 0,
      explanation: 'Profits: A = 30, B = 30, C = 45. Profit margins: A = 30/80 = 37.5%; B = 30/120 = 25.0%; C = 45/150 = 30.0%. Firm A is highest.',
      difficulty: 'medium',
      hint: 'Profit margin is (Revenue - Costs) / Revenue.'
    },
    {
      id: 'table_11',
      text: 'Student gender breakdown by college division:\nArts: 120 Male, 180 Female\nScience: 200 Male, 150 Female\nCommerce: 160 Male, 240 Female\nEngineering: 280 Male, 70 Female.\nWhat percentage of all 1,400 enrolled students are female?',
      options: ['42.50%', '45.71%', '48.25%', '51.40%'],
      correct: 1,
      explanation: 'Total females = 180 + 150 + 240 + 70 = 640. Total students = 300 + 350 + 400 + 350 = 1,400. Share = (640 / 1400) * 100 ≈ 45.71%.',
      difficulty: 'medium',
      hint: 'Add up the females in each department and divide by 1,400.'
    },
    {
      id: 'table_12',
      text: 'Quarterly units sold by three sales representatives:\nRep 1: Q1=30, Q2=45, Q3=50, Q4=75\nRep 2: Q1=40, Q2=40, Q3=60, Q4=60\nRep 3: Q1=50, Q2=35, Q3=45, Q4=90.\nWhat was the mean number of units sold per representative specifically in Q4?',
      options: ['65 units', '70 units', '75 units', '80 units'],
      correct: 2,
      explanation: 'Q4 sales: 75 + 60 + 90 = 225 units. Mean per rep = 225 / 3 = 75 units.',
      difficulty: 'medium',
      hint: 'Sum the three Q4 figures and divide by 3.'
    },
    {
      id: 'table_13',
      text: 'Hospital occupancy records:\nHospital 1: 300 beds, 80% occupied\nHospital 2: 500 beds, 70% occupied\nHospital 3: 200 beds, 90% occupied\nHospital 4: 400 beds, 85% occupied.\nWhat is the total number of occupied beds across all four facilities?',
      options: ['1,050', '1,080', '1,110', '1,150'],
      correct: 2,
      explanation: 'Occupied beds: H1 = 0.80*300 = 240; H2 = 0.70*500 = 350; H3 = 0.90*200 = 180; H4 = 0.85*400 = 340. Total = 240 + 350 + 180 + 340 = 1,110.',
      difficulty: 'medium',
      hint: 'Multiply the bed count by the occupancy percentage for each hospital.'
    },
    {
      id: 'table_14',
      text: 'Inventory sales analysis:\nItem A: $15 each, 200 units sold\nItem B: $25 each, 120 units sold\nItem C: $40 each, 80 units sold\nItem D: $10 each, 500 units sold.\nWhat is the volume-weighted average price per unit sold?',
      options: ['$14.25', '$15.78', '$16.50', '$18.00'],
      correct: 1,
      explanation: 'Total revenue = (15*200) + (25*120) + (40*80) + (10*500) = 3000 + 3000 + 3200 + 5000 = $14,200. Total units = 200 + 120 + 80 + 500 = 900. Weighted average = 14,200 / 900 ≈ $15.78.',
      difficulty: 'medium',
      hint: 'Calculate total revenue divided by total unit volume (900).'
    },

    // --- HARD (15 to 20) ---
    {
      id: 'table_15',
      text: 'A country’s international trade balance ($ billions) over 5 years:\n2019: Exports 140, Imports 160\n2020: Exports 120, Imports 110\n2021: Exports 160, Imports 180\n2022: Exports 210, Imports 200\n2023: Exports 250, Imports 270.\nWhat is the cumulative 5-year trade balance (Total Exports - Total Imports)?',
      options: ['-$30 billion', '-$40 billion', '-$50 billion', '+$20 billion'],
      correct: 1,
      explanation: 'Trade balances: 2019: -20; 2020: +10; 2021: -20; 2022: +10; 2023: -20. Net sum = -20 + 10 - 20 + 10 - 20 = -$40 billion (Deficit of $40B).',
      difficulty: 'hard',
      hint: 'Calculate (Exports - Imports) for each year and sum the differences.'
    },
    {
      id: 'table_16',
      text: 'Staff compensation table:\nDept A: 20 staff, mean compensation $50,000\nDept B: 30 staff, mean compensation $60,000\nDept C: 50 staff, mean compensation $72,000.\nWhat is the weighted overall mean compensation across all 100 employees?',
      options: ['$61,000', '$62,500', '$64,000', '$65,200'],
      correct: 2,
      explanation: 'Total payroll = (20 * 50k) + (30 * 60k) + (50 * 72k) = 1,000k + 1,800k + 3,600k = $6,400,000. Overall mean = 6,400,000 / 100 = $64,000.',
      difficulty: 'hard',
      hint: 'Multiply headcount by mean salary for each department and sum, then divide by 100.'
    },
    {
      id: 'table_17',
      text: 'Two-year revenue progress ($k) for three franchise branches:\nBranch 1: 2021 = 400, 2022 = 460 (+15%), 2023 = 529 (+15%)\nBranch 2: 2021 = 500, 2022 = 550 (+10%), 2023 = 660 (+20%)\nBranch 3: 2021 = 300, 2022 = 390 (+30%), 2023 = 429 (+10%).\nWhich branch achieved the greatest overall percentage increase from 2021 to 2023?',
      options: ['Branch 1 (32.25%)', 'Branch 2 (32.00%)', 'Branch 3 (43.00%)', 'Branch 1 and 2 tied'],
      correct: 2,
      explanation: 'Overall increase: Branch 1 = (529 - 400)/400 = 32.25%; Branch 2 = (660 - 500)/500 = 32.0%; Branch 3 = (429 - 300)/300 = 129/300 = 43.0%. Branch 3 had the largest growth.',
      difficulty: 'hard',
      hint: 'Compute (2023 Revenue - 2021 Revenue) / 2021 Revenue for each branch.'
    },
    {
      id: 'table_18',
      text: 'Standardized assessment statistics across test cohorts:\nCohort A: Mean 68, StdDev 8, Student Score 76\nCohort B: Mean 72, StdDev 6, Student Score 78\nCohort C: Mean 60, StdDev 10, Student Score 75\nCohort D: Mean 65, StdDev 5, Student Score 72.\nIn which cohort did the student achieve the highest relative standing (z-score = [Score - Mean] / StdDev)?',
      options: ['Cohort A', 'Cohort B', 'Cohort C', 'Cohort D'],
      correct: 2,
      explanation: 'Z-scores: A = (76 - 68)/8 = 1.0; B = (78 - 72)/6 = 1.0; C = (75 - 60)/10 = 1.5; D = (72 - 65)/5 = 1.4. Cohort C had the highest z-score (+1.5).',
      difficulty: 'hard',
      hint: 'Evaluate z = (Score - Mean) / StdDev for all four cohorts.'
    },
    {
      id: 'table_19',
      text: 'Grid power generation (GWh) over 3 years:\nYear 1: Solar 50, Wind 70, Coal 180 (Total 300)\nYear 2: Solar 80, Wind 90, Coal 160 (Total 330)\nYear 3: Solar 120, Wind 130, Coal 150 (Total 400).\nBy how many percentage points did the renewable energy share (Solar + Wind) increase from Year 1 to Year 3?',
      options: ['18.5 percentage points', '20.0 percentage points', '22.5 percentage points', '25.0 percentage points'],
      correct: 2,
      explanation: 'Year 1 renewables = (50 + 70)/300 = 120/300 = 40.0%. Year 3 renewables = (120 + 130)/400 = 250/400 = 62.5%. Increase = 62.5 - 40.0 = 22.5 percentage points.',
      difficulty: 'hard',
      hint: 'Calculate renewable percentage in Year 1 and Year 3, then subtract.'
    },
    {
      id: 'table_20',
      text: 'Advertising channel metrics:\nChannel A: Spend $20k, Revenue $70k\nChannel B: Spend $40k, Revenue $110k\nChannel C: Spend $15k, Revenue $60k\nChannel D: Spend $25k, Revenue $85k.\nIf ROI is defined as [(Revenue - Spend) / Spend] * 100, which channel achieved the SECOND highest ROI?',
      options: ['Channel A', 'Channel B', 'Channel C', 'Channel D'],
      correct: 0,
      explanation: 'ROI: Channel A = (50/20)*100 = 250%; Channel B = (70/40)*100 = 175%; Channel C = (45/15)*100 = 300%; Channel D = (60/25)*100 = 240%. Ranked: C (300%) 1st, A (250%) 2nd, D (240%) 3rd, B (175%) 4th.',
      difficulty: 'hard',
      hint: 'Calculate ROI for all four: Channel C is 300% and Channel A is 250%.'
    }
  ];
})();
