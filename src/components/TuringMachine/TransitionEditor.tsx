import { useState } from 'react';
import { TransitionRule } from '@/types/turing-machine';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Edit3 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TransitionEditorProps {
  transitions: TransitionRule[];
  states: string[];
  alphabet: string[];
  onTransitionsChange: (transitions: TransitionRule[]) => void;
}

export const TransitionEditor = ({ 
  transitions, 
  states, 
  alphabet, 
  onTransitionsChange 
}: TransitionEditorProps) => {
  const [newTransition, setNewTransition] = useState<Partial<TransitionRule>>({
    currentState: '',
    readSymbol: '',
    writeSymbol: '',
    moveDirection: 'R',
    nextState: ''
  });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const addTransition = () => {
    if (newTransition.currentState && newTransition.readSymbol !== undefined && 
        newTransition.writeSymbol !== undefined && newTransition.nextState &&
        newTransition.moveDirection) {
      const transition = newTransition as TransitionRule;
      
      if (editingIndex !== null) {
        const updated = [...transitions];
        updated[editingIndex] = transition;
        onTransitionsChange(updated);
        setEditingIndex(null);
      } else {
        onTransitionsChange([...transitions, transition]);
      }
      
      setNewTransition({
        currentState: '',
        readSymbol: '',
        writeSymbol: '',
        moveDirection: 'R',
        nextState: ''
      });
    }
  };

  const deleteTransition = (index: number) => {
    const updated = transitions.filter((_, i) => i !== index);
    onTransitionsChange(updated);
  };

  const editTransition = (index: number) => {
    setNewTransition(transitions[index]);
    setEditingIndex(index);
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setNewTransition({
      currentState: '',
      readSymbol: '',
      writeSymbol: '',
      moveDirection: 'R',
      nextState: ''
    });
  };

  return (
    <div className="bg-card rounded-lg border shadow-lg p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <div className="w-4 h-4 bg-gradient-to-r from-accent to-destructive rounded"></div>
          Transition Rules
        </h3>
        <p className="text-sm text-muted-foreground">
          {transitions.length} rule{transitions.length !== 1 ? 's' : ''} defined
        </p>
      </div>

      {/* Add/Edit Form */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-2 mb-4 p-4 bg-muted/30 rounded-lg">
        <Select 
          value={newTransition.currentState} 
          onValueChange={(value) => setNewTransition({...newTransition, currentState: value})}
        >
          <SelectTrigger>
            <SelectValue placeholder="From State" />
          </SelectTrigger>
          <SelectContent>
            {states.map(state => (
              <SelectItem key={state} value={state}>{state}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          placeholder="Read"
          value={newTransition.readSymbol || ''}
          onChange={(e) => setNewTransition({...newTransition, readSymbol: e.target.value})}
          className="font-mono"
        />

        <Input
          placeholder="Write" 
          value={newTransition.writeSymbol || ''}
          onChange={(e) => setNewTransition({...newTransition, writeSymbol: e.target.value})}
          className="font-mono"
        />

        <Select 
          value={newTransition.moveDirection} 
          onValueChange={(value) => setNewTransition({...newTransition, moveDirection: value as 'L' | 'R' | 'S'})}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="L">← Left</SelectItem>
            <SelectItem value="R">Right →</SelectItem>
            <SelectItem value="S">Stay</SelectItem>
          </SelectContent>
        </Select>

        <Select 
          value={newTransition.nextState} 
          onValueChange={(value) => setNewTransition({...newTransition, nextState: value})}
        >
          <SelectTrigger>
            <SelectValue placeholder="To State" />
          </SelectTrigger>
          <SelectContent>
            {states.map(state => (
              <SelectItem key={state} value={state}>{state}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Button 
            onClick={addTransition}
            className="flex-1"
            disabled={!newTransition.currentState || !newTransition.nextState || 
                     newTransition.readSymbol === undefined || newTransition.writeSymbol === undefined}
          >
            {editingIndex !== null ? (
              <>
                <Edit3 className="h-4 w-4 mr-1" />
                Update
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-1" />
                Add
              </>
            )}
          </Button>
          
          {editingIndex !== null && (
            <Button onClick={cancelEdit} variant="outline" size="sm">
              Cancel
            </Button>
          )}
        </div>
      </div>

      {/* Transitions List */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {transitions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Edit3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No transition rules defined</p>
            <p className="text-sm">Add rules to define machine behavior</p>
          </div>
        ) : (
          transitions.map((transition, index) => (
            <div
              key={index}
              className={cn(
                "flex items-center justify-between p-3 bg-muted/50 rounded border transition-colors",
                "hover:bg-muted/70"
              )}
            >
              <div className="flex items-center gap-4 font-mono text-sm">
                <span className="font-semibold text-primary">{transition.currentState}</span>
                <span>→</span>
                <span className="bg-tape-cell px-2 py-1 rounded border">{transition.readSymbol}</span>
                <span>/</span>
                <span className="bg-accent/20 px-2 py-1 rounded border">{transition.writeSymbol}</span>
                <span className="text-muted-foreground">
                  {transition.moveDirection === 'L' ? '←' : transition.moveDirection === 'R' ? '→' : '●'}
                </span>
                <span>→</span>
                <span className="font-semibold text-accent">{transition.nextState}</span>
              </div>
              
              <div className="flex gap-1">
                <Button
                  onClick={() => editTransition(index)}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <Edit3 className="h-3 w-3" />
                </Button>
                <Button
                  onClick={() => deleteTransition(index)}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};