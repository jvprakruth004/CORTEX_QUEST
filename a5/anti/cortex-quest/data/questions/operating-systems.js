/**
 * Cortex Quest - Operating Systems Questions
 * Submodule: operating-systems | Module: computer-science
 * 20 questions (6 Easy, 8 Medium, 6 Hard)
 */

(function () {
  'use strict';

  window.QuestionsOperatingSystems = [
    // --- EASY (1 to 6) ---
    {
      id: 'os_01',
      text: 'What is the standard term for a program in active execution within an operating system, complete with its own program counter, stack, and registers?',
      options: ['Process', 'Thread', 'Daemon', 'Instruction'],
      correct: 0,
      explanation: 'A process is an instance of a computer program that is being executed by one or more threads, containing its own isolated memory address space.',
      difficulty: 'easy',
      hint: 'A program in execution.'
    },
    {
      id: 'os_02',
      text: 'Which central core component of an operating system maintains complete control over all system resources, memory allocation, and CPU execution modes?',
      options: ['Shell', 'Kernel', 'Compiler', 'File Manager'],
      correct: 1,
      explanation: 'The kernel is the foundational core of the OS that interfaces directly with underlying computer hardware and mediates system calls from user space.',
      difficulty: 'easy',
      hint: 'The lowest-level foundational core of the OS.'
    },
    {
      id: 'os_03',
      text: 'What is the primary architectural difference between a process and a thread?',
      options: ['Threads do not use CPU', 'Processes share address space while threads do not', 'Threads within the same process share address space and resources', 'A process can only execute on one core'],
      correct: 2,
      explanation: 'Processes have independent, isolated virtual memory spaces, whereas multiple threads belonging to the same process share heap memory, code, and open file descriptors.',
      difficulty: 'easy',
      hint: 'Threads are lightweight execution units that share their parent process’s memory.'
    },
    {
      id: 'os_04',
      text: 'Which non-preemptive CPU scheduling algorithm services tasks in the exact temporal order in which they enter the ready queue?',
      options: ['First-Come, First-Served (FCFS)', 'Shortest Job First (SJF)', 'Round Robin (RR)', 'Priority Scheduling'],
      correct: 0,
      explanation: 'First-Come, First-Served (FCFS) allocates CPU time to processes strictly according to arrival time in a FIFO queue.',
      difficulty: 'easy',
      hint: 'First-In, First-Out applied to CPU scheduling.'
    },
    {
      id: 'os_05',
      text: 'What term describes a state where two or more processes are permanently blocked because each holds a resource needed by another?',
      options: ['Livelock', 'Deadlock', 'Starvation', 'Thrashing'],
      correct: 1,
      explanation: 'A deadlock occurs when a set of concurrent processes are permanently halted because every process holds resources while waiting for other resources held by other processes.',
      difficulty: 'easy',
      hint: 'Mutual permanent gridlock.'
    },
    {
      id: 'os_06',
      text: 'In paged virtual memory architecture, what is a fixed-size contiguous block of physical RAM called?',
      options: ['Virtual Page', 'Page Frame', 'Segment', 'Sector'],
      correct: 1,
      explanation: 'Virtual memory is divided into fixed-size units called "pages", which map directly onto physical memory blocks of identical size called "page frames".',
      difficulty: 'easy',
      hint: 'A frame that holds a virtual memory page.'
    },

    // --- MEDIUM (7 to 14) ---
    {
      id: 'os_07',
      text: 'Which preemptive scheduling algorithm assigns each process a fixed slice of CPU execution time called a "quantum" or "time slice"?',
      options: ['Round Robin (RR)', 'Multilevel Queue', 'Shortest Remaining Time First', 'Lottery Scheduling'],
      correct: 0,
      explanation: 'Round Robin cycling through the ready queue gives each process up to one time quantum before preempting it and placing it at the tail of the queue.',
      difficulty: 'medium',
      hint: 'Cyclic round-table distribution of time slices.'
    },
    {
      id: 'os_08',
      text: 'Which four simultaneous conditions, identified by Edward Coffman Jr., are necessary and sufficient for a deadlock to arise?',
      options: ['Mutual Exclusion, Hold and Wait, No Preemption, Circular Wait', 'Mutual Exclusion, Preemption, Inversion, Starvation', 'Semaphores, Monitors, Mutexes, Locks', 'Paging, Segmentation, Swapping, Fragmentation'],
      correct: 0,
      explanation: 'The four Coffman conditions are: 1. Mutual Exclusion; 2. Hold and Wait; 3. No Preemption; 4. Circular Wait.',
      difficulty: 'medium',
      hint: 'The Coffman conditions: Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait.'
    },
    {
      id: 'os_09',
      text: 'What severe performance degradation state occurs when an OS spends drastically more time swapping virtual memory pages to and from disk than executing user instructions?',
      options: ['Deadlock', 'Thrashing', 'Starvation', 'Convoy Effect'],
      correct: 1,
      explanation: 'Thrashing occurs when the sum of working set sizes across active processes exceeds available physical RAM, resulting in constant page faults and disk I/O.',
      difficulty: 'medium',
      hint: 'Excessive page swapping causes the CPU to thrash.'
    },
    {
      id: 'os_10',
      text: 'Which dedicated processor hardware unit translates virtual memory addresses generated by the CPU into physical RAM addresses at runtime?',
      options: ['Arithmetic Logic Unit (ALU)', 'Memory Management Unit (MMU)', 'Direct Memory Access (DMA)', 'Control Unit (CU)'],
      correct: 1,
      explanation: 'The Memory Management Unit (MMU) is a computer hardware component that translates virtual addresses into physical addresses using page tables.',
      difficulty: 'medium',
      hint: 'Abbreviated as MMU.'
    },
    {
      id: 'os_11',
      text: 'What concurrency bug occurs when two or more threads access shared mutable data concurrently and the final outcome depends on the order of execution?',
      options: ['Deadlock', 'Race Condition', 'Context Switch', 'Memory Leak'],
      correct: 1,
      explanation: 'A race condition arises in concurrent systems when code segments read/write shared data without proper synchronization, making correctness dependent on thread scheduling.',
      difficulty: 'medium',
      hint: 'Threads "racing" to read and write shared data.'
    },
    {
      id: 'os_12',
      text: 'Which classic synchronization construct, introduced by Edsger Dijkstra, is an integer variable manipulated exclusively through atomic wait() [P] and signal() [V] operations?',
      options: ['Monitor', 'Semaphore', 'Condition Variable', 'Spinlock'],
      correct: 1,
      explanation: 'A semaphore is a protected variable whose value can only be altered by atomic operations P (wait) to decrement and V (signal) to increment.',
      difficulty: 'medium',
      hint: 'Named after railroad signaling flags.'
    },
    {
      id: 'os_13',
      text: 'In Unix-like file systems (e.g. ext4), which fundamental metadata structure stores file attributes, permissions, file size, and pointers to storage data blocks?',
      options: ['Superblock', 'Directory Entry', 'Inode (index node)', 'File Allocation Table (FAT)'],
      correct: 2,
      explanation: 'An inode (index node) stores all metadata about a file except for its human-readable filename and actual data content.',
      difficulty: 'medium',
      hint: 'Short for "index node".'
    },
    {
      id: 'os_14',
      text: 'What is the primary function of the Translation Lookaside Buffer (TLB) in CPU memory hardware?',
      options: ['To cache disk file blocks', 'To serve as a fast hardware cache for recent virtual-to-physical page table translations', 'To buffer audio data streams', 'To schedule hardware interrupts'],
      correct: 1,
      explanation: 'The TLB is an associative hardware cache inside the MMU that stores recent virtual-to-physical address mappings, avoiding multi-level page table lookups in RAM.',
      difficulty: 'medium',
      hint: 'A hardware lookup cache for page table mappings.'
    },

    // --- HARD (15 to 20) ---
    {
      id: 'os_15',
      text: 'Which famous deadlock avoidance algorithm, formulated by Edsger Dijkstra, tests for safe states before granting resource requests based on declared maximum claims?',
      options: ['Peterson’s Algorithm', "Banker's Algorithm", 'Lamport’s Bakery Algorithm', 'Dekker’s Algorithm'],
      correct: 1,
      explanation: "The Banker's Algorithm simulates resource allocation to verify that a safe sequence exists ensuring all processes can eventually complete without deadlock.",
      difficulty: 'hard',
      hint: 'Metaphor of a small-town banker managing limited cash reserves.'
    },
    {
      id: 'os_16',
      text: 'What is Belady’s Anomaly in operating systems page replacement theory?',
      options: ['LRU performs worse than Random replacement', 'Increasing the number of allocated page frames results in an INCREASE in page faults under FIFO', 'Page size being smaller than cache line size', 'Virtual address space exceeding physical RAM'],
      correct: 1,
      explanation: 'Belady’s Anomaly describes the counter-intuitive phenomenon where increasing page frames causes more page faults under First-In, First-Out (FIFO) replacement.',
      difficulty: 'hard',
      hint: 'More memory frames causing more page faults under FIFO.'
    },
    {
      id: 'os_17',
      text: 'What is the fundamental difference between internal fragmentation and external fragmentation in memory management?',
      options: ['Internal occurs in virtual memory; external occurs on disk', 'Internal fragmentation is wasted space within an allocated block; external fragmentation is unusable scattered free space outside allocated blocks', 'External occurs only in caches', 'They are synonymous terms'],
      correct: 1,
      explanation: 'Internal fragmentation arises when allocated partitions are larger than requested data; external fragmentation occurs when total free memory is sufficient but scattered in non-contiguous fragments.',
      difficulty: 'hard',
      hint: 'Inside an assigned partition versus scattered between partitions.'
    },
    {
      id: 'os_18',
      text: 'In concurrent process synchronization, what three formal conditions must any valid solution to the Critical Section Problem satisfy?',
      options: ['Atomicity, Consistency, Isolation', 'Mutual Exclusion, Progress, Bounded Waiting', 'Deadlock, Livelock, Starvation', 'Encapsulation, Preemption, Inversion'],
      correct: 1,
      explanation: 'Any correct critical section solution must ensure: 1. Mutual Exclusion (only one process inside); 2. Progress (selection of next entrant cannot be indefinitely postponed); 3. Bounded Waiting (finite bound on wait time).',
      difficulty: 'hard',
      hint: 'Mutual Exclusion, Progress, and Bounded Waiting.'
    },
    {
      id: 'os_19',
      text: 'In POSIX/Unix operating systems, which kernel system call spawns an exact duplicate child process that inherits the memory image of the parent?',
      options: ['exec()', 'fork()', 'clone()', 'spawn()'],
      correct: 1,
      explanation: 'The fork() system call creates a new child process with a duplicate address space (implemented efficiently using Copy-on-Write).',
      difficulty: 'hard',
      hint: 'Creates a split in the road like a dining fork.'
    },
    {
      id: 'os_20',
      text: 'In multi-core shared memory architectures, what is "false sharing"?',
      options: ['Two processes sharing the same file descriptor', 'Threads on different CPU cores modifying independent variables that reside within the same hardware cache line', 'A page table pointing to invalid RAM', 'Two threads acquiring the same mutex simultaneously'],
      correct: 1,
      explanation: 'False sharing occurs when independent variables accessed by separate cores reside on the same cache line (typically 64 bytes), triggering costly cache-coherency invalidations.',
      difficulty: 'hard',
      hint: 'Unintended cache line bouncing between CPU cores.'
    }
  ];
})();
