import React, { useState } from 'react';
import { TuringMachineState } from '@/types/turing-machine';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Trash2, Plus, Edit2 } from 'lucide-react';
import { toast } from 'sonner';

interface StateEditorProps {
  states: TuringMachineState[];
  initialState: string;
  onStatesChange: (states: TuringMachineState[], initialState?: string) => void;
}

export const StateEditor: React.FC<StateEditorProps> = ({ 
  states, 
  initialState, 
  onStatesChange 
}) => {
  const [newStateName, setNewStateName] = useState('');
  const [editingState, setEditingState] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const addState = () => {
    if (!newStateName.trim()) {
      toast.error('Please enter a state name');
      return;
    }

    if (states.some(s => s.name === newStateName.trim())) {
      toast.error('State already exists');
      return;
    }

    const newState: TuringMachineState = {
      name: newStateName.trim(),
      isAccept: false,
      isReject: false,
    };

    const newStates = [...states, newState];
    onStatesChange(newStates, initialState || newStateName.trim());
    setNewStateName('');
    toast.success(`State "${newState.name}" added`);
  };

  const deleteState = (stateName: string) => {
    if (states.length <= 1) {
      toast.error('Machine must have at least one state');
      return;
    }

    if (stateName === initialState) {
      toast.error('Cannot delete the initial state');
      return;
    }

    const newStates = states.filter(s => s.name !== stateName);
    onStatesChange(newStates);
    toast.success(`State "${stateName}" deleted`);
  };

  const startEdit = (state: TuringMachineState) => {
    setEditingState(state.name);
    setEditName(state.name);
  };

  const saveEdit = () => {
    if (!editName.trim() || !editingState) return;

    if (editName !== editingState && states.some(s => s.name === editName.trim())) {
      toast.error('State name already exists');
      return;
    }

    const newStates = states.map(s => 
      s.name === editingState 
        ? { ...s, name: editName.trim() }
        : s
    );
    
    const newInitialState = initialState === editingState ? editName.trim() : initialState;
    onStatesChange(newStates, newInitialState);
    setEditingState(null);
    setEditName('');
    toast.success('State updated');
  };

  const cancelEdit = () => {
    setEditingState(null);
    setEditName('');
  };

  const toggleStateType = (stateName: string, type: 'accept' | 'reject') => {
    const newStates = states.map(state => {
      if (state.name === stateName) {
        if (type === 'accept') {
          return {
            ...state,
            isAccept: !state.isAccept,
            isReject: false, // Can't be both accept and reject
          };
        } else {
          return {
            ...state,
            isReject: !state.isReject,
            isAccept: false, // Can't be both accept and reject
          };
        }
      }
      return state;
    });
    
    onStatesChange(newStates);
  };

  const setAsInitial = (stateName: string) => {
    onStatesChange(states, stateName);
    toast.success(`"${stateName}" set as initial state`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Edit2 className="h-5 w-5" />
          State Manager
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add New State */}
        <div className="flex gap-2">
          <Input
            placeholder="New state name"
            value={newStateName}
            onChange={(e) => setNewStateName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addState()}
            className="flex-1"
          />
          <Button onClick={addState} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>

        {/* States List */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">States ({states.length})</Label>
          
          {states.map((state) => (
            <div
              key={state.name}
              className="p-3 border border-tm-border rounded-lg bg-tm-canvas/50 space-y-2"
            >
              {editingState === state.name ? (
                <div className="flex gap-2">
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1"
                    autoFocus
                  />
                  <Button onClick={saveEdit} size="sm" variant="default">
                    Save
                  </Button>
                  <Button onClick={cancelEdit} size="sm" variant="outline">
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-medium">{state.name}</span>
                    {state.name === initialState && (
                      <Badge variant="secondary" className="text-xs">
                        Initial
                      </Badge>
                    )}
                    {state.isAccept && (
                      <Badge className="text-xs bg-tm-accept text-white">
                        Accept
                      </Badge>
                    )}
                    {state.isReject && (
                      <Badge className="text-xs bg-tm-reject text-white">
                        Reject
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Button
                      onClick={() => startEdit(state)}
                      size="sm"
                      variant="ghost"
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button
                      onClick={() => deleteState(state.name)}
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      disabled={states.length <= 1 || state.name === initialState}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}

              {editingState !== state.name && (
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={state.isAccept || false}
                      onCheckedChange={() => toggleStateType(state.name, 'accept')}
                    />
                    <span>Accept State</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={state.isReject || false}
                      onCheckedChange={() => toggleStateType(state.name, 'reject')}
                    />
                    <span>Reject State</span>
                  </div>

                  {state.name !== initialState && (
                    <Button
                      onClick={() => setAsInitial(state.name)}
                      size="sm"
                      variant="outline"
                      className="text-xs"
                    >
                      Set Initial
                    </Button>
                  )}
                </div>
              )}
            </div>
          ))}

          {states.length === 0 && (
            <p className="text-muted-foreground text-sm text-center py-4">
              No states defined. Add your first state above.
            </p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="pt-2 border-t border-tm-border">
          <Label className="text-sm font-medium mb-2 block">Quick Add</Label>
          <div className="flex gap-2">
            <Button
              onClick={() => {
                setNewStateName(`q${states.length}`);
                setTimeout(addState, 100);
              }}
              size="sm"
              variant="outline"
            >
              Add q{states.length}
            </Button>
            <Button
              onClick={() => {
                setNewStateName('accept');
                setTimeout(() => {
                  addState();
                  setTimeout(() => {
                    toggleStateType('accept', 'accept');
                  }, 100);
                }, 100);
              }}
              size="sm"
              variant="outline"
            >
              Add Accept State
            </Button>
            <Button
              onClick={() => {
                setNewStateName('reject');
                setTimeout(() => {
                  addState();
                  setTimeout(() => {
                    toggleStateType('reject', 'reject');
                  }, 100);
                }, 100);
              }}
              size="sm"
              variant="outline"
            >
              Add Reject State
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};