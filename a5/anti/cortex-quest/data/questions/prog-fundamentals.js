/**
 * Cortex Quest - Programming Fundamentals Questions
 * Submodule: prog-fundamentals | Module: programming
 * 20 questions (6 Easy, 8 Medium, 6 Hard)
 */

(function () {
  'use strict';

  window.QuestionsProgFundamentals = [
    // --- EASY (1 to 6) ---
    {
      id: 'progfund_01',
      text: 'Which primitive data type is universally employed across programming languages to represent binary true or false values?',
      options: ['Integer', 'Boolean', 'String', 'Float'],
      correct: 1,
      explanation: 'A Boolean data type has only two possible values: true and false, named after mathematician George Boole.',
      difficulty: 'easy',
      hint: 'Named after the mathematician George Boole.'
    },
    {
      id: 'progfund_02',
      text: 'In Object-Oriented Programming (OOP), what construct serves as the blueprint or template from which individual objects are instantiated?',
      options: ['Function', 'Variable', 'Class', 'Interface'],
      correct: 2,
      explanation: 'A class is an extensible code template that defines initial values (state) and implementations of behavior (member functions) for objects.',
      difficulty: 'easy',
      hint: 'The archetype or schema from which objects are created using the "new" keyword.'
    },
    {
      id: 'progfund_03',
      text: 'Which symbol serves as the assignment operator across C, Java, Python, and JavaScript to assign a value to a variable?',
      options: ['==', '=', ':=', '==='],
      correct: 1,
      explanation: 'The single equals sign (=) is the standard assignment operator in most languages, whereas == and === are equality comparison operators.',
      difficulty: 'easy',
      hint: 'A single equals sign sets the value of the left variable to the right expression.'
    },
    {
      id: 'progfund_04',
      text: 'What defines a recursive function in computer programming?',
      options: ['A function that never returns a value', 'A function that calls itself during execution', 'A function with no arguments', 'A function that executes on multiple threads'],
      correct: 1,
      explanation: 'A recursive function is a function that solves a problem by calling a copy of itself with a smaller subproblem.',
      difficulty: 'easy',
      hint: 'Self-referential execution.'
    },
    {
      id: 'progfund_05',
      text: 'What is the key defining characteristic of a constant variable declared with "const" in modern languages?',
      options: ['It cannot be read', 'Its value cannot be reassigned after initialization', 'It only stores strings', 'It resides in disk memory'],
      correct: 1,
      explanation: 'Constants are immutable bindings; once initialized with a value, they cannot be reassigned or rebound.',
      difficulty: 'easy',
      hint: 'The value remains constant and cannot be overwritten.'
    },
    {
      id: 'progfund_06',
      text: 'In OOP, which foundational principle allows a newly created child class to acquire the properties and methods of an existing parent class?',
      options: ['Encapsulation', 'Polymorphism', 'Inheritance', 'Abstraction'],
      correct: 2,
      explanation: 'Inheritance enables a derived class to inherit state and behavior from a base class, promoting code reuse.',
      difficulty: 'easy',
      hint: 'Passing traits down from parent to child.'
    },

    // --- MEDIUM (7 to 14) ---
    {
      id: 'progfund_07',
      text: 'In functional and modern procedural programming, what is the term for a function that accepts one or more functions as parameters or returns a function as its output?',
      options: ['Callback function', 'Higher-Order Function', 'Lambda expression', 'Pure function'],
      correct: 1,
      explanation: 'A higher-order function (such as map, filter, or reduce) either accepts another function as an argument or returns a function.',
      difficulty: 'medium',
      hint: 'Operates at a higher level by manipulating other functions.'
    },
    {
      id: 'progfund_08',
      text: 'What is the numeric result of the integer floor division expression "17 // 4" in Python 3?',
      options: ['4.25', '4', '5', '1'],
      correct: 1,
      explanation: 'In Python, // performs floor division, rounding down to the nearest integer. 17 / 4 is 4.25, so 17 // 4 evaluates to 4.',
      difficulty: 'medium',
      hint: 'The integer quotient without the fractional remainder.'
    },
    {
      id: 'progfund_09',
      text: 'Which OOP principle bundles state data together with methods that manipulate that data, while hiding internal details behind a public interface?',
      options: ['Encapsulation', 'Inheritance', 'Dynamic Dispatch', 'Type Casting'],
      correct: 0,
      explanation: 'Encapsulation shields an object’s internal state from unauthorized external mutation, exposing only controlled accessors and mutators.',
      difficulty: 'medium',
      hint: 'Think of encapsulating data inside a protective capsule.'
    },
    {
      id: 'progfund_10',
      text: 'Why is a "base case" an absolute requirement in any recursive algorithm?',
      options: ['To speed up network requests', 'To terminate recursion and prevent an infinite call stack overflow', 'To declare variable types', 'To allocate heap memory'],
      correct: 1,
      explanation: 'Without a base case that returns a value without further recursive calls, a recursive function would call itself indefinitely until call stack memory is exhausted.',
      difficulty: 'medium',
      hint: 'The stopping condition for recursive unwinding.'
    },
    {
      id: 'progfund_11',
      text: 'What integer value results from evaluating the bitwise AND expression "12 & 9" in decimal?',
      options: ['8', '9', '12', '13'],
      correct: 0,
      explanation: 'In binary: 12 is 1100₂ and 9 is 1001₂. Bitwise AND: 1100 & 1001 = 1000₂. 1000₂ in decimal is 8.',
      difficulty: 'medium',
      hint: 'Convert 12 and 9 to 4-bit binary representations and apply bitwise AND.'
    },
    {
      id: 'progfund_12',
      text: 'Which OOP capability allows entities of different types to be accessed through a unified interface, executing subclass-specific logic at runtime?',
      options: ['Polymorphism', 'Serialization', 'Compilation', 'Static scoping'],
      correct: 0,
      explanation: 'Polymorphism (meaning "many forms") allows a single method signature to trigger different implementations depending on the concrete class of the object.',
      difficulty: 'medium',
      hint: 'Greek for "many shapes" or "many forms".'
    },
    {
      id: 'progfund_13',
      text: 'Which region of program memory is automatically organized as a Last-In, First-Out (LIFO) structure to manage local variables and nested function return addresses?',
      options: ['Heap memory', 'Call Stack', 'Data segment', 'BSS segment'],
      correct: 1,
      explanation: 'The call stack stores stack frames containing local variables, parameters, and return pointers for each active function invocation.',
      difficulty: 'medium',
      hint: 'Functions push stack frames onto this structure when called and pop them when returning.'
    },
    {
      id: 'progfund_14',
      text: 'What distinguishes "pass by value" from "pass by reference" when passing an argument into a function?',
      options: ['Pass by value only works on integers', 'Pass by value creates an independent duplicate; pass by reference passes the direct memory location', 'Pass by reference is slower in all cases', 'They are strictly identical in modern compilers'],
      correct: 1,
      explanation: 'Pass by value copies the variable’s data so modifications inside the function do not affect the caller; pass by reference operates on the caller’s original memory address.',
      difficulty: 'medium',
      hint: 'Copying the content versus pointing to the original memory address.'
    },

    // --- HARD (15 to 20) ---
    {
      id: 'progfund_15',
      text: 'In functional programming paradigms, what two strict properties define a "pure function"?',
      options: ['It uses global state and executes asynchronously', 'It returns identical outputs for identical inputs and produces zero side effects', 'It must be written in Haskell and compile to WebAssembly', 'It contains at least one recursive call and modifies its input argument'],
      correct: 1,
      explanation: 'A pure function is deterministic (f(x) always yields the same result) and causes no observable side effects (no mutation of external variables, I/O, etc.).',
      difficulty: 'hard',
      hint: 'Deterministic output and no side effects.'
    },
    {
      id: 'progfund_16',
      text: 'In languages supporting lexical scoping, what is a "closure"?',
      options: ['A function that terminates a program', 'The pairing of a function with its enclosing lexical scope and preserved outer variables', 'A destructor method that deallocates heap memory', 'A private class constructor'],
      correct: 1,
      explanation: 'A closure is the combination of a function bundled together with references to its surrounding state (lexical environment), allowing it to access outer variables even after the outer function has returned.',
      difficulty: 'hard',
      hint: 'It closes over free variables in its declaring environment.'
    },
    {
      id: 'progfund_17',
      text: 'What fatal runtime exception occurs when a program exhausts its allocated call stack memory due to excessive or unbounded recursive calls?',
      options: ['NullPointerException', 'Stack Overflow', 'Segmentation Fault', 'Arithmetic Overflow'],
      correct: 1,
      explanation: 'A StackOverflowError occurs when the execution call stack exceeds its configured memory limit, almost always caused by missing base cases in recursive algorithms.',
      difficulty: 'hard',
      hint: 'Named after the call stack running out of memory.'
    },
    {
      id: 'progfund_18',
      text: 'In C pointer arithmetic on a 64-bit architecture where sizeof(int) == 4 bytes, if pointer "int *ptr = (int *)1000", what memory address does "ptr + 2" evaluate to?',
      options: ['1002', '1004', '1008', '1016'],
      correct: 2,
      explanation: 'Pointer arithmetic increments in multiples of the underlying type size: address + (offset * sizeof(type)) = 1000 + (2 * 4) = 1008.',
      difficulty: 'hard',
      hint: 'Pointer math scales by the byte size of the data type (4 bytes for int).'
    },
    {
      id: 'progfund_19',
      text: 'In object-oriented software architecture, what does the "L" in the SOLID design principles stand for?',
      options: ['Linear Dependency Principle', 'Liskov Substitution Principle', 'Layered Abstraction Principle', 'Lazy Evaluation Principle'],
      correct: 1,
      explanation: 'The Liskov Substitution Principle, introduced by Barbara Liskov, states that objects of a superclass should be replaceable with objects of a subclass without breaking application correctness.',
      difficulty: 'hard',
      hint: 'Introduced by Turing Award laureate Barbara Liskov.'
    },
    {
      id: 'progfund_20',
      text: 'What compiler optimization technique allows a tail-recursive function to execute in constant O(1) stack space by reusing the current stack frame?',
      options: ['Loop Unrolling', 'Tail Call Elimination (TCO)', 'Dead Code Elimination', 'Inlining'],
      correct: 1,
      explanation: 'Tail Call Optimization (TCO) rewrites recursive calls in tail position (where the function call is the final action) into an iterative jump/loop, avoiding new stack frame allocation.',
      difficulty: 'hard',
      hint: 'Tail Call Optimization (TCO).'
    }
  ];
})();
