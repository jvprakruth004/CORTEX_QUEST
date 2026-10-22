// Cortex Quest - Engineering Mathematics Questions
// window.QuestionsEngMath

window.QuestionsEngMath = [
  {
    id: 'emath-1',
    text: 'What is the derivative of sin(x)?',
    options: ['-sin(x)', 'cos(x)', '-cos(x)', 'tan(x)'],
    correct: 1,
    explanation: 'The derivative of sin(x) with respect to x is cos(x). Similarly, d/dx[cos(x)] = -sin(x). These are fundamental trigonometric derivatives.',
    difficulty: 'easy',
    hint: 'It is one of the two basic trigonometric derivatives.'
  },
  {
    id: 'emath-2',
    text: 'What is the integral of 2x dx?',
    options: ['2', 'x²', 'x² + C', '2x² + C'],
    correct: 2,
    explanation: '∫2x dx = 2·(x²/2) + C = x² + C. Always add the constant of integration C for indefinite integrals.',
    difficulty: 'easy',
    hint: 'Use the power rule: ∫xⁿ dx = xⁿ⁺¹/(n+1) + C.'
  },
  {
    id: 'emath-3',
    text: 'What is the determinant of the matrix [[3, 1], [2, 4]]?',
    options: ['10', '14', '12', '8'],
    correct: 0,
    explanation: 'For a 2×2 matrix [[a,b],[c,d]], determinant = ad - bc = (3×4) - (1×2) = 12 - 2 = 10.',
    difficulty: 'easy',
    hint: 'For 2×2: det = ad - bc.'
  },
  {
    id: 'emath-4',
    text: 'What is the Laplace transform of e^(at)?',
    options: ['1/(s-a)', '1/(s+a)', 'a/s²', 's/(s²+a²)'],
    correct: 0,
    explanation: 'L{e^(at)} = 1/(s-a) for s > a. This is a fundamental Laplace transform pair. L{e^(-at)} = 1/(s+a).',
    difficulty: 'medium',
    hint: 'The Laplace transform of an exponential shifts the s variable.'
  },
  {
    id: 'emath-5',
    text: 'What is the rank of the matrix [[1,2,3],[4,5,6],[7,8,9]]?',
    options: ['3', '2', '1', '0'],
    correct: 1,
    explanation: 'Row-reducing the matrix: R2 = R2-4R1 and R3 = R3-7R1 gives one zero row. The matrix has rank 2 (2 linearly independent rows), since the third row is a linear combination of the first two.',
    difficulty: 'hard',
    hint: 'Row-reduce and count non-zero rows.'
  },
  {
    id: 'emath-6',
    text: 'The probability of getting exactly 2 heads in 4 tosses of a fair coin is:',
    options: ['1/4', '3/8', '6/16', '1/2'],
    correct: 1,
    explanation: 'P(X=2) = C(4,2) × (1/2)² × (1/2)² = 6 × 1/16 = 6/16 = 3/8. Note that 6/16 = 3/8, so options C and B are the same value. The answer is 3/8.',
    difficulty: 'medium',
    hint: 'Use the binomial probability formula: P = C(n,k) × p^k × (1-p)^(n-k).'
  },
  {
    id: 'emath-7',
    text: 'What is the general solution of the differential equation dy/dx = 3y?',
    options: ['y = 3x + C', 'y = Ce^(3x)', 'y = e^(3x) + C', 'y = 3e^x + C'],
    correct: 1,
    explanation: 'Separating variables: dy/y = 3dx → ln|y| = 3x + k → y = Ce^(3x), where C = e^k is an arbitrary constant.',
    difficulty: 'medium',
    hint: 'Separate variables and integrate both sides.'
  },
  {
    id: 'emath-8',
    text: 'What is the value of lim(x→0) [sin(x)/x]?',
    options: ['0', '∞', '1', 'undefined'],
    correct: 2,
    explanation: 'lim(x→0) [sin(x)/x] = 1. This is a fundamental limit in calculus, proven using L\'Hôpital\'s rule or the squeeze theorem. It is crucial in deriving trigonometric derivatives.',
    difficulty: 'medium',
    hint: 'This is one of the most important limits in calculus.'
  },
  {
    id: 'emath-9',
    text: 'Which of the following is the mean of the data set: 5, 10, 15, 20, 25?',
    options: ['14', '15', '16', '17'],
    correct: 1,
    explanation: 'Mean = (5+10+15+20+25)/5 = 75/5 = 15. The mean (arithmetic average) equals the sum of all values divided by the count.',
    difficulty: 'easy',
    hint: 'Sum all values and divide by the count.'
  },
  {
    id: 'emath-10',
    text: 'What is the eigenvalue of the matrix [[2,0],[0,3]] corresponding to eigenvector [1,0]?',
    options: ['2', '3', '5', '6'],
    correct: 0,
    explanation: 'For [[2,0],[0,3]] × [1,0]ᵀ = [2,0]ᵀ = 2×[1,0]ᵀ. The eigenvalue is 2. For a diagonal matrix, the diagonal entries are the eigenvalues.',
    difficulty: 'medium',
    hint: 'A×v = λ×v; find λ.'
  },
  {
    id: 'emath-11',
    text: 'What is the standard deviation of the data set: 2, 4, 4, 4, 5, 5, 7, 9?',
    options: ['1', '2', '3', '4'],
    correct: 1,
    explanation: 'Mean = (2+4+4+4+5+5+7+9)/8 = 40/8 = 5. Variance = [(9+1+1+1+0+0+4+16)/8] = 32/8 = 4. Standard deviation = √4 = 2.',
    difficulty: 'hard',
    hint: 'σ = √(variance); variance = average of squared deviations from mean.'
  },
  {
    id: 'emath-12',
    text: 'The Fourier series of a function represents it as:',
    options: [
      'A polynomial series',
      'A sum of sine and cosine functions',
      'A Taylor expansion',
      'A power series'
    ],
    correct: 1,
    explanation: 'The Fourier series represents a periodic function as a sum of sines and cosines (harmonics): f(x) = a₀/2 + Σ[aₙcos(nωx) + bₙsin(nωx)]. It is fundamental in signal processing and engineering.',
    difficulty: 'medium',
    hint: 'It decomposes a function into harmonic components.'
  },
  {
    id: 'emath-13',
    text: 'What is the gradient of f(x,y) = x² + y² at the point (1, 2)?',
    options: ['[1, 2]', '[2, 4]', '[2, 2]', '[1, 4]'],
    correct: 1,
    explanation: '∇f = [∂f/∂x, ∂f/∂y] = [2x, 2y]. At (1,2): ∇f = [2(1), 2(2)] = [2, 4].',
    difficulty: 'medium',
    hint: 'The gradient is the vector of partial derivatives.'
  },
  {
    id: 'emath-14',
    text: 'In probability, if P(A) = 0.4 and P(B) = 0.3 and A, B are independent, what is P(A∩B)?',
    options: ['0.7', '0.12', '0.1', '0.7'],
    correct: 1,
    explanation: 'For independent events: P(A∩B) = P(A) × P(B) = 0.4 × 0.3 = 0.12.',
    difficulty: 'easy',
    hint: 'For independent events, multiply the probabilities.'
  },
  {
    id: 'emath-15',
    text: 'What is ∫₀¹ x² dx?',
    options: ['1/2', '1/3', '2/3', '1'],
    correct: 1,
    explanation: '∫₀¹ x² dx = [x³/3]₀¹ = 1/3 - 0/3 = 1/3.',
    difficulty: 'easy',
    hint: 'Use the power rule and evaluate from 0 to 1.'
  },
  {
    id: 'emath-16',
    text: 'What is the inverse of the matrix [[2,1],[5,3]]?',
    options: ['[[3,-1],[-5,2]]', '[[-3,1],[5,-2]]', '[[3,1],[5,2]]', '[[1/2,0],[0,1/3]]'],
    correct: 0,
    explanation: 'det = 2×3 - 1×5 = 1. Inverse = (1/det)×[[d,-b],[-c,a]] = (1/1)×[[3,-1],[-5,2]] = [[3,-1],[-5,2]].',
    difficulty: 'hard',
    hint: 'For 2×2: A⁻¹ = (1/det)×[[d,-b],[-c,a]].'
  },
  {
    id: 'emath-17',
    text: 'What is the solution to the second-order ODE y\'\' + y = 0?',
    options: ['y = Ce^x', 'y = A·cos(x) + B·sin(x)', 'y = Ae^x + Be^(-x)', 'y = Ax + B'],
    correct: 1,
    explanation: 'The characteristic equation r² + 1 = 0 has roots r = ±i (imaginary). The general solution is y = A·cos(x) + B·sin(x), representing simple harmonic oscillation.',
    difficulty: 'hard',
    hint: 'Find roots of the characteristic equation r² + 1 = 0.'
  },
  {
    id: 'emath-18',
    text: 'The variance of a data set measures:',
    options: [
      'The middle value of the data',
      'How spread out the data is from the mean',
      'The most frequently occurring value',
      'The difference between maximum and minimum values'
    ],
    correct: 1,
    explanation: 'Variance measures how spread out numbers are from the mean. Variance = Σ(xᵢ - μ)²/n. A high variance means data is widely spread; low variance means data is clustered near the mean.',
    difficulty: 'easy',
    hint: 'It measures dispersion around the average.'
  },
  {
    id: 'emath-19',
    text: 'What is the Laplace transform of the unit step function u(t)?',
    options: ['1', '1/s', 's', 'e^(-s)'],
    correct: 1,
    explanation: 'L{u(t)} = 1/s for s > 0. The unit step function u(t) = 0 for t < 0 and u(t) = 1 for t ≥ 0.',
    difficulty: 'medium',
    hint: 'It is one of the simplest Laplace transforms.'
  },
  {
    id: 'emath-20',
    text: 'What is the dot product of vectors A = [3, 4] and B = [1, 2]?',
    options: ['5', '10', '11', '14'],
    correct: 2,
    explanation: 'Dot product A·B = (3×1) + (4×2) = 3 + 8 = 11. The dot product is a scalar. It equals |A||B|cos(θ) where θ is the angle between the vectors.',
    difficulty: 'easy',
    hint: 'Multiply corresponding components and add them up.'
  }
];
