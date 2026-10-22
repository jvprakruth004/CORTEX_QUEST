/**
 * Cortex Quest - Non-Verbal Reasoning Questions
 * Submodule: non-verbal | Module: logical-reasoning
 * 20 questions (6 Easy, 8 Medium, 6 Hard)
 */

(function () {
  'use strict';

  window.QuestionsNonVerbal = [
    // --- EASY (1 to 6) ---
    {
      id: 'nonverb_01',
      text: 'A geometric figure series progresses as follows: Step 1: Upright square (0°); Step 2: Diamond / tilted square (45°); Step 3: Upright square (90°); Step 4: Diamond (135°). What orientation appears in Step 5?',
      options: ['Tilted 30°', 'Upright square (180°)', 'Diamond (225°)', 'Octagon'],
      correct: 1,
      explanation: 'The shape rotates 45° clockwise at each step. At 180° rotation (4 * 45°), a square returns to its upright orientation.',
      difficulty: 'easy',
      hint: 'The pattern strictly alternates between upright square and 45-degree diamond.'
    },
    {
      id: 'nonverb_02',
      text: 'Consider the regular polygon series: Triangle (3 sides) -> Square (4 sides) -> Pentagon (5 sides) -> Hexagon (6 sides). What is the next shape in this series?',
      options: ['Heptagon (7 sides)', 'Octagon (8 sides)', 'Nonagon (9 sides)', 'Decagon (10 sides)'],
      correct: 0,
      explanation: 'The number of sides increments by 1 at each stage (3, 4, 5, 6, 7). A 7-sided polygon is a heptagon.',
      difficulty: 'easy',
      hint: 'Add one side to the 6-sided hexagon.'
    },
    {
      id: 'nonverb_03',
      text: 'What is the lateral reflection (mirror image) of the lowercase letter "b" reflected across a vertical mirror line placed to its right?',
      options: ['p', 'q', 'd', 'b'],
      correct: 2,
      explanation: 'Reflecting a lowercase "b" across a vertical mirror reverses left and right while keeping top and bottom unchanged, resulting in "d".',
      difficulty: 'easy',
      hint: 'Flip "b" horizontally across the vertical axis.'
    },
    {
      id: 'nonverb_04',
      text: 'A square frame gains dots corner-by-corner: Step 1: Top-left corner; Step 2: Top-left and top-right; Step 3: Top-left, top-right, and bottom-right. Where is the final dot placed in Step 4?',
      options: ['Center of square', 'Bottom-left corner', 'Outside the frame', 'Top-left again'],
      correct: 1,
      explanation: 'The dots are added in clockwise order around the four corners. The fourth corner is the bottom-left corner.',
      difficulty: 'easy',
      hint: 'Continue clockwise to the remaining unpopulated corner.'
    },
    {
      id: 'nonverb_05',
      text: 'A circle is divided into 4 quadrants. A shaded quadrant rotates clockwise by 1 quadrant per step: Top-Right -> Bottom-Right -> Bottom-Left. Which quadrant will be shaded next?',
      options: ['Top-Left', 'Center', 'Bottom-Right', 'Top-Right'],
      correct: 0,
      explanation: 'Following clockwise quadrant rotation: Top-Right -> Bottom-Right -> Bottom-Left -> Top-Left.',
      difficulty: 'easy',
      hint: 'Move one quadrant further clockwise around the circle.'
    },
    {
      id: 'nonverb_06',
      text: 'Shape progression by straight line segments: 1 segment (single line), 2 segments (letter V), 3 segments (triangle), 4 segments (quadrilateral). What shape constructed from 5 segments follows next?',
      options: ['Square', 'Hexagon', 'Pentagon', 'Star polygon with 10 segments'],
      correct: 2,
      explanation: 'A closed polygon with 5 line segments is a pentagon.',
      difficulty: 'easy',
      hint: 'Count the number of edges: 1, 2, 3, 4, 5.'
    },

    // --- MEDIUM (7 to 14) ---
    {
      id: 'nonverb_07',
      text: 'An angle between two rotating dial hands increases by 30° at each consecutive frame: Frame 1: 30°, Frame 2: 60°, Frame 3: 90°, Frame 4: 120°. What angle will be shown in Frame 5?',
      options: ['135°', '140°', '150°', '180°'],
      correct: 2,
      explanation: 'The angle grows by an arithmetic progression with a common difference of +30°: 120° + 30° = 150°.',
      difficulty: 'medium',
      hint: 'Add 30° to the previous angle of 120°.'
    },
    {
      id: 'nonverb_08',
      text: 'What does the word "MOM" look like when reflected across a vertical mirror line placed to its right?',
      options: ['WOW', 'NON', 'MOM', 'MOOW'],
      correct: 2,
      explanation: 'Both "M" and "O" are vertically symmetric letters, and the word MOM is a palindrome. Its lateral mirror reflection is identical to the original word: "MOM".',
      difficulty: 'medium',
      hint: 'Check if the letters and the sequence have horizontal mirror symmetry.'
    },
    {
      id: 'nonverb_09',
      text: 'A square sheet of paper is folded in half left-to-right, then folded in half top-to-bottom. A single circular hole is punched straight through the center of the folded square. When fully unfolded, how many holes appear?',
      options: ['1 hole', '2 holes', '4 holes', '8 holes'],
      correct: 2,
      explanation: 'Each fold doubles the thickness (layers): 1 fold = 2 layers; 2 folds = 4 layers. Punching one hole through 4 layers produces 4 holes when unfolded.',
      difficulty: 'medium',
      hint: 'The paper is 4 layers thick at the time of punching.'
    },
    {
      id: 'nonverb_10',
      text: 'In a 3x3 pattern matrix:\nRow 1: Circle with 1 dot, Circle with 2 dots, Circle with 3 dots\nRow 2: Square with 1 dot, Square with 2 dots, Square with 3 dots\nRow 3: Triangle with 1 dot, Triangle with 2 dots, [ ? ]\nWhat element belongs in [ ? ]?',
      options: ['Circle with 4 dots', 'Square with 3 dots', 'Triangle with 3 dots', 'Triangle with 4 dots'],
      correct: 2,
      explanation: 'Each row maintains the same geometric container shape, while the dot count increments by 1 across the columns (1, 2, 3). Row 3 container is a Triangle, so the 3rd cell is a Triangle with 3 dots.',
      difficulty: 'medium',
      hint: 'Match both the outer shape of Row 3 and the dot progression of Column 3.'
    },
    {
      id: 'nonverb_11',
      text: 'An arrow undergoes a dual transformation: Step 1: Points UP with a solid black arrowhead. Step 2: Rotates 90° clockwise (points RIGHT) with a hollow white arrowhead. Step 3: Rotates 90° clockwise (points DOWN) with a solid black arrowhead. Step 4: Points LEFT with a hollow white arrowhead. What is Step 5?',
      options: ['Points UP, hollow white', 'Points UP, solid black', 'Points RIGHT, solid black', 'Points DOWN, hollow white'],
      correct: 1,
      explanation: 'Direction turns 90° clockwise: UP -> RIGHT -> DOWN -> LEFT -> UP. Fill alternates: black -> white -> black -> white -> black. Thus Step 5 is UP with a solid black head.',
      difficulty: 'medium',
      hint: 'Track the 90° clockwise rotation and the black/white fill toggle separately.'
    },
    {
      id: 'nonverb_12',
      text: 'What is the water reflection image (reflection across a horizontal mirror along the bottom edge) of the capital letter "C"?',
      options: ['U', 'C', 'Reverse C', 'D'],
      correct: 1,
      explanation: 'Capital "C" possesses a horizontal line of symmetry through its middle. Reflecting across a horizontal bottom boundary preserves its top-down shape, leaving it as "C".',
      difficulty: 'medium',
      hint: 'Does the letter C have horizontal reflectional symmetry?'
    },
    {
      id: 'nonverb_13',
      text: 'A layered symbol adds concentric elements: Figure 1: A circle. Figure 2: A circle enclosing an inscribed equilateral triangle. Figure 3: A circle enclosing a triangle enclosing an inner square. What would be the next concentric interior shape in Figure 4?',
      options: ['A regular pentagon', 'An outer square', 'A line segment', 'A circle outside'],
      correct: 0,
      explanation: 'The inner inscribed polygons progress by increasing side count: Triangle (3 sides) -> Square (4 sides) -> Pentagon (5 sides).',
      difficulty: 'medium',
      hint: 'Look at the side counts of the innermost inscribed polygons: 3, 4, 5.'
    },
    {
      id: 'nonverb_14',
      text: 'In a 3x3 matrix where shapes combine horizontally:\nRow 1: Empty box + Circle = Circle inside Box\nRow 2: Triangle + Cross = Cross inside Triangle\nRow 3: Diamond + Star = [ ? ]\nWhat is the product in [ ? ]?',
      options: ['Star inside Diamond', 'Diamond inside Star', 'Two Stars', 'Empty Diamond'],
      correct: 0,
      explanation: 'The rule places the second shape inside the first shape. Thus, a Diamond + Star yields a Star inside a Diamond.',
      difficulty: 'medium',
      hint: 'The first column is the outer container; the second column is the inner contents.'
    },

    // --- HARD (15 to 20) ---
    {
      id: 'nonverb_15',
      text: 'A 3x3 matrix follows a line segment conservation rule across each row:\nRow 1: Triangle (3) + Pentagon (5) + Heptagon (7) = 15 segments\nRow 2: Square (4) + Pentagon (5) + Hexagon (6) = 15 segments\nRow 3: Octagon (8) + Line segment (2) + [ ? ] = 15 segments\nWhich shape replaces [ ? ] to maintain the row sum?',
      options: ['Square (4 sides)', 'Pentagon (5 sides)', 'Hexagon (6 sides)', 'Heptagon (7 sides)'],
      correct: 1,
      explanation: 'Sum of line segments in Row 3 must equal 15: 8 + 2 + x = 15 => x = 5 segments. A 5-sided shape is a pentagon.',
      difficulty: 'hard',
      hint: 'Calculate 15 minus (8 + 2).'
    },
    {
      id: 'nonverb_16',
      text: 'A standard unfolded net of a 6-sided die specifies that opposite faces sum to 7 (1 is opposite 6, 2 is opposite 5, 3 is opposite 4). If the cube is folded and placed with Face 1 on top and Face 3 on the front, which face is on the bottom?',
      options: ['Face 4', 'Face 5', 'Face 6', 'Face 2'],
      correct: 2,
      explanation: 'The bottom face is directly opposite the top face. Since Face 1 is on top, its opposite face, Face 6, must be on the bottom.',
      difficulty: 'hard',
      hint: 'Identify the face directly opposite the top face (Face 1).'
    },
    {
      id: 'nonverb_17',
      text: 'A composite emblem consists of an outer equilateral triangle and an inner pointer. At each transition: the triangle rotates 60° clockwise, while the pointer rotates 45° counter-clockwise. After 6 consecutive transitions, what is the orientation of the inner pointer relative to its initial heading?',
      options: ['45° clockwise', '90° clockwise', '180° opposite', 'Identical to start'],
      correct: 1,
      explanation: 'The pointer rotates 6 * 45° = 270° counter-clockwise. A 270° counter-clockwise rotation is geometrically identical to a 90° clockwise rotation (360° - 270° = 90°).',
      difficulty: 'hard',
      hint: 'Multiply 45° by 6 to get 270° counter-clockwise, then find its clockwise equivalent.'
    },
    {
      id: 'nonverb_18',
      text: 'In a visual logic puzzle, Row 3 is generated by an XOR (exclusive OR) operation between Figure 1 and Figure 2: any overlapping line segment in both figures vanishes, while unique segments remain. If Figure 1 is a square with both diagonal lines and Figure 2 is only the two diagonal lines (X), what is the resulting figure?',
      options: ['An empty square', 'A solid black box', 'Only the X diagonals', 'An empty canvas'],
      correct: 0,
      explanation: 'The diagonal lines appear in both Figure 1 and Figure 2, so they cancel out. The 4 perimeter boundary edges of the square exist only in Figure 1, so they survive. The result is an empty square.',
      difficulty: 'hard',
      hint: 'Remove the diagonal lines that appear in both shapes; keep only the square perimeter.'
    },
    {
      id: 'nonverb_19',
      text: 'A marker travels clockwise along the 8 perimeter squares of a 3x3 grid (Positions 1 to 8). From Step 1 (Pos 1), it moves +1 step to Pos 2; then +2 steps to Pos 4; then +3 steps to Pos 7. If this progression of step sizes (+1, +2, +3, +4) continues, which position on the 8-cell ring does it reach next?',
      options: ['Pos 1', 'Pos 2', 'Pos 3', 'Pos 5'],
      correct: 2,
      explanation: 'From Pos 7, the marker advances by +4 steps. (7 + 4) = 11. On an 8-position cycle, 11 - 8 = Pos 3.',
      difficulty: 'hard',
      hint: 'Add 4 to position 7, and wrap around using modulo 8 arithmetic.'
    },
    {
      id: 'nonverb_20',
      text: 'A solid wooden 4x4x4 cube is painted red on all 6 exterior faces and then sliced into 64 identical 1x1x1 unit cubes. How many of the smaller cubes have EXACTLY TWO red-painted faces?',
      options: ['16 cubes', '24 cubes', '32 cubes', '36 cubes'],
      correct: 1,
      explanation: 'Cubes with exactly two painted faces reside along the 12 edges, excluding the 8 vertices. Along each edge of length 4, there are 4 - 2 = 2 edge cubes. Total = 12 edges * 2 cubes/edge = 24 unit cubes.',
      difficulty: 'hard',
      hint: 'Two-painted-face cubes lie on the edges between corner cubes: 12 edges * (n - 2).'
    }
  ];
})();
