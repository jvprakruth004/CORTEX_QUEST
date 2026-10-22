/**
 * Cortex Quest - Arrays and Data Structures Questions
 * Submodule: arrays-ds | Module: programming
 * 20 questions (6 Easy, 8 Medium, 6 Hard)
 */

(function () {
  'use strict';

  window.QuestionsArraysDS = [
    // --- EASY (1 to 6) ---
    {
      id: 'ads_01',
      text: 'What is the time complexity to retrieve an element from a contiguous array using its zero-based index?',
      options: ['O(1)', 'O(log n)', 'O(n)', 'O(n^2)'],
      correct: 0,
      explanation: 'Arrays provide direct memory addressing using base address + (index * element_size), enabling constant time O(1) random access.',
      difficulty: 'easy',
      hint: 'Direct memory pointer offset math takes constant time.'
    },
    {
      id: 'ads_02',
      text: 'Which linear data structure enforces a Last-In, First-Out (LIFO) operational policy for insertions and deletions?',
      options: ['Queue', 'Stack', 'Array', 'Linked List'],
      correct: 1,
      explanation: 'A Stack operates strictly under LIFO: elements are pushed onto the top and popped from the top.',
      difficulty: 'easy',
      hint: 'Like a stack of dinner plates: the last plate placed on top is the first removed.'
    },
    {
      id: 'ads_03',
      text: 'Which data structure enforces a First-In, First-Out (FIFO) operational discipline?',
      options: ['Stack', 'Queue', 'Binary Heap', 'Hash Set'],
      correct: 1,
      explanation: 'A Queue enforces FIFO: elements enter at the rear (enqueue) and exit from the front (dequeue).',
      difficulty: 'easy',
      hint: 'Like a physical waiting line at a ticket counter.'
    },
    {
      id: 'ads_04',
      text: 'What is the time complexity of the Binary Search algorithm when searching an element in a sorted array of size n?',
      options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
      correct: 1,
      explanation: 'Binary search divides the search space in half at each iteration, resulting in a logarithmic runtime of O(log n).',
      difficulty: 'easy',
      hint: 'Halving the search interval at each step produces logarithmic time.'
    },
    {
      id: 'ads_05',
      text: 'What is the maximum number of child nodes that any single parent node can have in a Binary Tree?',
      options: ['1', '2', '3', 'Unlimited'],
      correct: 1,
      explanation: 'By mathematical definition, every node in a binary tree has at most two children, typically referred to as the left child and right child.',
      difficulty: 'easy',
      hint: 'The prefix "bi-" indicates two.'
    },
    {
      id: 'ads_06',
      text: 'In a standard singly linked list, what does the "next" reference of the terminal (tail) node point to?',
      options: ['The head node', 'Itself', 'null (or NULL)', 'Undefined memory'],
      correct: 2,
      explanation: 'The terminal node of a linear singly linked list references null (or NULL) to signal the end of the sequence.',
      difficulty: 'easy',
      hint: 'A sentinel null pointer marks the end of the list.'
    },

    // --- MEDIUM (7 to 14) ---
    {
      id: 'ads_07',
      text: 'What is the worst-case time complexity of QuickSort (e.g. when picking the smallest or largest element as pivot on an already sorted array without random selection)?',
      options: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(2^n)'],
      correct: 2,
      explanation: 'In the worst case, unbalanced partitioning produces subproblems of size n-1 and 0, leading to a recurrence of T(n) = T(n-1) + O(n), which solves to O(n²).',
      difficulty: 'medium',
      hint: 'A completely unbalanced recursion tree has depth n, leading to quadratic time.'
    },
    {
      id: 'ads_08',
      text: 'Which comparison sorting algorithm guarantees O(n log n) performance in both the average and worst case by recursively splitting arrays and merging sorted halves?',
      options: ['Bubble Sort', 'Insertion Sort', 'Merge Sort', 'Selection Sort'],
      correct: 2,
      explanation: 'Merge Sort always divides the array into two halves, sorts them recursively, and merges them in linear time: T(n) = 2T(n/2) + O(n) => O(n log n).',
      difficulty: 'medium',
      hint: 'Divide, conquer, and merge.'
    },
    {
      id: 'ads_09',
      text: 'Which tree traversal order visits the nodes of a valid Binary Search Tree (BST) in ascending, sorted numerical order?',
      options: ['Pre-order (Root, Left, Right)', 'In-order (Left, Root, Right)', 'Post-order (Left, Right, Root)', 'Level-order (Breadth-first)'],
      correct: 1,
      explanation: 'In-order traversal visits all nodes in the left subtree, then the current node, then all nodes in the right subtree, outputting sorted keys.',
      difficulty: 'medium',
      hint: 'Visiting Left -> Root -> Right yields the keys in sorted order.'
    },
    {
      id: 'ads_10',
      text: 'What is the average time complexity for key lookup, insertion, and deletion in a well-distributed Hash Table?',
      options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
      correct: 0,
      explanation: 'With a uniform hash function and low load factor, hash table operations achieve constant O(1) expected time.',
      difficulty: 'medium',
      hint: 'Hashing maps keys directly to bucket indices in constant expected time.'
    },
    {
      id: 'ads_11',
      text: 'What is the asymptotic height (maximum distance from root to leaf) of a balanced binary search tree containing n nodes?',
      options: ['O(1)', 'O(log n)', 'O(n)', 'O(n^2)'],
      correct: 1,
      explanation: 'A balanced binary tree maintains roughly equal subtrees, meaning height h satisfies 2^h ≈ n, giving h = O(log n).',
      difficulty: 'medium',
      hint: 'The height scales logarithmically with the number of nodes.'
    },
    {
      id: 'ads_12',
      text: 'Which fundamental auxiliary data structure is utilized to implement the Breadth-First Search (BFS) graph and tree traversal algorithm?',
      options: ['Stack', 'Queue', 'Priority Queue', 'Disjoint Set'],
      correct: 1,
      explanation: 'BFS explores vertices level-by-level in FIFO order, making a Queue the standard data structure for tracking discovered frontier nodes.',
      difficulty: 'medium',
      hint: 'Level-by-level exploration requires First-In, First-Out buffering.'
    },
    {
      id: 'ads_13',
      text: 'In a doubly linked list, how many directional pointers does each intermediate node contain?',
      options: ['One (next)', 'Two (previous and next)', 'Three (left, right, parent)', 'None'],
      correct: 1,
      explanation: 'Each node in a doubly linked list maintains two distinct pointers: one pointing forward to the next node and one pointing backward to the previous node.',
      difficulty: 'medium',
      hint: 'Bidirectional navigation requires two pointers per node.'
    },
    {
      id: 'ads_14',
      text: 'What is the primary architectural advantage of a linked list over a contiguous static array?',
      options: ['Faster O(1) random index access', 'Lower memory overhead per element', 'Dynamic sizing with O(1) node insertion/deletion at known references', 'Superior cache locality'],
      correct: 2,
      explanation: 'Linked lists grow dynamically without expensive memory reallocation and allow O(1) insertions/deletions once a node pointer is located.',
      difficulty: 'medium',
      hint: 'Nodes can be allocated non-contiguously on the fly.'
    },

    // --- HARD (15 to 20) ---
    {
      id: 'ads_15',
      text: 'Which self-balancing binary search tree strictly maintains a balance factor (height difference between left and right subtrees) of -1, 0, or +1 for every node?',
      options: ['Red-Black Tree', 'AVL Tree', 'B-Tree', 'Splay Tree'],
      correct: 1,
      explanation: 'An AVL tree (named after Adelson-Velsky and Landis) is a strictly balanced BST where the heights of the two child subtrees of any node differ by at most one.',
      difficulty: 'hard',
      hint: 'Named after inventors Adelson-Velsky and Landis.'
    },
    {
      id: 'ads_16',
      text: 'In a 1-based array implementation of a Binary Heap, if a parent node is situated at array index i, at which index is its left child located?',
      options: ['2 * i', '2 * i + 1', 'i / 2', 'i + 2'],
      correct: 0,
      explanation: 'In 1-based heap indexing, the left child of node i is at 2*i, and the right child is at 2*i + 1. (In 0-based indexing, left child is 2*i + 1).',
      difficulty: 'hard',
      hint: 'With 1-based indexing: left child is at 2*i, right child is at 2*i + 1.'
    },
    {
      id: 'ads_17',
      text: 'What is the worst-case space complexity of recursive Depth-First Search (DFS) on a severely skewed binary tree containing n nodes?',
      options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
      correct: 2,
      explanation: 'In a completely degenerate (skewed) tree resembling a linked list, recursive DFS creates a call stack depth of n frames, consuming O(n) memory.',
      difficulty: 'hard',
      hint: 'In a straight-line degenerate tree, the recursion stack depth reaches n.'
    },
    {
      id: 'ads_18',
      text: 'Which non-comparison sorting algorithm runs in O(n + k) linear time, where k represents the range of discrete non-negative integer values in the input?',
      options: ['Merge Sort', 'Heap Sort', 'Counting Sort', 'Shell Sort'],
      correct: 2,
      explanation: 'Counting Sort computes frequencies of each distinct key over range k and uses cumulative sums to place keys in O(n + k) time without element-to-element comparisons.',
      difficulty: 'hard',
      hint: 'Counts occurrences of each key value in an auxiliary tally array.'
    },
    {
      id: 'ads_19',
      text: 'In an array of capacity N implementing a Circular Queue with "front" and "rear" indices, what modular arithmetic condition denotes that the queue is completely full?',
      options: ['front == rear', '(rear + 1) % N == front', '(front + 1) % N == rear', 'rear == N - 1'],
      correct: 1,
      explanation: 'To disambiguate full vs empty states in a circular queue, one slot is reserved: the queue is full when the next position after rear wraps to front: (rear + 1) % N == front.',
      difficulty: 'hard',
      hint: 'The slot immediately ahead of rear wraps around to collide with front.'
    },
    {
      id: 'ads_20',
      text: 'What is the proven information-theoretic asymptotic lower bound for any comparison-based sorting algorithm to sort n elements in the worst case?',
      options: ['Ω(n)', 'Ω(n log n)', 'Ω(n^2)', 'Ω(log n)'],
      correct: 1,
      explanation: 'A comparison sort decision tree with n! leaves must have a minimum height of log2(n!) = Ω(n log n) comparisons by Stirling’s approximation.',
      difficulty: 'hard',
      hint: 'log2(n!) scales asymptotically as n log n.'
    }
  ];
})();
