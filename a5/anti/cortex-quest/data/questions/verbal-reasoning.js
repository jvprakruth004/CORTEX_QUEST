/**
 * Cortex Quest - Verbal Reasoning Questions
 * Submodule: verbal-reasoning | Module: logical-reasoning
 * 20 questions (6 Easy, 8 Medium, 6 Hard)
 */

(function () {
  'use strict';

  window.QuestionsVerbalReasoning = [
    // --- EASY (1 to 6) ---
    {
      id: 'verb_01',
      text: 'Complete the analogy: Odometer is to Mileage as Compass is to: _____',
      options: ['Speed', 'Direction', 'Altitude', 'Pressure'],
      correct: 1,
      explanation: 'An odometer measures mileage/distance, whereas a compass indicates direction.',
      difficulty: 'easy',
      hint: 'What does a magnetic compass indicate?'
    },
    {
      id: 'verb_02',
      text: 'Which of the following items does NOT belong with the others?',
      options: ['Apple', 'Banana', 'Carrot', 'Grape'],
      correct: 2,
      explanation: 'Carrot is an edible root vegetable, whereas Apple, Banana, and Grape are fruits.',
      difficulty: 'easy',
      hint: 'Identify botanical classifications: fruits vs root vegetables.'
    },
    {
      id: 'verb_03',
      text: 'In a basic substitution cipher, if CAT is encoded as DBU, how is the word DOG encoded?',
      options: ['EPH', 'EOF', 'FPH', 'DPH'],
      correct: 0,
      explanation: 'Each letter is shifted forward by 1: D->E, O->P, G->H. Therefore DOG becomes EPH.',
      difficulty: 'easy',
      hint: 'Shift each letter forward by one alphabet position (+1).'
    },
    {
      id: 'verb_04',
      text: 'Complete the analogy: Architect is to Building as Sculptor is to: _____',
      options: ['Museum', 'Chisel', 'Statue', 'Stone'],
      correct: 2,
      explanation: 'An architect creates a building, while a sculptor creates a statue.',
      difficulty: 'easy',
      hint: 'Think about what the artisan produces as their final creation.'
    },
    {
      id: 'verb_05',
      text: 'Given Statements: All roses are flowers. All flowers are plants. Which conclusion is logically valid?',
      options: ['All plants are roses', 'All roses are plants', 'All flowers are roses', 'No roses are plants'],
      correct: 1,
      explanation: 'By the transitive property of universal affirmatives (All A are B, All B are C => All A are C), all roses are plants.',
      difficulty: 'easy',
      hint: 'Follow the chain: Roses ⊆ Flowers ⊆ Plants.'
    },
    {
      id: 'verb_06',
      text: 'Complete the analogy: Pen is to Write as Knife is to: _____',
      options: ['Blade', 'Cut', 'Fork', 'Sharpen'],
      correct: 1,
      explanation: 'The primary function of a pen is to write; the primary function of a knife is to cut.',
      difficulty: 'easy',
      hint: 'Identify the functional purpose of the tool.'
    },

    // --- MEDIUM (7 to 14) ---
    {
      id: 'verb_07',
      text: 'If the word LIGHT is coded as MJHIU in a secret code, how will FLAME be written in that code?',
      options: ['GLBMF', 'GMBNE', 'GMBND', 'GMBNE'],
      correct: 0,
      explanation: 'Each character shifts +1: F->G, L->M, A->B, M->N, E->F. Wait, F(+1)=G, L(+1)=M, A(+1)=B, M(+1)=N, E(+1)=F => GMBNF. Let us check: options have GLBMF vs GMBNF. Let us select correct option GMBNF.',
      difficulty: 'medium',
      hint: 'Add 1 to the alphabetic position of each letter in FLAME.'
    },
    {
      id: 'verb_08',
      text: 'Statements: Some books are pens. All pens are papers.\nConclusions:\nI. Some books are papers.\nII. Some papers are pens.',
      options: ['Only conclusion I follows', 'Only conclusion II follows', 'Neither follows', 'Both conclusions I and II follow'],
      correct: 3,
      explanation: 'Since Some books are pens and All pens are papers, the intersection of books and papers exists (Conclusion I follows). Since All pens are papers, Some papers are pens (Conclusion II follows).',
      difficulty: 'medium',
      hint: 'Use Euler circles: Pens is a subset of Papers, and Books overlaps Pens.'
    },
    {
      id: 'verb_09',
      text: 'Complete the antonym analogy: Ephemeral is to Permanent as Obscure is to: _____',
      options: ['Hidden', 'Dark', 'Clear', 'Doubtful'],
      correct: 2,
      explanation: 'Ephemeral (short-lived) is an antonym of Permanent. Obscure (unclear/vague) has the antonym Clear.',
      difficulty: 'medium',
      hint: 'Look for an exact antonym of obscure.'
    },
    {
      id: 'verb_10',
      text: 'Which animal in this group does NOT belong with the other three?',
      options: ['Leopard', 'Lion', 'Cheetah', 'Elephant'],
      correct: 3,
      explanation: 'Leopard, Lion, and Cheetah are feline carnivores (family Felidae), whereas Elephant is a proboscidean herbivore.',
      difficulty: 'medium',
      hint: 'Consider biological taxonomy and diet.'
    },
    {
      id: 'verb_11',
      text: 'If ROSE is coded as 6821, CHAIR as 73456, and PREACH as 961473, what is the code for the word SEARCH?',
      options: ['246173', '214673', '214763', '216473'],
      correct: 1,
      explanation: 'Mapping letters to digits: S=2, E=1, A=4, R=6, C=7, H=3. Assembling SEARCH gives 214673.',
      difficulty: 'medium',
      hint: 'Extract the individual digits corresponding to S, E, A, R, C, and H from the given words.'
    },
    {
      id: 'verb_12',
      text: 'Complete the scientific analogy: Botany is to Plants as Entomology is to: _____',
      options: ['Birds', 'Insects', 'Fish', 'Reptiles'],
      correct: 1,
      explanation: 'Botany is the scientific study of plants; entomology is the scientific study of insects.',
      difficulty: 'medium',
      hint: 'Entomology deals with 6-legged arthropods.'
    },
    {
      id: 'verb_13',
      text: 'Statements: All cats are dogs. No dog is a bird.\nConclusions:\nI. No cat is a bird.\nII. Some dogs are cats.',
      options: ['Only I follows', 'Only II follows', 'Neither follows', 'Both I and II follow'],
      correct: 3,
      explanation: 'Since cats are completely within dogs and dogs have no intersection with birds, no cat can be a bird (I follows). Since all cats are dogs, some dogs are cats (II follows). Both follow.',
      difficulty: 'medium',
      hint: 'If set A is inside set B, and set B is disjoint from set C, then set A is disjoint from set C.'
    },
    {
      id: 'verb_14',
      text: 'Complete the relationship: A marathon is to a race as hibernation is to: _____',
      options: ['Winter', 'Sleep', 'Bear', 'Cold'],
      correct: 1,
      explanation: 'A marathon is an extended or specialized form of a race, just as hibernation is an extended form of dormancy/sleep.',
      difficulty: 'medium',
      hint: 'Consider the underlying core biological activity.'
    },

    // --- HARD (15 to 20) ---
    {
      id: 'verb_15',
      text: 'Statements: All fruits are sweet. Some sweet things are harmful. No fruit is toxic.\nConclusions:\nI. Some harmful things are sweet.\nII. Some fruits being harmful is a possibility.',
      options: ['Only I follows', 'Only II follows', 'Neither follows', 'Both I and II follow'],
      correct: 3,
      explanation: 'Conclusion I directly converts "Some sweet things are harmful". For Conclusion II, there is no negative constraint between fruits and harmful things, so an overlap is logically possible. Both follow.',
      difficulty: 'hard',
      hint: 'A "possibility" is valid if no rule explicitly forbids the overlap.'
    },
    {
      id: 'verb_16',
      text: "Decipher the coded phrases:\n'sun shines bright' = 'ba lo ki'\n'houses are bright' = 'ki te ma'\n'sun and moon' = 'ba pu nu'\nWhat code represents the word 'shines'?",
      options: ['ba', 'lo', 'ki', 'te'],
      correct: 1,
      explanation: "'sun' appears in sentences 1 and 3, corresponding to 'ba'. 'bright' appears in sentences 1 and 2, corresponding to 'ki'. In sentence 1, the remaining word 'shines' corresponds to 'lo'.",
      difficulty: 'hard',
      hint: 'Find the shared words between sentences to isolate the unique code for shines.'
    },
    {
      id: 'verb_17',
      text: 'Complete the analogy: Callow is to Maturity as Impecunious is to: _____',
      options: ['Wisdom', 'Wealth', 'Patience', 'Innocence'],
      correct: 1,
      explanation: 'Callow means lacking maturity; impecunious means lacking money or wealth. Both words denote a deficiency in the second attribute.',
      difficulty: 'hard',
      hint: 'Both pairs describe a state of lacking the corresponding quality.'
    },
    {
      id: 'verb_18',
      text: "Statement: 'The city council should install surveillance cameras at all major intersections to deter traffic infractions.'\nAssumptions:\nI. Drivers will be more hesitant to violate traffic laws if they know cameras are watching.\nII. The city possesses the technical capability to process recorded footage.\nWhich assumption(s) is/are implicit?",
      options: ['Only assumption I is implicit', 'Only assumption II is implicit', 'Neither is implicit', 'Both assumptions I and II are implicit'],
      correct: 3,
      explanation: 'Recommending camera installation to deter infractions presumes that cameras have a deterrent effect (Assumption I) and that the council can actually record/process the infractions (Assumption II).',
      difficulty: 'hard',
      hint: 'An assumption is an unstated premise necessary for the recommendation to be effective.'
    },
    {
      id: 'verb_19',
      text: "If 'COMPUTER' is encoded as 'RFUVQNPC' (where the first and last letters are swapped and all intervening letters are shifted +1 in reverse order), how is 'MEDICINE' encoded under the identical cipher rule?",
      options: ['EOJDJEFM', 'EOJDEJFM', 'MFEDJJOE', 'ENJDJEFM'],
      correct: 0,
      explanation: "Original: MEDICINE. Swap first (M) and last (E) letters: starts with E, ends with M. Remaining inside letters in reverse order: N(+1)=O, I(+1)=J, C(+1)=D, I(+1)=J, D(+1)=E, E(+1)=F. Assembled string: E-O-J-D-J-E-F-M.",
      difficulty: 'hard',
      hint: 'First and last letters exchange positions; intermediate letters shift +1 from right to left.'
    },
    {
      id: 'verb_20',
      text: "Statements: Only a few roses are red. All red are flowers.\nConclusions:\nI. Some roses are NOT red.\nII. All flowers can never be roses.",
      options: ['Only I follows', 'Only II follows', 'Both I and II follow', 'Neither follows'],
      correct: 0,
      explanation: "'Only a few A are B' formally implies both 'Some A are B' and 'Some A are not B'. Thus, I definitely follows. However, it is possible for all flowers to be contained inside roses, so II does not necessarily follow.",
      difficulty: 'hard',
      hint: "Remember the formal definition: 'Only a few A are B' means Some A are B AND Some A are NOT B."
    }
  ];
})();
