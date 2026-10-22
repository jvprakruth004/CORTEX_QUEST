// Cortex Quest - DBMS Questions
// window.QuestionsDBMS

window.QuestionsDBMS = [
  {
    id: 'dbms-1',
    text: 'Which ACID property ensures that a transaction is treated as a single unit — it either completes fully or rolls back entirely?',
    options: ['Isolation', 'Durability', 'Atomicity', 'Consistency'],
    correct: 2,
    explanation: 'Atomicity ensures that all operations within a transaction are treated as a single unit. If any part fails, the entire transaction is rolled back. ACID = Atomicity, Consistency, Isolation, Durability.',
    difficulty: 'easy',
    hint: 'It is the "all or nothing" property.'
  },
  {
    id: 'dbms-2',
    text: 'What does SQL stand for?',
    options: ['Structured Query Language', 'Simple Query Language', 'Sequential Query Language', 'Standard Query Logic'],
    correct: 0,
    explanation: 'SQL stands for Structured Query Language. It is the standard language for relational database management systems.',
    difficulty: 'easy',
    hint: 'The "S" stands for Structured.'
  },
  {
    id: 'dbms-3',
    text: 'Which normal form requires that every non-key attribute be fully functionally dependent on the primary key?',
    options: ['1NF', '2NF', '3NF', 'BCNF'],
    correct: 1,
    explanation: '2NF (Second Normal Form) eliminates partial dependencies, requiring every non-key attribute to be fully functionally dependent on the entire primary key, not just part of it.',
    difficulty: 'medium',
    hint: 'It eliminates partial dependencies.'
  },
  {
    id: 'dbms-4',
    text: 'In an ER diagram, a diamond shape represents:',
    options: ['Entity', 'Attribute', 'Relationship', 'Key'],
    correct: 2,
    explanation: 'In an Entity-Relationship diagram, diamond shapes represent relationships between entities. Rectangles represent entities, and ovals represent attributes.',
    difficulty: 'easy',
    hint: 'Rectangles are entities; diamonds are something else.'
  },
  {
    id: 'dbms-5',
    text: 'Which SQL command is used to remove all rows from a table without deleting the table structure?',
    options: ['DELETE', 'DROP', 'TRUNCATE', 'REMOVE'],
    correct: 2,
    explanation: 'TRUNCATE removes all rows from a table but keeps the table structure. DELETE can be conditional with WHERE. DROP removes the entire table including its structure.',
    difficulty: 'medium',
    hint: 'It is faster than DELETE and cannot be rolled back easily.'
  },
  {
    id: 'dbms-6',
    text: 'What type of join returns all records from the left table and matched records from the right table?',
    options: ['INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL JOIN'],
    correct: 1,
    explanation: 'LEFT JOIN (or LEFT OUTER JOIN) returns all records from the left table, and matched records from the right table. Unmatched rows from the right table get NULL values.',
    difficulty: 'easy',
    hint: 'Think about which table you want all records from.'
  },
  {
    id: 'dbms-7',
    text: 'Which normal form deals with multi-valued dependencies?',
    options: ['2NF', '3NF', 'BCNF', '4NF'],
    correct: 3,
    explanation: '4NF (Fourth Normal Form) deals with multi-valued dependencies. A table is in 4NF if it is in BCNF and has no multi-valued dependencies.',
    difficulty: 'hard',
    hint: 'It goes beyond BCNF.'
  },
  {
    id: 'dbms-8',
    text: 'What does the GROUP BY clause do in SQL?',
    options: ['Sorts the result set', 'Groups rows with the same values into summary rows', 'Filters rows after grouping', 'Joins two tables together'],
    correct: 1,
    explanation: 'GROUP BY groups rows that have the same values in specified columns into summary rows. It is often used with aggregate functions like COUNT, SUM, AVG, MAX, MIN.',
    difficulty: 'easy',
    hint: 'It is used with aggregate functions like COUNT and SUM.'
  },
  {
    id: 'dbms-9',
    text: 'Which clause is used to filter the results of a GROUP BY clause?',
    options: ['WHERE', 'HAVING', 'FILTER', 'SELECT'],
    correct: 1,
    explanation: 'HAVING is used to filter groups created by GROUP BY. WHERE filters individual rows before grouping, while HAVING filters groups after aggregation.',
    difficulty: 'medium',
    hint: 'WHERE works on rows; something else works on groups.'
  },
  {
    id: 'dbms-10',
    text: 'What is a foreign key?',
    options: ['A key used to encrypt data', 'A key in one table that references the primary key of another table', 'A key that uniquely identifies each row', 'A key from an external database'],
    correct: 1,
    explanation: 'A foreign key is a column (or set of columns) in one table that references the primary key of another table. It establishes referential integrity between the two tables.',
    difficulty: 'easy',
    hint: 'It creates a link between two tables.'
  },
  {
    id: 'dbms-11',
    text: 'Which of these is a DDL command in SQL?',
    options: ['SELECT', 'INSERT', 'CREATE', 'UPDATE'],
    correct: 2,
    explanation: 'CREATE is a DDL (Data Definition Language) command used to create database objects. SELECT, INSERT, UPDATE are DML (Data Manipulation Language) commands.',
    difficulty: 'medium',
    hint: 'DDL commands define the structure of the database.'
  },
  {
    id: 'dbms-12',
    text: 'A relation in 1NF must:',
    options: ['Have no partial dependencies', 'Have no transitive dependencies', 'Have only atomic values in each cell', 'Have a composite primary key'],
    correct: 2,
    explanation: '1NF (First Normal Form) requires that all attribute values are atomic (indivisible). There should be no repeating groups or arrays in any cell.',
    difficulty: 'medium',
    hint: 'It is the most basic normal form.'
  },
  {
    id: 'dbms-13',
    text: 'What is a transaction in a database?',
    options: ['A single SQL query', 'A sequence of operations treated as a single unit of work', 'A backup of the database', 'A stored procedure'],
    correct: 1,
    explanation: 'A transaction is a sequence of one or more database operations that are treated as a single logical unit of work. It either completes entirely (COMMIT) or not at all (ROLLBACK).',
    difficulty: 'easy',
    hint: 'It follows the all-or-nothing principle.'
  },
  {
    id: 'dbms-14',
    text: 'In BCNF (Boyce-Codd Normal Form), for every functional dependency X → Y:',
    options: ['X must be a super key', 'Y must be a prime attribute', 'X must be a foreign key', 'Y must not be a primary key'],
    correct: 0,
    explanation: 'In BCNF, for every non-trivial functional dependency X → Y, X must be a super key. BCNF is a stricter version of 3NF.',
    difficulty: 'hard',
    hint: 'The left-hand side of every dependency must be special.'
  },
  {
    id: 'dbms-15',
    text: 'What is the purpose of an index in a database?',
    options: ['To store backup data', 'To speed up data retrieval operations', 'To enforce data integrity', 'To encrypt sensitive columns'],
    correct: 1,
    explanation: 'An index speeds up data retrieval by creating a data structure that allows the database to find rows more quickly, similar to a book index. However, indexes slow down write operations.',
    difficulty: 'easy',
    hint: 'Think about what makes queries faster.'
  },
  {
    id: 'dbms-16',
    text: 'Which SQL aggregate function returns the number of rows?',
    options: ['SUM()', 'MAX()', 'COUNT()', 'AVG()'],
    correct: 2,
    explanation: 'COUNT() returns the number of rows that match a specified criterion. COUNT(*) counts all rows including NULLs, while COUNT(column) counts non-NULL values.',
    difficulty: 'easy',
    hint: 'It literally counts things.'
  },
  {
    id: 'dbms-17',
    text: 'What is deadlock in a database system?',
    options: ['A database crash', 'A situation where two transactions wait indefinitely for each other to release locks', 'A failed query', 'A corrupted index'],
    correct: 1,
    explanation: 'A deadlock occurs when two or more transactions are waiting for each other to release locks, creating a circular dependency where none can proceed. DBMSs typically detect and resolve deadlocks by aborting one transaction.',
    difficulty: 'medium',
    hint: 'It involves circular waiting between transactions.'
  },
  {
    id: 'dbms-18',
    text: 'Which SQL statement is used to grant privileges to a user?',
    options: ['ALLOW', 'GRANT', 'PERMIT', 'AUTHORIZE'],
    correct: 1,
    explanation: 'GRANT is the SQL DCL (Data Control Language) command used to give specific privileges (like SELECT, INSERT, UPDATE) to database users or roles.',
    difficulty: 'medium',
    hint: 'It is part of DCL (Data Control Language).'
  },
  {
    id: 'dbms-19',
    text: 'What is a view in SQL?',
    options: ['A physical table stored on disk', 'A virtual table based on a SELECT query', 'A type of index', 'A stored procedure'],
    correct: 1,
    explanation: 'A view is a virtual table based on the result of a SELECT query. It does not store data physically (in most cases) but provides a way to simplify complex queries and restrict data access.',
    difficulty: 'medium',
    hint: 'It is like a saved query that behaves like a table.'
  },
  {
    id: 'dbms-20',
    text: 'In SQL, the DISTINCT keyword is used to:',
    options: ['Sort results in descending order', 'Return only unique values', 'Filter NULL values', 'Create unique indexes'],
    correct: 1,
    explanation: 'DISTINCT eliminates duplicate rows from the result set. SELECT DISTINCT column FROM table returns only unique values for that column.',
    difficulty: 'easy',
    hint: 'It removes duplicates from query results.'
  }
];
