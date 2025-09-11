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
    sampleInputs: ['101', '110', '111', '1010', 'abc']
  },
  {
    id: 'palindrome-checker',
    name: 'Palindrome Checker',
    description: 'Checks if a binary string is a palindrome',
    explanation: 'This machine checks if a string reads the same forwards and backwards. It marks the first symbol, scans to the end to check if the last symbol matches, then repeats for the remaining inner string until all symbols are verified.',
    category: 'String Processing',
    config: {
      name: 'Palindrome Checker',
      description: 'Accepts palindromic binary strings',
      states: [
        { name: 'q0' },
        { name: 'q1' },
        { name: 'q2' },
        { name: 'q3' },
        { name: 'q4' },
        { name: 'accept', isAccept: true },
        { name: 'reject', isReject: true }
      ],
      alphabet: ['0', '1', 'a', 'b'],
      tapeAlphabet: ['0', '1', 'a', 'b', '_', 'X'],
      initialState: 'q0',
      blankSymbol: '_',
      transitions: [
        { currentState: 'q0', readSymbol: '0', writeSymbol: 'X', moveDirection: 'R', nextState: 'q1' },
        { currentState: 'q0', readSymbol: '1', writeSymbol: 'X', moveDirection: 'R', nextState: 'q2' },
        { currentState: 'q0', readSymbol: '_', writeSymbol: '_', moveDirection: 'S', nextState: 'accept' },
        { currentState: 'q0', readSymbol: 'X', writeSymbol: 'X', moveDirection: 'R', nextState: 'q0' },
        
        { currentState: 'q1', readSymbol: '0', writeSymbol: '0', moveDirection: 'R', nextState: 'q1' },
        { currentState: 'q1', readSymbol: '1', writeSymbol: '1', moveDirection: 'R', nextState: 'q1' },
        { currentState: 'q1', readSymbol: '_', writeSymbol: '_', moveDirection: 'L', nextState: 'q3' },
        
        { currentState: 'q2', readSymbol: '0', writeSymbol: '0', moveDirection: 'R', nextState: 'q2' },
        { currentState: 'q2', readSymbol: '1', writeSymbol: '1', moveDirection: 'R', nextState: 'q2' },
        { currentState: 'q2', readSymbol: '_', writeSymbol: '_', moveDirection: 'L', nextState: 'q4' },
        
        { currentState: 'q3', readSymbol: '0', writeSymbol: 'X', moveDirection: 'L', nextState: 'q3' },
        { currentState: 'q3', readSymbol: '1', writeSymbol: '1', moveDirection: 'L', nextState: 'reject' },
        { currentState: 'q3', readSymbol: 'X', writeSymbol: 'X', moveDirection: 'R', nextState: 'q0' },
        
        { currentState: 'q4', readSymbol: '1', writeSymbol: 'X', moveDirection: 'L', nextState: 'q4' },
        { currentState: 'q4', readSymbol: '0', writeSymbol: '0', moveDirection: 'L', nextState: 'reject' },
        { currentState: 'q4', readSymbol: 'X', writeSymbol: 'X', moveDirection: 'R', nextState: 'q0' }
      ]
    },
    sampleInputs: ['101', '1001', '11011', '0110', '1', 'aba', 'abba']
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
    sampleInputs: ['1+1', '11+111', '1111+11']
  }
];