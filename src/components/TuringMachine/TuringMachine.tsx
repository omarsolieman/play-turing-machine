import { useState, useEffect, useCallback } from 'react';
import { 
  TuringMachineConfig, 
  ExecutionState, 
  TransitionRule, 
  TuringMachineExample,
  TuringMachineState
} from '@/types/turing-machine';
import { exampleMachines } from '@/data/example-machines';
import { soundManager } from '@/utils/sound-manager';
import { Tape } from './Tape';
import { Controls } from './Controls';
import { StateDisplay } from './StateDisplay';
import { TransitionEditor } from './TransitionEditor';
import { StateEditor } from './StateEditor';
import { VisualEditor } from './VisualEditor';
import { ExamplesPanel } from './ExamplesPanel';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Save, Upload } from 'lucide-react';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"

export const TuringMachine = () => {
  // Machine configuration
  const [config, setConfig] = useState<TuringMachineConfig>(exampleMachines[0].config);
  const [inputString, setInputString] = useState('101');
  
  // Execution state
  const [execution, setExecution] = useState<ExecutionState>({
    currentState: exampleMachines[0].config.initialState,
    headPosition: 0,
    tape: new Map<number, string>(),
    isRunning: false,
    isPaused: false,
    isFinished: false,
    isAccepted: false,
    steps: 0,
    speed: 500 // milliseconds
  });

  // UI state
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [executionTimer, setExecutionTimer] = useState<NodeJS.Timeout | null>(null);

  // Initialize tape with input string
  const initializeTape = useCallback((input: string) => {
    const newTape = new Map<number, string>();
    for (let i = 0; i < input.length; i++) {
      newTape.set(i, input[i]);
    }
    
    setExecution(prev => ({
      ...prev,
      tape: newTape,
      headPosition: 0,
      currentState: config.initialState,
      isRunning: false,
      isPaused: false,
      isFinished: false,
      isAccepted: false,
      steps: 0
    }));
  }, [config.initialState]);

  // Initialize on config or input change
  useEffect(() => {
    initializeTape(inputString);
  }, [initializeTape, inputString]);

  // Update sound manager
  useEffect(() => {
    soundManager.setEnabled(soundEnabled);
  }, [soundEnabled]);

  // Find applicable transition rule
  const findTransition = useCallback((state: string, symbol: string): TransitionRule | null => {
    return config.transitions.find(t => 
      t.currentState === state && t.readSymbol === symbol
    ) || null;
  }, [config.transitions]);

  // Execute single step
  const executeStep = useCallback(() => {
    setExecution(prev => {
      if (prev.isFinished) return prev;

      const currentSymbol = prev.tape.get(prev.headPosition) ?? config.blankSymbol;
      const transition = findTransition(prev.currentState, currentSymbol);

      if (!transition) {
        // No transition found - halt
        const currentStateObj = config.states.find(s => s.name === prev.currentState);
        const isAccepted = currentStateObj?.isAccept ?? false;
        
        if (soundEnabled) {
          if (isAccepted) {
            soundManager.playAccept();
          } else {
            soundManager.playReject();
          }
        }
        
        toast(isAccepted ? 'Input Accepted!' : 'Input Rejected!', {
          description: `Execution finished in ${prev.steps + 1} steps`,
        });

        return {
          ...prev,
          isRunning: false,
          isFinished: true,
          isAccepted,
          steps: prev.steps + 1
        };
      }

      // Execute transition
      const newTape = new Map(prev.tape);
      newTape.set(prev.headPosition, transition.writeSymbol);

      let newHeadPosition = prev.headPosition;
      if (transition.moveDirection === 'L') {
        newHeadPosition--;
      } else if (transition.moveDirection === 'R') {
        newHeadPosition++;
      }

      // Check if new state is accept/reject
      const newStateObj = config.states.find(s => s.name === transition.nextState);
      const isFinished = newStateObj?.isAccept || newStateObj?.isReject || false;
      const isAccepted = newStateObj?.isAccept || false;

      // Play sounds
      if (soundEnabled) {
        if (transition.writeSymbol !== currentSymbol) {
          soundManager.playTapeWrite();
        }
        if (transition.moveDirection !== 'S') {
          soundManager.playTapeMove();
        }
        if (transition.nextState !== prev.currentState) {
          soundManager.playStateChange();
        }
        if (isFinished) {
          setTimeout(() => {
            if (isAccepted) {
              soundManager.playAccept();
            } else {
              soundManager.playReject();
            }
          }, 200);
        }
      }

      if (isFinished) {
        toast(isAccepted ? 'Input Accepted!' : 'Input Rejected!', {
          description: `Execution finished in ${prev.steps + 1} steps`,
        });
      }

      return {
        ...prev,
        currentState: transition.nextState,
        headPosition: newHeadPosition,
        tape: newTape,
        isFinished,
        isAccepted,
        steps: prev.steps + 1,
        isRunning: !isFinished
      };
    });
  }, [config, findTransition, soundEnabled]);

  // Control functions
  const handlePlay = useCallback(() => {
    if (execution.isFinished) return;
    
    setExecution(prev => ({ ...prev, isRunning: true, isPaused: false }));
    
    if (soundEnabled) {
      soundManager.playStart();
    }

    const timer = setInterval(() => {
      executeStep();
    }, execution.speed);
    
    setExecutionTimer(timer);
  }, [execution.isFinished, execution.speed, executeStep, soundEnabled]);

  const handlePause = useCallback(() => {
    setExecution(prev => ({ ...prev, isRunning: false, isPaused: true }));
    
    if (executionTimer) {
      clearInterval(executionTimer);
      setExecutionTimer(null);
    }
    
    if (soundEnabled) {
      soundManager.playPause();
    }
  }, [executionTimer, soundEnabled]);

  const handleStep = useCallback(() => {
    if (!execution.isRunning && !execution.isFinished) {
      executeStep();
    }
  }, [execution.isRunning, execution.isFinished, executeStep]);

  const handleReset = useCallback(() => {
    if (executionTimer) {
      clearInterval(executionTimer);
      setExecutionTimer(null);
    }
    
    initializeTape(inputString);
    
    if (soundEnabled) {
      soundManager.playReset();
    }
    
    toast('Machine Reset', {
      description: 'Ready for execution'
    });
  }, [executionTimer, initializeTape, inputString, soundEnabled]);

  const handleSpeedChange = useCallback((speed: number) => {
    setExecution(prev => ({ ...prev, speed }));
    
    // If running, restart with new speed
    if (execution.isRunning && executionTimer) {
      clearInterval(executionTimer);
      const timer = setInterval(executeStep, speed);
      setExecutionTimer(timer);
    }
  }, [execution.isRunning, executionTimer, executeStep]);

  // Stop execution when finished
  useEffect(() => {
    if (execution.isFinished && executionTimer) {
      clearInterval(executionTimer);
      setExecutionTimer(null);
    }
  }, [execution.isFinished, executionTimer]);

  // Load example machine
  const handleLoadExample = useCallback((example: TuringMachineExample) => {
    setConfig(example.config);
    setInputString(example.sampleInputs[0] || '');
    
    toast(`Loaded: ${example.name}`, {
      description: example.description
    });
  }, []);

  // Load input string
  const handleLoadInput = useCallback((input: string) => {
    setInputString(input);
    toast('Input Loaded', {
      description: `Input: "${input}"`
    });
  }, []);

  // Handle transitions change
  const handleTransitionsChange = useCallback((transitions: TransitionRule[]) => {
    setConfig(prev => ({ ...prev, transitions }));
  }, []);

  // Handle config change from visual editor
  const handleConfigChange = useCallback((newConfig: TuringMachineConfig) => {
    setConfig(newConfig);
  }, []);

  // Handle states change
  const handleStatesChange = useCallback((states: TuringMachineState[], newInitialState?: string) => {
    setConfig(prev => ({
      ...prev,
      states,
      initialState: newInitialState || prev.initialState
    }));
  }, []);

  // Handle cell click to edit tape
  const handleCellClick = useCallback((position: number, currentSymbol: string) => {
    if (execution.isRunning) return;
    
    const newSymbol = prompt(`Edit cell at position ${position}:`, currentSymbol);
    if (newSymbol !== null) {
      setExecution(prev => {
        const newTape = new Map(prev.tape);
        if (newSymbol === '' || newSymbol === config.blankSymbol) {
          newTape.delete(position);
        } else {
          newTape.set(position, newSymbol);
        }
        return { ...prev, tape: newTape };
      });
    }
  }, [execution.isRunning, config.blankSymbol]);

  return (
    <div className="h-screen bg-background p-4 flex flex-col">
      {/* Header */}
      <div className="text-center mb-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-destructive bg-clip-text text-transparent mb-1">
          Turing Machine Simulator
        </h1>
        <p className="text-muted-foreground text-md">
          Visual computational theory in action - design, simulate, and explore Turing machines
        </p>
      </div>

      {/* Main Content */}
      <ResizablePanelGroup 
        direction="horizontal"
        className="flex-grow rounded-lg border"
      >
        <ResizablePanel defaultSize={50}>
          <div className="p-4 h-full overflow-y-auto space-y-4">
            {/* Input Controls */}
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-foreground mb-1">
                  Input String
                </label>
                <Input
                  value={inputString}
                  onChange={(e) => setInputString(e.target.value)}
                  placeholder="Enter input string..."
                  className="font-mono"
                  disabled={execution.isRunning}
                />
              </div>
              <Button 
                onClick={handleReset}
                variant="outline"
              >
                <Upload className="h-4 w-4 mr-2" />
                Apply Input
              </Button>
            </div>

            {/* Tape and Controls */}
            <Tape 
              tape={execution.tape}
              headPosition={execution.headPosition}
              blankSymbol={config.blankSymbol}
              onCellClick={handleCellClick}
              isWriting={execution.isRunning}
            />
            <Controls 
              isRunning={execution.isRunning}
              isPaused={execution.isPaused}
              isFinished={execution.isFinished}
              speed={execution.speed}
              soundEnabled={soundEnabled}
              steps={execution.steps}
              onPlay={handlePlay}
              onPause={handlePause}
              onStep={handleStep}
              onReset={handleReset}
              onSpeedChange={handleSpeedChange}
              onSoundToggle={() => setSoundEnabled(!soundEnabled)}
            />

            {/* Examples and State */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ExamplesPanel 
                onLoadExample={handleLoadExample}
                onLoadInput={handleLoadInput}
              />
              <StateDisplay 
                states={config.states}
                currentState={execution.currentState}
                isFinished={execution.isFinished}
                isAccepted={execution.isAccepted}
              />
            </div>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={50}>
          <Card className="h-full flex flex-col rounded-none border-0">
            <CardHeader>
              <CardTitle>Machine Editor</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col">
              <Tabs defaultValue="visual" className="flex-grow flex flex-col">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="states">States</TabsTrigger>
                  <TabsTrigger value="visual">Visual</TabsTrigger>
                  <TabsTrigger value="transitions">Transitions</TabsTrigger>
                </TabsList>
                <TabsContent value="states" className="mt-4 flex-grow">
                  <StateEditor 
                    states={config.states}
                    initialState={config.initialState}
                    onStatesChange={handleStatesChange}
                  />
                </TabsContent>
                <TabsContent value="visual" className="mt-4 flex-grow">
                  <VisualEditor 
                    config={config}
                    onConfigChange={handleConfigChange}
                  />
                </TabsContent>
                <TabsContent value="transitions" className="mt-4 flex-grow">
                  <TransitionEditor 
                    transitions={config.transitions}
                    states={config.states.map(s => s.name)}
                    alphabet={config.tapeAlphabet}
                    onTransitionsChange={handleTransitionsChange}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};