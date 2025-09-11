export interface TransitionRule {
  currentState: string;
  readSymbol: string;
  writeSymbol: string;
  moveDirection: 'L' | 'R' | 'S'; // Left, Right, Stay
  nextState: string;
}

export interface TuringMachineState {
  name: string;
  isAccept?: boolean;
  isReject?: boolean;
}

export interface TuringMachineConfig {
  name: string;
  description: string;
  states: TuringMachineState[];
  alphabet: string[];
  tapeAlphabet: string[];
  initialState: string;
  blankSymbol: string;
  transitions: TransitionRule[];
}

export interface ExecutionState {
  currentState: string;
  headPosition: number;
  tape: Map<number, string>;
  isRunning: boolean;
  isPaused: boolean;
  isFinished: boolean;
  isAccepted: boolean;
  steps: number;
  speed: number; // milliseconds between steps
}

export interface TuringMachineExample {
  id: string;
  name: string;
  description: string;
  category: string;
  config: TuringMachineConfig;
  sampleInputs: string[];
}