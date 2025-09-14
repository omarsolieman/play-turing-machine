import { useState, useEffect, useCallback } from 'react';
import { 
  TuringMachineConfig, 
  ExecutionState, 
  TransitionRule, 
  TuringMachineExample 
} from '@/types/turing-machine';
import { exampleMachines } from '@/data/example-machines';
import { soundManager } from '@/utils/sound-manager';
import { Tape } from './Tape';
import { Controls } from './Controls';
import { StateDisplay } from './StateDisplay';
import { TransitionEditor } from './TransitionEditor';
import { VisualEditor } from './VisualEditor';
import { ExamplesPanel } from './ExamplesPanel';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Save, Upload } from 'lucide-react';

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
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-destructive bg-clip-text text-transparent mb-2">
            Turing Machine Simulator
          </h1>
          <p className="text-muted-foreground text-lg">
            Visual computational theory in action - design, simulate, and explore Turing machines
          </p>
        </div>

        {/* Input Controls */}
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-foreground mb-2">
              Input String
            </label>
            <Input
              value={inputString}
              onChange={(e) => setInputString(e.target.value)}
              placeholder="Enter input string..."
              className="font-mono text-lg"
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

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column - Examples and States */}
          <div className="space-y-6">
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

          {/* Middle Column - Tape and Controls */}
          <div className="space-y-6">
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
          </div>

          {/* Right Column - Machine Editor */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Machine Editor</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="visual" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="visual">Visual Editor</TabsTrigger>
                    <TabsTrigger value="text">Text Editor</TabsTrigger>
                  </TabsList>
                  <TabsContent value="visual" className="mt-4">
                    <VisualEditor 
                      config={config}
                      onConfigChange={handleConfigChange}
                    />
                  </TabsContent>
                  <TabsContent value="text" className="mt-4">
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
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground">
            A complete Turing machine simulator with visual execution, sound effects, and example machines.
          </p>
        </div>
      </div>
    </div>
  );
};