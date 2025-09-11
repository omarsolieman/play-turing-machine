import { useState } from 'react';
import { TuringMachineExample } from '@/types/turing-machine';
import { exampleMachines } from '@/data/example-machines';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Play, Zap, Hash, Calculator, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExamplesPanelProps {
  onLoadExample: (example: TuringMachineExample) => void;
  onLoadInput: (input: string) => void;
}

export const ExamplesPanel = ({ onLoadExample, onLoadInput }: ExamplesPanelProps) => {
  const [selectedExample, setSelectedExample] = useState<string | null>(null);
  const [customInput, setCustomInput] = useState('');

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'arithmetic': return Calculator;
      case 'string processing': return FileText;
      default: return Hash;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'arithmetic': return 'bg-accent/20 text-accent border-accent/30';
      case 'string processing': return 'bg-primary/20 text-primary border-primary/30';
      default: return 'bg-muted text-muted-foreground border-muted';
    }
  };

  const handleLoadExample = (example: TuringMachineExample) => {
    setSelectedExample(example.id);
    onLoadExample(example);
  };

  const handleLoadInput = (input: string) => {
    setCustomInput(input);
    onLoadInput(input);
  };

  return (
    <div className="bg-card rounded-lg border shadow-lg p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <div className="w-4 h-4 bg-gradient-to-r from-accent via-primary to-destructive rounded"></div>
          Example Machines
        </h3>
        <p className="text-sm text-muted-foreground">
          Load predefined Turing machines or test with sample inputs
        </p>
      </div>

      {/* Custom Input */}
      <div className="mb-6 p-4 bg-muted/30 rounded-lg">
        <label className="block text-sm font-medium text-foreground mb-2">
          Custom Input
        </label>
        <div className="flex gap-2">
          <Input
            placeholder="Enter input string..."
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            className="font-mono"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleLoadInput(customInput);
              }
            }}
          />
          <Button 
            onClick={() => handleLoadInput(customInput)}
            disabled={!customInput.trim()}
          >
            <Play className="h-4 w-4 mr-1" />
            Load
          </Button>
        </div>
      </div>

      {/* Example Machines */}
      <div className="space-y-4">
        {exampleMachines.map((example) => {
          const isSelected = selectedExample === example.id;
          const CategoryIcon = getCategoryIcon(example.category);

          return (
            <Card 
              key={example.id} 
              className={cn(
                "p-4 cursor-pointer transition-all duration-200 hover:shadow-lg",
                isSelected 
                  ? "border-primary bg-primary/5 shadow-md animate-pulse-glow" 
                  : "hover:bg-muted/50"
              )}
              onClick={() => handleLoadExample(example)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <CategoryIcon className="h-5 w-5 text-primary" />
                  <h4 className="font-semibold text-foreground">{example.name}</h4>
                </div>
                <Badge className={getCategoryColor(example.category)}>
                  {example.category}
                </Badge>
              </div>

              <p className="text-sm text-muted-foreground mb-3">
                {example.description}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {example.sampleInputs.slice(0, 3).map((input, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLoadInput(input);
                      }}
                      className="text-xs bg-muted hover:bg-muted/80 text-muted-foreground px-2 py-1 rounded font-mono transition-colors"
                    >
                      {input}
                    </button>
                  ))}
                  {example.sampleInputs.length > 3 && (
                    <span className="text-xs text-muted-foreground px-2 py-1">
                      +{example.sampleInputs.length - 3} more
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Zap className="h-3 w-3" />
                  <span>{example.config.states.length} states</span>
                </div>
              </div>

              {isSelected && (
                <div className="mt-3 pt-3 border-t border-border">
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>States: {example.config.states.map(s => s.name).join(', ')}</div>
                    <div>Alphabet: {example.config.alphabet.join(', ')}</div>
                    <div>Transitions: {example.config.transitions.length}</div>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="text-xs text-muted-foreground mb-2">Quick Actions</div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleLoadInput('101')}
            className="text-xs"
          >
            <BookOpen className="h-3 w-3 mr-1" />
            Binary: 101
          </Button>
          <Button
            variant="outline" 
            size="sm"
            onClick={() => handleLoadInput('1+11')}
            className="text-xs"
          >
            <Calculator className="h-3 w-3 mr-1" />
            Unary: 1+11
          </Button>
        </div>
      </div>
    </div>
  );
};