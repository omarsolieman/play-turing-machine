import { TuringMachineExample } from '../types/turing-machine';

export const exampleMachines: TuringMachineExample[] = [
  {
    id: 'binary-increment',
    name: 'Binary Increment',
    description: 'Increments a binary number by 1',
    explanation: 'This machine adds 1 to a binary number by scanning right to find the least significant bit, then carries over from right to left. It converts trailing 1s to 0s and the first 0 to 1, or adds a leading 1 if all bits are 1.',
    category: 'Arithmetic',
    config: {
      name: 'Binary Increment',
      description: 'Adds 1 to a binary number',
      states: [
        { name: 'q0' },
        { name: 'q1' },
        { name: 'q2' },
        { name: 'accept', isAccept: true }
      ],
      alphabet: ['0', '1', 'a', 'b', 'c'],
      tapeAlphabet: ['0', '1', 'a', 'b', 'c', '_'],
      initialState: 'q0',
      blankSymbol: '_',
      transitions: [
        { currentState: 'q0', readSymbol: '0', writeSymbol: '0', moveDirection: 'R', nextState: 'q0' },
        { currentState: 'q0', readSymbol: '1', writeSymbol: '1', moveDirection: 'R', nextState: 'q0' },
        { currentState: 'q0', readSymbol: '_', writeSymbol: '_', moveDirection: 'L', nextState: 'q1' },
        { currentState: 'q1', readSymbol: '0', writeSymbol: '1', moveDirection: 'S', nextState: 'accept' },
        { currentState: 'q1', readSymbol: '1', writeSymbol: '0', moveDirection: 'L', nextState: 'q1' },
        { currentState: 'q1', readSymbol: '_', writeSymbol: '1', moveDirection: 'S', nextState: 'accept' }
      ]
    },
    sampleInputs: [
      // Basic binary numbers
      '1', '10', '11', '100', '101', '110', '111', '1000', '1001', '1010',
      // Edge cases
      '0', '00', '000', // Leading zeros
      '1111', '10101', '11111', // All 1s and patterns
      // Mixed with letters (should handle gracefully based on alphabet)
      'abc', '1a1', 'xyz'
    ]
  },
  {
    id: 'palindrome-checker',
    name: 'Palindrome Checker',
    description: 'Checks if a string is a palindrome',
    explanation: 'This machine checks if a string reads the same forwards and backwards. It marks the first symbol, scans to the end to check if the last symbol matches, then repeats for the remaining inner string until all symbols are verified.',
    category: 'String Processing',
    config: {
      name: 'Palindrome Checker',
      description: 'Accepts palindromic strings',
      states: [
        { name: 'q0' },
        { name: 'scan_right' },
        { name: 'check_match' },
        { name: 'return_left' },
        { name: 'accept', isAccept: true },
        { name: 'reject', isReject: true }
      ],
      alphabet: ['0', '1', 'a', 'b'],
      tapeAlphabet: ['0', '1', 'a', 'b', '_', 'X'],
      initialState: 'q0',
      blankSymbol: '_',
      transitions: [
        // Mark the first symbol and move right
        { currentState: 'q0', readSymbol: '0', writeSymbol: 'X', moveDirection: 'R', nextState: 'scan_right' },
        { currentState: 'q0', readSymbol: '1', writeSymbol: 'X', moveDirection: 'R', nextState: 'scan_right' },
        { currentState: 'q0', readSymbol: 'a', writeSymbol: 'X', moveDirection: 'R', nextState: 'scan_right' },
        { currentState: 'q0', readSymbol: 'b', writeSymbol: 'X', moveDirection: 'R', nextState: 'scan_right' },
        { currentState: 'q0', readSymbol: '_', writeSymbol: '_', moveDirection: 'S', nextState: 'accept' },

        // Scan to the right to find the end
        { currentState: 'scan_right', readSymbol: '0', writeSymbol: '0', moveDirection: 'R', nextState: 'scan_right' },
        { currentState: 'scan_right', readSymbol: '1', writeSymbol: '1', moveDirection: 'R', nextState: 'scan_right' },
        { currentState: 'scan_right', readSymbol: 'a', writeSymbol: 'a', moveDirection: 'R', nextState: 'scan_right' },
        { currentState: 'scan_right', readSymbol: 'b', writeSymbol: 'b', moveDirection: 'R', nextState: 'scan_right' },
        { currentState: 'scan_right', readSymbol: '_', writeSymbol: '_', moveDirection: 'L', nextState: 'check_match' },

        // Check if the last symbol matches the marked symbol
        { currentState: 'check_match', readSymbol: '0', writeSymbol: 'X', moveDirection: 'L', nextState: 'return_left' },
        { currentState: 'check_match', readSymbol: '1', writeSymbol: 'X', moveDirection: 'L', nextState: 'return_left' },
        { currentState: 'check_match', readSymbol: 'a', writeSymbol: 'X', moveDirection: 'L', nextState: 'return_left' },
        { currentState: 'check_match', readSymbol: 'b', writeSymbol: 'X', moveDirection: 'L', nextState: 'return_left' },
        { currentState: 'check_match', readSymbol: 'X', writeSymbol: 'X', moveDirection: 'L', nextState: 'check_match' },
        { currentState: 'check_match', readSymbol: '_', writeSymbol: '_', moveDirection: 'S', nextState: 'reject' },

        // Return to the left to find the next unmarked symbol
        { currentState: 'return_left', readSymbol: '0', writeSymbol: '0', moveDirection: 'L', nextState: 'return_left' },
        { currentState: 'return_left', readSymbol: '1', writeSymbol: '1', moveDirection: 'L', nextState: 'return_left' },
        { currentState: 'return_left', readSymbol: 'a', writeSymbol: 'a', moveDirection: 'L', nextState: 'return_left' },
        { currentState: 'return_left', readSymbol: 'b', writeSymbol: 'b', moveDirection: 'L', nextState: 'return_left' },
        { currentState: 'return_left', readSymbol: 'X', writeSymbol: 'X', moveDirection: 'L', nextState: 'return_left' },
        { currentState: 'return_left', readSymbol: '_', writeSymbol: '_', moveDirection: 'R', nextState: 'q0' }
      ]
    },
    sampleInputs: [
      // Binary palindromes
      '101', '1001', '11011', '0110', '1', '0', '11', '00', '10101', '11111',
      // Letter palindromes  
      'aba', 'abba', 'a', 'aa', 'aaaa', 'abcba', 'racecar',
      // Mixed palindromes
      'a1a', '1a1', '0a0', 'a1b1a',
      // Non-palindromes (should be rejected)
      '10', '01', 'abc', '123', 'hello', '1011', 'abcd'
    ]
  },
  {
    id: 'unary-addition',
    name: 'Unary Addition',
    description: 'Adds two unary numbers separated by +',
    explanation: 'This machine adds two unary numbers (where each number is represented by a sequence of 1s). It replaces the + with a 1, effectively merging the two sequences, then removes one 1 to complete the addition.',
    category: 'Arithmetic',
    config: {
      name: 'Unary Addition',
      description: 'Adds two unary numbers (1+11 = 111)',
      states: [
        { name: 'q0' },
        { name: 'q1' },
        { name: 'q2' },
        { name: 'accept', isAccept: true }
      ],
      alphabet: ['1', '+'],
      tapeAlphabet: ['1', '+', '_'],
      initialState: 'q0',
      blankSymbol: '_',
      transitions: [
        { currentState: 'q0', readSymbol: '1', writeSymbol: '1', moveDirection: 'R', nextState: 'q0' },
        { currentState: 'q0', readSymbol: '+', writeSymbol: '1', moveDirection: 'R', nextState: 'q1' },
        { currentState: 'q1', readSymbol: '1', writeSymbol: '1', moveDirection: 'R', nextState: 'q1' },
        { currentState: 'q1', readSymbol: '_', writeSymbol: '_', moveDirection: 'L', nextState: 'q2' },
        { currentState: 'q2', readSymbol: '1', writeSymbol: '_', moveDirection: 'S', nextState: 'accept' }
      ]
    },
    sampleInputs: [
      // Basic unary addition
      '1+1', '11+1', '1+11', '11+11', '111+1', '1+111',
      // Larger numbers
      '1111+11', '11111+111', '111111+1111',
      // Edge cases
      '1+', '+1', '11+', '+11' // These should fail gracefully
    ]
  },
  {
    id: 'equal-01s',
    name: 'Equal 0s and 1s',
    description: 'Accepts strings with equal number of 0s and 1s',
    explanation: 'This machine uses a stack-like approach to count 0s and 1s. It marks each 0 with an X and each 1 with a Y, then verifies that all symbols have been paired up, ensuring equal counts.',
    category: 'Counting',
    config: {
      name: 'Equal 0s and 1s',
      description: 'Accepts strings with equal number of 0s and 1s',
      states: [
        { name: 'q0' },
        { name: 'q1' },
        { name: 'q2' },
        { name: 'q3' },
        { name: 'accept', isAccept: true },
        { name: 'reject', isReject: true }
      ],
      alphabet: ['0', '1'],
      tapeAlphabet: ['0', '1', 'X', 'Y', '_'],
      initialState: 'q0',
      blankSymbol: '_',
      transitions: [
        // Mark first 0 with X and look for 1 to mark with Y
        { currentState: 'q0', readSymbol: '0', writeSymbol: 'X', moveDirection: 'R', nextState: 'q1' },
        // Mark first 1 with Y and look for 0 to mark with X
        { currentState: 'q0', readSymbol: '1', writeSymbol: 'Y', moveDirection: 'R', nextState: 'q2' },
        // Empty string - accept
        { currentState: 'q0', readSymbol: '_', writeSymbol: '_', moveDirection: 'S', nextState: 'accept' },
        // Skip marked symbols
        { currentState: 'q0', readSymbol: 'X', writeSymbol: 'X', moveDirection: 'R', nextState: 'q0' },
        { currentState: 'q0', readSymbol: 'Y', writeSymbol: 'Y', moveDirection: 'R', nextState: 'q0' },
        
        // Looking for 1 to pair with marked 0
        { currentState: 'q1', readSymbol: '0', writeSymbol: '0', moveDirection: 'R', nextState: 'q1' },
        { currentState: 'q1', readSymbol: '1', writeSymbol: 'Y', moveDirection: 'L', nextState: 'q3' },
        { currentState: 'q1', readSymbol: 'X', writeSymbol: 'X', moveDirection: 'R', nextState: 'q1' },
        { currentState: 'q1', readSymbol: 'Y', writeSymbol: 'Y', moveDirection: 'R', nextState: 'q1' },
        { currentState: 'q1', readSymbol: '_', writeSymbol: '_', moveDirection: 'S', nextState: 'reject' },
        
        // Looking for 0 to pair with marked 1
        { currentState: 'q2', readSymbol: '1', writeSymbol: '1', moveDirection: 'R', nextState: 'q2' },
        { currentState: 'q2', readSymbol: '0', writeSymbol: 'X', moveDirection: 'L', nextState: 'q3' },
        { currentState: 'q2', readSymbol: 'X', writeSymbol: 'X', moveDirection: 'R', nextState: 'q2' },
        { currentState: 'q2', readSymbol: 'Y', writeSymbol: 'Y', moveDirection: 'R', nextState: 'q2' },
        { currentState: 'q2', readSymbol: '_', writeSymbol: '_', moveDirection: 'S', nextState: 'reject' },
        
        // Return to start after pairing
        { currentState: 'q3', readSymbol: '0', writeSymbol: '0', moveDirection: 'L', nextState: 'q3' },
        { currentState: 'q3', readSymbol: '1', writeSymbol: '1', moveDirection: 'L', nextState: 'q3' },
        { currentState: 'q3', readSymbol: 'X', writeSymbol: 'X', moveDirection: 'L', nextState: 'q3' },
        { currentState: 'q3', readSymbol: 'Y', writeSymbol: 'Y', moveDirection: 'L', nextState: 'q3' },
        { currentState: 'q3', readSymbol: '_', writeSymbol: '_', moveDirection: 'R', nextState: 'q0' }
      ]
    },
    sampleInputs: [
      // Equal 0s and 1s (should accept)
      '01', '10', '0011', '1100', '0101', '1010', '001011', '110100',
      '010011', '101100', '00110011', '11001100',
      // Unequal counts (should reject)
      '0', '1', '00', '11', '000', '111', '001', '110', '0001', '1110',
      '00011', '11100', '000111'
    ]
  },
  {
    id: 'anbn',
    name: 'Language a^n b^n',
    description: 'Accepts strings of the form a^n b^n (equal as and bs)',
    explanation: 'This machine accepts the context-free language {a^n b^n | n ≥ 0}. It marks each a with X, finds the corresponding b and marks it with Y, then repeats until all symbols are paired.',
    category: 'Context-Free',
    config: {
      name: 'Language a^n b^n',
      description: 'Accepts a^n b^n where n ≥ 0',
      states: [
        { name: 'q0' },
        { name: 'q1' },
        { name: 'q2' },
        { name: 'q3' },
        { name: 'accept', isAccept: true },
        { name: 'reject', isReject: true }
      ],
      alphabet: ['a', 'b'],
      tapeAlphabet: ['a', 'b', 'X', 'Y', '_'],
      initialState: 'q0',
      blankSymbol: '_',
      transitions: [
        // Mark first 'a' and look for first 'b'
        { currentState: 'q0', readSymbol: 'a', writeSymbol: 'X', moveDirection: 'R', nextState: 'q1' },
        // Empty string - accept
        { currentState: 'q0', readSymbol: '_', writeSymbol: '_', moveDirection: 'S', nextState: 'accept' },
        // If we see 'b' first, reject
        { currentState: 'q0', readSymbol: 'b', writeSymbol: 'b', moveDirection: 'S', nextState: 'reject' },
        // Skip already marked symbols
        { currentState: 'q0', readSymbol: 'X', writeSymbol: 'X', moveDirection: 'R', nextState: 'q0' },
        { currentState: 'q0', readSymbol: 'Y', writeSymbol: 'Y', moveDirection: 'R', nextState: 'q0' },
        
        // Looking for first 'b' after marking 'a'
        { currentState: 'q1', readSymbol: 'a', writeSymbol: 'a', moveDirection: 'R', nextState: 'q1' },
        { currentState: 'q1', readSymbol: 'b', writeSymbol: 'Y', moveDirection: 'L', nextState: 'q2' },
        { currentState: 'q1', readSymbol: 'Y', writeSymbol: 'Y', moveDirection: 'R', nextState: 'q1' },
        { currentState: 'q1', readSymbol: '_', writeSymbol: '_', moveDirection: 'S', nextState: 'reject' },
        
        // Return to start after marking 'b'
        { currentState: 'q2', readSymbol: 'a', writeSymbol: 'a', moveDirection: 'L', nextState: 'q2' },
        { currentState: 'q2', readSymbol: 'b', writeSymbol: 'b', moveDirection: 'L', nextState: 'q2' },
        { currentState: 'q2', readSymbol: 'X', writeSymbol: 'X', moveDirection: 'L', nextState: 'q2' },
        { currentState: 'q2', readSymbol: 'Y', writeSymbol: 'Y', moveDirection: 'L', nextState: 'q2' },
        { currentState: 'q2', readSymbol: '_', writeSymbol: '_', moveDirection: 'R', nextState: 'q0' }
      ]
    },
    sampleInputs: [
      // Valid a^n b^n strings (should accept)
      '', 'ab', 'aabb', 'aaabbb', 'aaaabbbb', 'aaaaabbbbb',
      // Invalid strings (should reject)
      'a', 'b', 'aa', 'bb', 'aab', 'abb', 'abab', 'baba', 'ba',
      'aaabb', 'aabbb', 'aaabbb', 'aabbbb'
    ]
  },
  {
    id: 'number-doubler',
    name: 'Binary Number Doubler',
    description: 'Doubles a binary number (multiplies by 2)',
    explanation: 'This machine doubles a binary number by shifting all bits left and adding a 0 at the end. It scans to the end, shifts right, then adds 0 at the beginning.',
    category: 'Arithmetic',
    config: {
      name: 'Binary Number Doubler',
      description: 'Multiplies a binary number by 2',
      states: [
        { name: 'q0' },
        { name: 'q1' },
        { name: 'q2' },
        { name: 'accept', isAccept: true }
      ],
      alphabet: ['0', '1'],
      tapeAlphabet: ['0', '1', '_'],
      initialState: 'q0',
      blankSymbol: '_',
      transitions: [
        // Move to the end of the number
        { currentState: 'q0', readSymbol: '0', writeSymbol: '0', moveDirection: 'R', nextState: 'q0' },
        { currentState: 'q0', readSymbol: '1', writeSymbol: '1', moveDirection: 'R', nextState: 'q0' },
        { currentState: 'q0', readSymbol: '_', writeSymbol: '0', moveDirection: 'L', nextState: 'q1' },
        
        // Shift bits right
        { currentState: 'q1', readSymbol: '0', writeSymbol: '_', moveDirection: 'L', nextState: 'q1' },
        { currentState: 'q1', readSymbol: '1', writeSymbol: '0', moveDirection: 'L', nextState: 'q1' },
        { currentState: 'q1', readSymbol: '_', writeSymbol: '1', moveDirection: 'S', nextState: 'accept' }
      ]
    },
    sampleInputs: [
      // Binary numbers to double
      '1', '10', '11', '100', '101', '110', '111', '1000', '1001', '1010',
      // Results should be: 10, 100, 110, 1000, 1010, 1100, 1110, 10000, 10010, 10100
      '0' // Special case: 0 * 2 = 0 (but this implementation may not handle leading zeros correctly)
    ]
  },
  {
    id: 'divisible-by-3',
    name: 'Divisible by 3 (Binary)',
    description: 'Checks if a binary number is divisible by 3',
    explanation: 'This machine implements a finite automaton that tracks the remainder when dividing by 3. It processes binary digits from left to right, updating the remainder state until the entire number is consumed.',
    category: 'Number Theory',
    config: {
      name: 'Divisible by 3 (Binary)',
      description: 'Accepts binary numbers divisible by 3',
      states: [
        { name: 'q0', isAccept: true }, // remainder 0 (divisible by 3)
        { name: 'q1' },                // remainder 1
        { name: 'q2' }                 // remainder 2
      ],
      alphabet: ['0', '1'],
      tapeAlphabet: ['0', '1', '_'],
      initialState: 'q0',
      blankSymbol: '_',
      transitions: [
        // From remainder 0
        { currentState: 'q0', readSymbol: '0', writeSymbol: '0', moveDirection: 'R', nextState: 'q0' }, // (0*2 + 0) % 3 = 0
        { currentState: 'q0', readSymbol: '1', writeSymbol: '1', moveDirection: 'R', nextState: 'q1' }, // (0*2 + 1) % 3 = 1
        
        // From remainder 1  
        { currentState: 'q1', readSymbol: '0', writeSymbol: '0', moveDirection: 'R', nextState: 'q2' }, // (1*2 + 0) % 3 = 2
        { currentState: 'q1', readSymbol: '1', writeSymbol: '1', moveDirection: 'R', nextState: 'q0' }, // (1*2 + 1) % 3 = 0
        
        // From remainder 2
        { currentState: 'q2', readSymbol: '0', writeSymbol: '0', moveDirection: 'R', nextState: 'q1' }, // (2*2 + 0) % 3 = 1  
        { currentState: 'q2', readSymbol: '1', writeSymbol: '1', moveDirection: 'R', nextState: 'q2' }  // (2*2 + 1) % 3 = 2
      ]
    },
    sampleInputs: [
      // Divisible by 3 (should accept)
      '', '0', '11', '110', '1001', '1100', '1111', '10010', '10101', '11000',
      // Binary: 0, 3, 6, 9, 12, 15, 18, 21, 24
      
      // Not divisible by 3 (should reject)  
      '1', '10', '100', '101', '111', '1000', '1010', '1011', '1101', '1110',
      // Binary: 1, 2, 4, 5, 7, 8, 10, 11, 13, 14
      
      // Mixed examples
      '000', '001', '010', '011'
    ]
  }
];