/**
 * Cortex Quest - Analytical Reasoning Questions
 * Submodule: analytical-reasoning | Module: logical-reasoning
 * 20 questions (6 Easy, 8 Medium, 6 Hard)
 */

(function () {
  'use strict';

  window.QuestionsAnalyticalReasoning = [
    // --- EASY (1 to 6) ---
    {
      id: 'analyt_01',
      text: 'A walker journeys 10 meters North, turns right and walks 5 meters, then turns right again and walks 10 meters. How far and in which direction is the walker from the starting position?',
      options: ['5 meters East', '5 meters West', '10 meters South', '15 meters East'],
      correct: 0,
      explanation: 'The North and South movements cancel each other out (10m North followed by 10m South). The remaining displacement is 5 meters East.',
      difficulty: 'easy',
      hint: 'Trace the coordinates: (0,10) -> (5,10) -> (5,0).'
    },
    {
      id: 'analyt_02',
      text: 'Pointing to a young man, a woman says: "His mother is the only daughter of my mother." How is the woman related to the young man?',
      options: ['Sister', 'Mother', 'Aunt', 'Grandmother'],
      correct: 1,
      explanation: '"The only daughter of my mother" refers to the speaker herself. Thus, his mother is the speaker. The woman is his mother.',
      difficulty: 'easy',
      hint: 'Who is the only daughter of your mother, if you are a woman?'
    },
    {
      id: 'analyt_03',
      text: 'In a 100m sprint: Alan finished ahead of Ben, Ben finished ahead of Carl, Carl finished ahead of Dan, and Dan finished ahead of Evan. Who claimed 3rd place?',
      options: ['Alan', 'Ben', 'Carl', 'Dan'],
      correct: 2,
      explanation: 'The finish order is Alan (1st) > Ben (2nd) > Carl (3rd) > Dan (4th) > Evan (5th). Carl is 3rd.',
      difficulty: 'easy',
      hint: 'Count down from the fastest runner to the third position.'
    },
    {
      id: 'analyt_04',
      text: 'Five friends (P, Q, R, S, T) sit in a straight row facing North. R sits in the exact middle. Q sits immediately to the right of R. In which position from the left does Q sit?',
      options: ['2nd', '3rd', '4th', '5th'],
      correct: 2,
      explanation: 'In a 5-person row, the middle seat is position 3 (R). Immediately right of position 3 is position 4. Thus Q is in the 4th position.',
      difficulty: 'easy',
      hint: 'The middle seat of 5 is position 3.'
    },
    {
      id: 'analyt_05',
      text: 'Starting from Point O, Ravi walks 4 km West, then makes a 90-degree left turn and walks 3 km South. What is the shortest straight-line distance back to Point O?',
      options: ['4 km', '5 km', '6 km', '7 km'],
      correct: 1,
      explanation: 'By the Pythagorean theorem: distance = √(4² + 3²) = √(16 + 9) = √25 = 5 km.',
      difficulty: 'easy',
      hint: 'Apply the Pythagorean theorem to the 3-4-5 right triangle.'
    },
    {
      id: 'analyt_06',
      text: 'A is the brother of B. B is the sister of C. C is the father of D. How is A related to D?',
      options: ['Father', 'Brother', 'Paternal Uncle', 'Nephew'],
      correct: 2,
      explanation: 'C is D’s father. Since A is the brother of C (and B), A is the brother of D’s father, which makes him D’s paternal uncle.',
      difficulty: 'easy',
      hint: 'What do you call the brother of your father?'
    },

    // --- MEDIUM (7 to 14) ---
    {
      id: 'analyt_07',
      text: 'Six persons (A, B, C, D, E, F) sit in a circle facing inward. A is seated directly opposite D. B is seated to the immediate right of A. E sits directly opposite B. C sits between D and E. Who sits between A and D, directly opposite C?',
      options: ['B', 'E', 'F', 'Cannot be determined'],
      correct: 2,
      explanation: 'Arranging in circular order: A is at 12:00, D is at 6:00. B is at 2:00, E is opposite B at 8:00. C is between D(6:00) and E(8:00) at 7:00. The remaining person F must sit at 4:00 (between D and B/A), directly opposite C.',
      difficulty: 'medium',
      hint: 'Place the people on clock-face positions to trace the vacant seat.'
    },
    {
      id: 'analyt_08',
      text: 'A delivery cyclist travels 12 km North, turns East and travels 5 km, then turns South and travels 8 km, and finally turns West and travels 5 km. How far is the cyclist from the starting point?',
      options: ['3 km North', '4 km North', '5 km North', '7 km North'],
      correct: 1,
      explanation: 'East-West displacement: 5 km East - 5 km West = 0 km. North-South displacement: 12 km North - 8 km South = 4 km North.',
      difficulty: 'medium',
      hint: 'Combine perpendicular vector components independently.'
    },
    {
      id: 'analyt_09',
      text: 'Coded relations: A + B means A is the father of B; A - B means A is the sister of B; A * B means A is the brother of B; A / B means A is the mother of B. Which expression proves that P is the maternal aunt of Q?',
      options: ['P - M / Q', 'P + M / Q', 'P / M - Q', 'P * M + Q'],
      correct: 0,
      explanation: 'In P - M / Q: P is the sister of M (P - M), and M is the mother of Q (M / Q). The sister of one’s mother is their maternal aunt.',
      difficulty: 'medium',
      hint: 'Look for an expression where P is the sister of someone who is the mother of Q.'
    },
    {
      id: 'analyt_10',
      text: 'Five colored sedans (Red, Blue, Green, Yellow, White) are parked in a row facing forward: Yellow is at the extreme right end. Red is to the immediate left of Yellow. Blue is at the extreme left end. Green is parked between Blue and White. Which sedan is parked in the middle?',
      options: ['Blue', 'Green', 'White', 'Red'],
      correct: 2,
      explanation: 'From left to right: Position 1 = Blue. Since Green is between Blue and White, Position 2 = Green and Position 3 = White. Red is next to Yellow at the right: Position 4 = Red, Position 5 = Yellow. Middle (Position 3) is White.',
      difficulty: 'medium',
      hint: 'Build the line from the two designated ends inward.'
    },
    {
      id: 'analyt_11',
      text: 'Among five friends P, Q, R, S, T: P is heavier than Q but lighter than T. S is lighter than Q but heavier than R. Who is the second lightest person among them?',
      options: ['P', 'Q', 'S', 'R'],
      correct: 2,
      explanation: 'Ordering by weight from heaviest to lightest: T > P > Q > S > R. R is the lightest, so S is the second lightest.',
      difficulty: 'medium',
      hint: 'Line them up from heaviest to lightest: T > P > Q > S > R.'
    },
    {
      id: 'analyt_12',
      text: 'Six friends P, Q, R, S, T, U sit in a circle facing the center. P is directly opposite S. Q sits to the immediate left of P. R sits directly opposite Q. T sits to the immediate right of P. Who sits to the immediate right of S?',
      options: ['Q', 'R', 'T', 'U'],
      correct: 3,
      explanation: 'Positions clockwise: 1:P, 2:Q, 3:U, 4:S, 5:R, 6:T. When sitting at S (pos 4) facing center, the person to S’s immediate right is at pos 3, which is U.',
      difficulty: 'medium',
      hint: 'Remember that when facing the center, right is counter-clockwise.'
    },
    {
      id: 'analyt_13',
      text: 'A surveyor initially faces due East. She turns 90° clockwise, then turns 180° counter-clockwise, and finally turns 45° clockwise. In which direction is she now facing?',
      options: ['North', 'North-East', 'East', 'South-East'],
      correct: 1,
      explanation: 'Start = East (90°). +90° clockwise = South (180°). -180° counter-clockwise = North (0° / 360°). +45° clockwise = North-East (45°).',
      difficulty: 'medium',
      hint: 'Track net angular turn: +90° - 180° + 45° = -45° (i.e. 45° counter-clockwise from East = North-East).'
    },
    {
      id: 'analyt_14',
      text: 'In a family of six persons A, B, C, D, E, F with two married couples: D is the grandmother of A and mother of B. C is the wife of B and mother of F. F is the granddaughter of E. How is E related to A?',
      options: ['Father', 'Maternal Uncle', 'Paternal Grandfather', 'Brother'],
      correct: 2,
      explanation: 'D is grandmother of A and mother of B. C is wife of B, meaning B and C are the parents of A and F. Since D is married, her husband must be E. E is the paternal grandfather of A.',
      difficulty: 'medium',
      hint: 'D is the grandmother and E is her spouse.'
    },

    // --- HARD (15 to 20) ---
    {
      id: 'analyt_15',
      text: 'Six colleagues (P, Q, R, S, T, U) occupy a 6-story building (Floors 1 to 6). R lives on Floor 6. U lives on Floor 1. T lives on an even-numbered floor. Q lives above T with exactly two floors between them. P lives immediately above S. On which floor does T live?',
      options: ['Floor 2', 'Floor 3', 'Floor 4', 'Floor 5'],
      correct: 0,
      explanation: 'T must be on an even floor (2 or 4). If T = Floor 2, Q is on Floor 5 (two floors, 3 and 4, between them). Then P and S must occupy consecutive floors 4 and 3 (P = 4, S = 3). This fits all conditions cleanly. T lives on Floor 2.',
      difficulty: 'hard',
      hint: 'If T lived on floor 4, Q would have to live on floor 7, which does not exist.'
    },
    {
      id: 'analyt_16',
      text: 'Eight people (A, B, C, D, E, F, G, H) sit around a circular table facing the center. A sits 3rd to the right of H. B sits 2nd to the left of A. C sits 3rd to the right of B. F sits to the immediate left of C. D cannot sit adjacent to H or A. E sits opposite D. Who sits directly opposite B?',
      options: ['C', 'D', 'E', 'F'],
      correct: 3,
      explanation: 'Clockwise positions: 1:H, 2:B, 3:E, 4:A, 5:C, 6:F, 7:D, 8:G. Direct opposite of position 2 (B) in an 8-person circle is position (2+4) = 6, which is F.',
      difficulty: 'hard',
      hint: 'In an 8-person circle, the opposite person is 4 seats away.'
    },
    {
      id: 'analyt_17',
      text: 'A family of three generations includes six members: two lawyers, two doctors, an engineer, and an architect. The grandfather is an architect. The father is a lawyer married to a doctor. The daughter is an engineer. The mother has a son who is a doctor. What is the profession of the grandmother?',
      options: ['Doctor', 'Lawyer', 'Engineer', 'Architect'],
      correct: 1,
      explanation: 'Professions tallied: Architect (grandfather), Lawyer (father), Doctor (mother), Engineer (daughter), Doctor (son). To satisfy the requirement of two lawyers, the grandmother must be the second lawyer.',
      difficulty: 'hard',
      hint: 'Tally the listed professions and identify which required duplicate profession is missing.'
    },
    {
      id: 'analyt_18',
      text: 'Five presentations (Alpha, Beta, Gamma, Delta, Epsilon) occur Mon through Fri. Alpha is on Tuesday. Delta is two days after Alpha (Thursday). Beta is presented immediately before Delta (Wednesday). Epsilon is not on Friday. Which presentation is delivered on Monday?',
      options: ['Beta', 'Gamma', 'Delta', 'Epsilon'],
      correct: 3,
      explanation: 'Schedule: Tue = Alpha, Wed = Beta, Thu = Delta. Remaining days: Mon and Fri. Since Epsilon cannot be on Friday, Epsilon must be on Monday (and Gamma is on Friday).',
      difficulty: 'hard',
      hint: 'Fill in Tuesday, Wednesday, and Thursday first, then apply the Friday constraint on Epsilon.'
    },
    {
      id: 'analyt_19',
      text: 'A robotic rover starts at (0, 0) facing North. It advances 5 units, turns 90° right, advances 3 units, turns 90° right, advances 2 units, turns 90° left, and advances 4 units. What are its final Cartesian coordinates (x, y)?',
      options: ['(7, 3)', '(3, 7)', '(7, 5)', '(4, 3)'],
      correct: 0,
      explanation: '1. Start (0,0) facing N. Adv 5 => (0,5). 2. Turn R (facing E). Adv 3 => (3,5). 3. Turn R (facing S). Adv 2 => (3,3). 4. Turn L (facing E). Adv 4 => (7,3). Final coordinates: (7, 3).',
      difficulty: 'hard',
      hint: 'Track x and y step by step: x = 0 + 3 + 4 = 7; y = 0 + 5 - 2 = 3.'
    },
    {
      id: 'analyt_20',
      text: 'On an island, Knights always tell the truth and Knaves always lie. You meet two islanders, A and B. Islander A states: "At least one of us is a Knave." What are the identities of A and B?',
      options: ['A is a Knight, B is a Knight', 'A is a Knight, B is a Knave', 'A is a Knave, B is a Knight', 'Both are Knaves'],
      correct: 1,
      explanation: 'If A were a Knave, his statement would be true (since A is a knave), but Knaves cannot tell the truth. Thus, A must be a Knight. Since A tells the truth, at least one of them is indeed a Knave, which means B must be the Knave.',
      difficulty: 'hard',
      hint: 'Can a Knave ever say "I am a Knave" or "At least one of us is a Knave"?'
    }
  ];
})();
