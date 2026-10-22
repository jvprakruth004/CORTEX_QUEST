/**
 * Cortex Quest - Control Statements Questions
 * Submodule: control-statements | Module: programming
 * 20 questions (6 Easy, 8 Medium, 6 Hard)
 */

(function () {
  'use strict';

  window.QuestionsControlStatements = [
    // --- EASY (1 to 6) ---
    {
      id: 'ctrl_01',
      text: 'Which control statement immediately halts and breaks out of the enclosing loop (for, while, do-while)?',
      options: ['continue', 'break', 'return', 'exit'],
      correct: 1,
      explanation: 'The "break" statement terminates the innermost executing loop immediately and transfers control to the statement following the loop.',
      difficulty: 'easy',
      hint: 'It breaks out of the loop.'
    },
    {
      id: 'ctrl_02',
      text: 'Which statement bypasses the remaining code inside the current loop body and immediately advances to the next iteration?',
      options: ['break', 'continue', 'pass', 'skip'],
      correct: 1,
      explanation: 'The "continue" statement skips the rest of the current iteration and re-evaluates the loop condition for the next cycle.',
      difficulty: 'easy',
      hint: 'It tells the loop to continue to the next turn.'
    },
    {
      id: 'ctrl_03',
      text: 'How many times will this standard loop execute: "for (int i = 0; i < 5; i++)"?',
      options: ['4 times', '5 times', '6 times', 'Infinite times'],
      correct: 1,
      explanation: 'The counter i takes values 0, 1, 2, 3, and 4. When i increments to 5, 5 < 5 is false, resulting in exactly 5 iterations.',
      difficulty: 'easy',
      hint: 'Count from 0 up to 4 inclusive.'
    },
    {
      id: 'ctrl_04',
      text: 'In a switch-case statement, which keyword marks the catch-all branch executed if no specific case match is found?',
      options: ['else', 'catch', 'default', 'finally'],
      correct: 2,
      explanation: 'The "default" block in a switch structure handles any value that does not match any specified "case" labels.',
      difficulty: 'easy',
      hint: 'The fallback or default case.'
    },
    {
      id: 'ctrl_05',
      text: 'What is the primary operational distinction between a "while" loop and a "do-while" loop?',
      options: ['do-while executes in reverse', 'do-while is guaranteed to execute its body at least once', 'while loops cannot use break', 'do-while does not need a conditional check'],
      correct: 1,
      explanation: 'A do-while loop evaluates its exit condition at the bottom (post-test), ensuring the body executes at least once even if the condition is initially false.',
      difficulty: 'easy',
      hint: 'The condition is checked after the first execution.'
    },
    {
      id: 'ctrl_06',
      text: 'What will the following code output?\nlet x = 10;\nif (x > 5) {\n  console.log("ALPHA");\n} else {\n  console.log("BETA");\n}',
      options: ['ALPHA', 'BETA', 'ALPHA BETA', 'undefined'],
      correct: 0,
      explanation: 'Since 10 > 5 evaluates to true, the if-block executes, logging "ALPHA". The else branch is ignored.',
      difficulty: 'easy',
      hint: '10 is greater than 5.'
    },

    // --- MEDIUM (7 to 14) ---
    {
      id: 'ctrl_07',
      text: 'What is the final printed value of "sum"?\nlet sum = 0;\nfor (let i = 1; i <= 4; i++) {\n  sum += i;\n}\nconsole.log(sum);',
      options: ['6', '8', '10', '15'],
      correct: 2,
      explanation: 'Sum = 1 + 2 + 3 + 4 = 10.',
      difficulty: 'medium',
      hint: 'Add integers from 1 through 4.'
    },
    {
      id: 'ctrl_08',
      text: 'What is the logged value of "total"?\nlet total = 0;\nfor (let i = 0; i < 6; i++) {\n  if (i % 2 === 0) continue;\n  total += i;\n}\nconsole.log(total);',
      options: ['6', '8', '9', '15'],
      correct: 2,
      explanation: 'The continue statement skips even numbers (0, 2, 4). The loop accumulates only odd values: total = 1 + 3 + 5 = 9.',
      difficulty: 'medium',
      hint: 'Even values are skipped; only 1, 3, and 5 are added.'
    },
    {
      id: 'ctrl_09',
      text: 'How many total times does the innermost statement (ops++) execute?\nlet ops = 0;\nfor (let i = 0; i < 3; i++) {\n  for (let j = 0; j < 4; j++) {\n    ops++;\n  }\n}',
      options: ['7', '10', '12', '16'],
      correct: 2,
      explanation: 'The outer loop runs 3 times; for each iteration, the inner loop executes 4 times. Total = 3 * 4 = 12.',
      difficulty: 'medium',
      hint: 'Multiply the outer loop iteration count by the inner loop iteration count.'
    },
    {
      id: 'ctrl_10',
      text: 'In C/Java, what is the final value of y due to switch fall-through without break statements?\nint x = 2, y = 0;\nswitch (x) {\n  case 1: y += 10;\n  case 2: y += 20;\n  case 3: y += 30;\n  default: y += 5;\n}',
      options: ['20', '50', '55', '65'],
      correct: 2,
      explanation: 'Execution jumps to case 2 (y becomes 20). Because there are no "break" statements, execution falls through case 3 (y becomes 20 + 30 = 50) and default (y becomes 50 + 5 = 55).',
      difficulty: 'medium',
      hint: 'Execution begins at case 2 and cascades down through case 3 and default.'
    },
    {
      id: 'ctrl_11',
      text: 'What is the output of the following loop?\nlet n = 16, steps = 0;\nwhile (n > 1) {\n  n = Math.floor(n / 2);\n  steps++;\n}\nconsole.log(steps);',
      options: ['3', '4', '5', '8'],
      correct: 1,
      explanation: 'Values of n: 16 -> 8 (step 1) -> 4 (step 2) -> 2 (step 3) -> 1 (step 4). The loop terminates when n is 1. Steps = 4 (log2(16)).',
      difficulty: 'medium',
      hint: 'Count how many times 16 can be halved until reaching 1.'
    },
    {
      id: 'ctrl_12',
      text: 'What value is assigned to "res" by this ternary conditional?\nlet a = 5, b = 10;\nlet res = (a > b) ? (a * 2) : (b / 2);',
      options: ['10', '5', '20', 'undefined'],
      correct: 1,
      explanation: 'The condition (5 > 10) is false. Thus the false expression (b / 2 = 10 / 2 = 5) is evaluated and returned.',
      difficulty: 'medium',
      hint: 'The condition (5 > 10) is false, so evaluate the second expression.'
    },
    {
      id: 'ctrl_13',
      text: 'What value is printed by this loop?\nlet total = 0;\nfor (let i = 0; i < 5; i++) {\n  if (i === 3) break;\n  total += i;\n}\nconsole.log(total);',
      options: ['3', '6', '10', '15'],
      correct: 0,
      explanation: 'Iterations: i=0 (total=0), i=1 (total=1), i=2 (total=3). When i reaches 3, the break statement terminates the loop before adding. Output is 3.',
      difficulty: 'medium',
      hint: 'The loop breaks when i is 3, before total += 3 is executed.'
    },
    {
      id: 'ctrl_14',
      text: 'What is the final length of string "str"?\nlet str = "";\nfor (let i = 1; i <= 3; i++) {\n  for (let j = 1; j <= i; j++) {\n    str += "*";\n  }\n}\nconsole.log(str.length);',
      options: ['3', '5', '6', '9'],
      correct: 2,
      explanation: 'When i=1: 1 star. When i=2: 2 stars. When i=3: 3 stars. Total characters added = 1 + 2 + 3 = 6.',
      difficulty: 'medium',
      hint: 'The inner loop runs 1 time, then 2 times, then 3 times.'
    },

    // --- HARD (15 to 20) ---
    {
      id: 'ctrl_15',
      text: 'Predict the value of "k" after execution:\nlet k = 0;\nfor (let i = 1; i <= 4; i++) {\n  for (let j = i; j <= 4; j++) {\n    k++;\n  }\n}\nconsole.log(k);',
      options: ['8', '10', '12', '16'],
      correct: 1,
      explanation: 'For i=1: j runs 1 to 4 (4 times). For i=2: j runs 2 to 4 (3 times). For i=3: j runs 3 to 4 (2 times). For i=4: j runs 4 to 4 (1 time). Total k = 4 + 3 + 2 + 1 = 10.',
      difficulty: 'hard',
      hint: 'Sum the decreasing iterations: 4 + 3 + 2 + 1.'
    },
    {
      id: 'ctrl_16',
      text: 'In C, what is the printed value of "count"?\nint i = 0, count = 0;\nwhile (i++ < 5) {\n  count += i;\n}\nprintf("%d", count);',
      options: ['10', '15', '20', '21'],
      correct: 1,
      explanation: 'Condition i++ < 5 checks original i then post-increments. Iteration 1: 0 < 5 (true), i becomes 1, count += 1 = 1. Iter 2: 1 < 5 (true), i becomes 2, count += 2 = 3. Iter 3: 2 < 5 (true), i becomes 3, count += 3 = 6. Iter 4: 3 < 5 (true), i becomes 4, count += 4 = 10. Iter 5: 4 < 5 (true), i becomes 5, count += 5 = 15. Next check 5 < 5 (false), loop ends. Total = 15.',
      difficulty: 'hard',
      hint: 'Post-increment updates i before the body executes, adding 1 + 2 + 3 + 4 + 5.'
    },
    {
      id: 'ctrl_17',
      text: 'In C/C++, which of the following loop constructs produces an infinite loop due to unsigned integer underflow?',
      options: ['for (int i = 0; i < 10; i++)', 'for (unsigned int i = 10; i >= 0; i--)', 'while (false) { i++; }', 'for (int i = 5; i > 0; i -= 2)'],
      correct: 1,
      explanation: 'An unsigned integer is always >= 0. When i reaches 0 and is decremented (i--), it underflows to UINT_MAX (4,294,967,295), which is still >= 0. The condition is perpetually true.',
      difficulty: 'hard',
      hint: 'Unsigned numbers can never be negative; 0 - 1 underflows to the maximum possible unsigned value.'
    },
    {
      id: 'ctrl_18',
      text: 'What will be printed due to Boolean logical short-circuit evaluation?\nlet a = 0, b = 5;\nif (a !== 0 && (b = 10) > 0) {\n  // do nothing\n}\nconsole.log(b);',
      options: ['5', '10', '0', 'undefined'],
      correct: 0,
      explanation: 'In the logical AND (&&) expression, the first operand (a !== 0) evaluates to false (0 !== 0 is false). Due to short-circuiting, the second expression (b = 10) is never executed. Thus b remains 5.',
      difficulty: 'hard',
      hint: 'If the first operand of && is false, JavaScript never evaluates the second operand.'
    },
    {
      id: 'ctrl_19',
      text: 'What is the final value of "total" using labeled loop breaks in JavaScript?\nlet total = 0;\nouter: for (let i = 0; i < 3; i++) {\n  for (let j = 0; j < 3; j++) {\n    if (i === 1 && j === 1) break outer;\n    total++;\n  }\n}\nconsole.log(total);',
      options: ['3', '4', '6', '9'],
      correct: 1,
      explanation: 'When i=0: j=0, 1, 2 => total increments 3 times (total = 3). When i=1: j=0 => total increments once (total = 4). When i=1 and j=1, "break outer" terminates both loops immediately. Final total = 4.',
      difficulty: 'hard',
      hint: '"break outer" exits both the inner and outer loops immediately.'
    },
    {
      id: 'ctrl_20',
      text: 'What is the return value of this recursive function call f(5)?\nfunction f(n) {\n  if (n <= 1) return 1;\n  return n * f(n - 1);\n}',
      options: ['24', '60', '120', '720'],
      correct: 2,
      explanation: 'This function computes factorial n!: 5! = 5 * 4 * 3 * 2 * 1 = 120.',
      difficulty: 'hard',
      hint: '5 * 4 * 3 * 2 * 1.'
    }
  ];
})();
