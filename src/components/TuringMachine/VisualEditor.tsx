import React, { useState, useRef, useCallback } from 'react';
import { TuringMachineConfig, TuringMachineState, TransitionRule } from '@/types/turing-machine';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Trash2, Edit, Plus } from 'lucide-react';

interface VisualState {
  id: string;
  x: number;
  y: number;
  name: string;
  isAccept?: boolean;
  isReject?: boolean;
}

interface VisualTransition {
  id: string;
  fromState: string;
  toState: string;
  rule: TransitionRule;
}

interface VisualEditorProps {
  config: TuringMachineConfig;
  onConfigChange: (config: TuringMachineConfig) => void;
}

export const VisualEditor: React.FC<VisualEditorProps> = ({ config, onConfigChange }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [visualStates, setVisualStates] = useState<VisualState[]>([]);
  const [visualTransitions, setVisualTransitions] = useState<VisualTransition[]>([]);

  // Initialize visual states and transitions from config
  React.useEffect(() => {
    const newVisualStates: VisualState[] = config.states.map((state, index) => ({
      id: state.name,
      x: 100 + (index % 4) * 150,
      y: 100 + Math.floor(index / 4) * 120,
      name: state.name,
      isAccept: state.isAccept,
      isReject: state.isReject,
    }));
    
    const newVisualTransitions: VisualTransition[] = config.transitions.map((rule, index) => ({
      id: `${rule.currentState}-${rule.nextState}-${index}`,
      fromState: rule.currentState,
      toState: rule.nextState,
      rule,
    }));

    setVisualStates(newVisualStates);
    setVisualTransitions(newVisualTransitions);
  }, [config.states, config.transitions]);

  const [draggedState, setDraggedState] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedTransition, setSelectedTransition] = useState<string | null>(null);
  const [isCreatingTransition, setIsCreatingTransition] = useState<string | null>(null);
  const [newStateName, setNewStateName] = useState('');
  const [editingTransition, setEditingTransition] = useState<TransitionRule | null>(null);

  const updateConfig = useCallback(() => {
    const newConfig: TuringMachineConfig = {
      ...config,
      states: visualStates.map(vs => ({
        name: vs.name,
        isAccept: vs.isAccept,
        isReject: vs.isReject,
      })),
      transitions: visualTransitions.map(vt => vt.rule),
    };
    onConfigChange(newConfig);
  }, [visualStates, visualTransitions, config, onConfigChange]);

  React.useEffect(() => {
    if (visualStates.length > 0 || visualTransitions.length > 0) {
      updateConfig();
    }
  }, [visualStates, visualTransitions]);

  const handleMouseDown = (stateId: string, event: React.MouseEvent) => {
    if (isCreatingTransition) {
      if (isCreatingTransition === stateId) {
        setIsCreatingTransition(null);
      } else {
        // Create transition
        const newRule: TransitionRule = {
          currentState: isCreatingTransition,
          readSymbol: '',
          writeSymbol: '',
          moveDirection: 'R',
          nextState: stateId,
        };
        setEditingTransition(newRule);
        setIsCreatingTransition(null);
      }
      return;
    }

    const rect = svgRef.current?.getBoundingClientRect();
    if (rect) {
      const state = visualStates.find(s => s.id === stateId);
      if (state) {
        setDragOffset({
          x: event.clientX - rect.left - state.x,
          y: event.clientY - rect.top - state.y,
        });
        setDraggedState(stateId);
      }
    }
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (draggedState) {
      const rect = svgRef.current?.getBoundingClientRect();
      if (rect) {
        const newX = event.clientX - rect.left - dragOffset.x;
        const newY = event.clientY - rect.top - dragOffset.y;
        
        setVisualStates(prev =>
          prev.map(state =>
            state.id === draggedState
              ? { ...state, x: Math.max(30, Math.min(770, newX)), y: Math.max(30, Math.min(470, newY)) }
              : state
          )
        );
      }
    }
  };

  const handleMouseUp = () => {
    setDraggedState(null);
  };

  const addState = () => {
    if (!newStateName.trim()) return;
    
    const newState: VisualState = {
      id: newStateName,
      name: newStateName,
      x: 200,
      y: 200,
    };
    
    setVisualStates(prev => [...prev, newState]);
    setNewStateName('');
  };

  const deleteState = (stateId: string) => {
    setVisualStates(prev => prev.filter(s => s.id !== stateId));
    setVisualTransitions(prev => prev.filter(t => t.fromState !== stateId && t.toState !== stateId));
  };

  const toggleStateType = (stateId: string, type: 'accept' | 'reject') => {
    setVisualStates(prev =>
      prev.map(state =>
        state.id === stateId
          ? {
              ...state,
              isAccept: type === 'accept' ? !state.isAccept : false,
              isReject: type === 'reject' ? !state.isReject : false,
            }
          : state
      )
    );
  };

  const addTransition = () => {
    if (!editingTransition) return;
    
    const newTransition: VisualTransition = {
      id: `${editingTransition.currentState}-${editingTransition.nextState}-${Date.now()}`,
      fromState: editingTransition.currentState,
      toState: editingTransition.nextState,
      rule: editingTransition,
    };
    
    setVisualTransitions(prev => [...prev, newTransition]);
    setEditingTransition(null);
  };

  const getTransitionsFromSamePair = (fromState: string, toState: string) => {
    return visualTransitions.filter(t => 
      t.fromState === fromState && t.toState === toState
    );
  };

  const getTransitionPath = (fromState: string, toState: string, transitionIndex: number = 0) => {
    const from = visualStates.find(s => s.id === fromState);
    const to = visualStates.find(s => s.id === toState);
    
    if (!from || !to) return '';
    
    const stateRadius = 25;
    
    if (fromState === toState) {
      // Self-loop with better positioning
      const loopRadius = 35 + transitionIndex * 15;
      const angle = (transitionIndex * 60) % 360; // Distribute loops around the state
      const angleRad = (angle * Math.PI) / 180;
      
      const startX = from.x + stateRadius + Math.cos(angleRad) * stateRadius;
      const startY = from.y + stateRadius + Math.sin(angleRad) * stateRadius;
      
      const controlX1 = startX + Math.cos(angleRad) * loopRadius;
      const controlY1 = startY + Math.sin(angleRad) * loopRadius;
      const controlX2 = startX + Math.cos(angleRad + Math.PI/2) * loopRadius;
      const controlY2 = startY + Math.sin(angleRad + Math.PI/2) * loopRadius;
      
      const endX = from.x + stateRadius + Math.cos(angleRad + Math.PI/3) * stateRadius;
      const endY = from.y + stateRadius + Math.sin(angleRad + Math.PI/3) * stateRadius;
      
      return `M ${startX} ${startY} C ${controlX1} ${controlY1} ${controlX2} ${controlY2} ${endX} ${endY}`;
    }
    
    // Regular transitions between different states
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance === 0) return '';
    
    // Calculate connection points on circle edges
    const fromX = from.x + stateRadius + (dx / distance) * stateRadius;
    const fromY = from.y + stateRadius + (dy / distance) * stateRadius;
    const toX = to.x + stateRadius - (dx / distance) * stateRadius;
    const toY = to.y + stateRadius - (dy / distance) * stateRadius;
    
    // Handle multiple transitions between same states with curve offset
    const sameTransitions = getTransitionsFromSamePair(fromState, toState);
    const totalTransitions = sameTransitions.length;
    
    if (totalTransitions === 1) {
      // Single transition - straight line
      return `M ${fromX} ${fromY} L ${toX} ${toY}`;
    }
    
    // Multiple transitions - create curves
    const curveOffset = 50;
    const offsetStep = curveOffset / Math.max(1, totalTransitions - 1);
    const currentOffset = (transitionIndex - (totalTransitions - 1) / 2) * offsetStep;
    
    // Calculate perpendicular offset for curve
    const perpX = -dy / distance;
    const perpY = dx / distance;
    
    const controlX = (fromX + toX) / 2 + perpX * currentOffset;
    const controlY = (fromY + toY) / 2 + perpY * currentOffset;
    
    return `M ${fromX} ${fromY} Q ${controlX} ${controlY} ${toX} ${toY}`;
  };

  const getArrowMarker = (fromState: string, toState: string, transitionIndex: number = 0) => {
    const from = visualStates.find(s => s.id === fromState);
    const to = visualStates.find(s => s.id === toState);
    
    if (!from || !to) return { x: 0, y: 0, angle: 0 };
    
    const stateRadius = 25;
    
    if (fromState === toState) {
      // Self-loop arrow positioning
      const angle = (transitionIndex * 60) % 360;
      const angleRad = (angle * Math.PI) / 180;
      const arrowX = from.x + stateRadius + Math.cos(angleRad + Math.PI/3) * stateRadius;
      const arrowY = from.y + stateRadius + Math.sin(angleRad + Math.PI/3) * stateRadius;
      return { x: arrowX, y: arrowY, angle: angle + 60 };
    }
    
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance === 0) return { x: 0, y: 0, angle: 0 };
    
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    const arrowX = to.x + stateRadius - (dx / distance) * stateRadius;
    const arrowY = to.y + stateRadius - (dy / distance) * stateRadius;
    
    return { x: arrowX, y: arrowY, angle };
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center">
        <div className="flex gap-2 items-center">
          <Input
            placeholder="State name"
            value={newStateName}
            onChange={(e) => setNewStateName(e.target.value)}
            className="w-32"
          />
          <Button onClick={addState} size="sm">
            <Plus className="h-4 w-4" />
            Add State
          </Button>
        </div>
        
        <Button
          variant={isCreatingTransition ? "destructive" : "secondary"}
          onClick={() => setIsCreatingTransition(isCreatingTransition ? null : 'select')}
          size="sm"
        >
          {isCreatingTransition ? 'Cancel' : 'Add Transition'}
        </Button>
      </div>

      <Card className="p-4">
        <svg
          ref={svgRef}
          width="800"
          height="500"
          className="border border-tm-border bg-tm-canvas"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
              fill="hsl(var(--tm-transition))"
            >
              <polygon points="0 0, 10 3.5, 0 7" />
            </marker>
          </defs>

          {/* Transitions */}
          {visualTransitions.map((transition, globalIndex) => {
            // Find transitions between the same states to handle multiple transitions
            const sameTransitions = getTransitionsFromSamePair(transition.fromState, transition.toState);
            const transitionIndex = sameTransitions.findIndex(t => t.id === transition.id);
            
            const path = getTransitionPath(transition.fromState, transition.toState, transitionIndex);
            const arrow = getArrowMarker(transition.fromState, transition.toState, transitionIndex);
            
            // Calculate label position based on path type
            let labelX, labelY;
            if (transition.fromState === transition.toState) {
              // Self-loop label positioning
              const from = visualStates.find(s => s.id === transition.fromState);
              if (from) {
                const angle = (transitionIndex * 60) % 360;
                const angleRad = (angle * Math.PI) / 180;
                const labelRadius = 60 + transitionIndex * 15;
                labelX = from.x + 25 + Math.cos(angleRad) * labelRadius;
                labelY = from.y + 25 + Math.sin(angleRad) * labelRadius;
              } else {
                labelX = arrow.x;
                labelY = arrow.y;
              }
            } else {
              // Regular transition label positioning
              const pathCommands = path.split(' ');
              if (pathCommands[0] === 'M' && pathCommands[3] === 'Q') {
                // Curved path
                labelX = parseFloat(pathCommands[4]);
                labelY = parseFloat(pathCommands[5]) - 8;
              } else if (pathCommands[0] === 'M' && pathCommands[3] === 'L') {
                // Straight path
                const startX = parseFloat(pathCommands[1]);
                const startY = parseFloat(pathCommands[2]);
                const endX = parseFloat(pathCommands[4]);
                const endY = parseFloat(pathCommands[5]);
                labelX = (startX + endX) / 2;
                labelY = (startY + endY) / 2 - 8;
              } else {
                labelX = arrow.x;
                labelY = arrow.y - 8;
              }
            }

            return (
              <g key={transition.id}>
                <path
                  d={path}
                  stroke="hsl(var(--tm-transition))"
                  strokeWidth="2"
                  fill="none"
                  markerEnd="url(#arrowhead)"
                  className="cursor-pointer hover:stroke-tm-transition-hover transition-colors"
                  onClick={() => setSelectedTransition(transition.id)}
                />
                <rect
                  x={labelX - 20}
                  y={labelY - 8}
                  width="40"
                  height="16"
                  fill="hsl(var(--tm-canvas))"
                  stroke="hsl(var(--tm-border))"
                  strokeWidth="1"
                  rx="3"
                  className="pointer-events-none"
                />
                <text
                  x={labelX}
                  y={labelY + 3}
                  fill="hsl(var(--tm-text))"
                  fontSize="10"
                  textAnchor="middle"
                  className="pointer-events-none select-none font-mono"
                >
                  {`${transition.rule.readSymbol || '∅'}/${transition.rule.writeSymbol || '∅'},${transition.rule.moveDirection}`}
                </text>
              </g>
            );
          })}

          {/* States */}
          {visualStates.map((state) => (
            <g key={state.id}>
              {/* Shadow for depth */}
              <circle
                cx={state.x + 27}
                cy={state.y + 27}
                r="25"
                fill="rgba(0,0,0,0.1)"
                className="pointer-events-none"
              />
              
              {/* Main state circle */}
              <circle
                cx={state.x + 25}
                cy={state.y + 25}
                r="25"
                fill={
                  state.isAccept
                    ? "hsl(var(--tm-accept))"
                    : state.isReject
                    ? "hsl(var(--tm-reject))"
                    : "hsl(var(--tm-state))"
                }
                stroke={selectedState === state.id ? "hsl(var(--tm-head))" : "hsl(var(--tm-border))"}
                strokeWidth={selectedState === state.id ? "3" : "2"}
                className="cursor-pointer hover:brightness-110 transition-all"
                onMouseDown={(e) => handleMouseDown(state.id, e)}
                onClick={() => setSelectedState(selectedState === state.id ? null : state.id)}
              />
              
              {/* Double circle for accept states */}
              {state.isAccept && (
                <circle
                  cx={state.x + 25}
                  cy={state.y + 25}
                  r="20"
                  fill="none"
                  stroke="hsl(var(--tm-background))"
                  strokeWidth="2"
                  className="pointer-events-none"
                />
              )}
              
              {/* X mark for reject states */}
              {state.isReject && (
                <g className="pointer-events-none">
                  <line
                    x1={state.x + 15}
                    y1={state.y + 15}
                    x2={state.x + 35}
                    y2={state.y + 35}
                    stroke="hsl(var(--tm-background))"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <line
                    x1={state.x + 35}
                    y1={state.y + 15}
                    x2={state.x + 15}
                    y2={state.y + 35}
                    stroke="hsl(var(--tm-background))"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </g>
              )}
              
              {/* State name */}
              <text
                x={state.x + 25}
                y={state.y + 30}
                fill="hsl(var(--tm-background))"
                fontSize="12"
                textAnchor="middle"
                className="pointer-events-none select-none font-medium"
              >
                {state.name}
              </text>
              
              {/* Initial state indicator */}
              {state.name === config.initialState && (
                <g className="pointer-events-none">
                  <path
                    d={`M ${state.x - 15} ${state.y + 25} L ${state.x} ${state.y + 25}`}
                    stroke="hsl(var(--tm-text))"
                    strokeWidth="2"
                    markerEnd="url(#arrowhead)"
                  />
                  <text
                    x={state.x - 25}
                    y={state.y + 20}
                    fill="hsl(var(--tm-text))"
                    fontSize="10"
                    textAnchor="middle"
                    className="select-none"
                  >
                    start
                  </text>
                </g>
              )}
            </g>
          ))}

          {/* Creation line */}
          {isCreatingTransition && isCreatingTransition !== 'select' && (
            <text
              x="400"
              y="30"
              fill="hsl(var(--tm-text))"
              fontSize="14"
              textAnchor="middle"
              className="animate-pulse"
            >
              Click another state to create transition
            </text>
          )}
        </svg>
      </Card>

      {/* State Controls */}
      {selectedState && (
        <Card className="p-4">
          <h3 className="font-semibold mb-3">State: {selectedState}</h3>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => toggleStateType(selectedState, 'accept')}
              className={visualStates.find(s => s.id === selectedState)?.isAccept ? 'bg-tm-accept' : ''}
            >
              Accept State
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => toggleStateType(selectedState, 'reject')}
              className={visualStates.find(s => s.id === selectedState)?.isReject ? 'bg-tm-reject' : ''}
            >
              Reject State
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsCreatingTransition(selectedState)}
              disabled={!!isCreatingTransition}
            >
              Add Transition From Here
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => deleteState(selectedState)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* Transition Editor */}
      {editingTransition && (
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Add Transition</h3>
          <div className="grid grid-cols-5 gap-4">
            <div>
              <Label>Read Symbol</Label>
              <Select
                value={editingTransition.readSymbol}
                onValueChange={(value) => setEditingTransition(prev => prev ? {...prev, readSymbol: value} : null)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {config.tapeAlphabet.map((symbol) => (
                    <SelectItem key={symbol} value={symbol}>
                      {symbol === ' ' ? '(blank)' : symbol}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Write Symbol</Label>
              <Select
                value={editingTransition.writeSymbol}
                onValueChange={(value) => setEditingTransition(prev => prev ? {...prev, writeSymbol: value} : null)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {config.tapeAlphabet.map((symbol) => (
                    <SelectItem key={symbol} value={symbol}>
                      {symbol === ' ' ? '(blank)' : symbol}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Direction</Label>
              <Select
                value={editingTransition.moveDirection}
                onValueChange={(value: 'L' | 'R' | 'S') => setEditingTransition(prev => prev ? {...prev, moveDirection: value} : null)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="L">Left</SelectItem>
                  <SelectItem value="R">Right</SelectItem>
                  <SelectItem value="S">Stay</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={addTransition} className="flex-1">
                Add
              </Button>
              <Button variant="outline" onClick={() => setEditingTransition(null)}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};