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
  const [visualStates, setVisualStates] = useState<VisualState[]>(() =>
    config.states.map((state, index) => ({
      id: state.name,
      x: 100 + (index % 4) * 150,
      y: 100 + Math.floor(index / 4) * 120,
      name: state.name,
      isAccept: state.isAccept,
      isReject: state.isReject,
    }))
  );
  
  const [visualTransitions, setVisualTransitions] = useState<VisualTransition[]>(() =>
    config.transitions.map((rule, index) => ({
      id: `${rule.currentState}-${rule.nextState}-${index}`,
      fromState: rule.currentState,
      toState: rule.nextState,
      rule,
    }))
  );

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
    updateConfig();
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

  const getTransitionPath = (fromState: string, toState: string, index: number = 0) => {
    const from = visualStates.find(s => s.id === fromState);
    const to = visualStates.find(s => s.id === toState);
    
    if (!from || !to) return '';
    
    if (fromState === toState) {
      // Self-loop
      const offset = 50 + index * 20;
      return `M ${from.x + 25} ${from.y} Q ${from.x + offset} ${from.y - offset} ${from.x + 25} ${from.y}`;
    }
    
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    const fromX = from.x + 25 + (dx / distance) * 25;
    const fromY = from.y + 25 + (dy / distance) * 25;
    const toX = to.x + 25 - (dx / distance) * 25;
    const toY = to.y + 25 - (dy / distance) * 25;
    
    const offset = index * 15;
    const midX = (fromX + toX) / 2 + offset;
    const midY = (fromY + toY) / 2 + offset;
    
    return `M ${fromX} ${fromY} Q ${midX} ${midY} ${toX} ${toY}`;
  };

  const getArrowMarker = (fromState: string, toState: string) => {
    const from = visualStates.find(s => s.id === fromState);
    const to = visualStates.find(s => s.id === toState);
    
    if (!from || !to) return { x: 0, y: 0, angle: 0 };
    
    if (fromState === toState) {
      return { x: from.x + 50, y: from.y, angle: 180 };
    }
    
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    
    const arrowX = to.x + 25 - (dx / distance) * 25;
    const arrowY = to.y + 25 - (dy / distance) * 25;
    
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
          {visualTransitions.map((transition, index) => {
            const path = getTransitionPath(transition.fromState, transition.toState, index);
            const arrow = getArrowMarker(transition.fromState, transition.toState);
            const midPath = path.split(' ');
            const midX = parseFloat(midPath[4]) || arrow.x;
            const midY = parseFloat(midPath[5]) || arrow.y;

            return (
              <g key={transition.id}>
                <path
                  d={path}
                  stroke="hsl(var(--tm-transition))"
                  strokeWidth="2"
                  fill="none"
                  markerEnd="url(#arrowhead)"
                  className="cursor-pointer hover:stroke-tm-transition-hover"
                  onClick={() => setSelectedTransition(transition.id)}
                />
                <text
                  x={midX}
                  y={midY - 5}
                  fill="hsl(var(--tm-text))"
                  fontSize="12"
                  textAnchor="middle"
                  className="pointer-events-none select-none"
                >
                  {`${transition.rule.readSymbol}/${transition.rule.writeSymbol},${transition.rule.moveDirection}`}
                </text>
              </g>
            );
          })}

          {/* States */}
          {visualStates.map((state) => (
            <g key={state.id}>
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