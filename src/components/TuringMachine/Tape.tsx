import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface TapeProps {
  tape: Map<number, string>;
  headPosition: number;
  blankSymbol: string;
  viewRange?: number;
  onCellClick?: (position: number, currentSymbol: string) => void;
  isWriting?: boolean;
}

export const Tape = ({ 
  tape, 
  headPosition, 
  blankSymbol, 
  viewRange = 15,
  onCellClick,
  isWriting = false
}: TapeProps) => {
  const tapeRef = useRef<HTMLDivElement>(null);

  const startPos = headPosition - Math.floor(viewRange / 2);
  const endPos = headPosition + Math.floor(viewRange / 2);

  useEffect(() => {
    if (tapeRef.current) {
      const headCell = tapeRef.current.querySelector(`[data-position="${headPosition}"]`);
      if (headCell) {
        headCell.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'nearest',
          inline: 'center' 
        });
      }
    }
  }, [headPosition]);

  const getCellSymbol = (position: number) => {
    return tape.get(position) ?? blankSymbol;
  };

  const handleCellClick = (position: number) => {
    if (onCellClick) {
      const currentSymbol = getCellSymbol(position);
      onCellClick(position, currentSymbol);
    }
  };

  const cells = [];
  for (let i = startPos; i <= endPos; i++) {
    const symbol = getCellSymbol(i);
    const isHead = i === headPosition;
    const isActive = isHead && isWriting;
    
    cells.push(
      <div
        key={i}
        data-position={i}
        className={cn(
          "relative flex items-center justify-center w-16 h-16 border-2 font-mono text-lg font-bold cursor-pointer transition-all duration-200",
          "border-tape-border bg-tape-cell text-foreground",
          isHead && "border-primary bg-primary/10 shadow-lg animate-pulse-glow",
          isActive && "animate-tape-write",
          "hover:bg-tape-cell/80 hover:scale-105"
        )}
        onClick={() => handleCellClick(i)}
      >
        <span className="select-none">
          {symbol === blankSymbol ? '∅' : symbol}
        </span>
        {isHead && (
          <>
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
              <div className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-bold animate-slide-in">
                HEAD
              </div>
              <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-primary mx-auto"></div>
            </div>
            <div className="absolute inset-0 border-2 border-primary rounded animate-pulse-glow"></div>
          </>
        )}
        <div className="absolute -bottom-6 text-xs text-muted-foreground font-mono">
          {i}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-card rounded-lg border shadow-lg p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <div className="w-4 h-4 bg-gradient-to-r from-primary to-accent rounded"></div>
          Tape
        </h3>
        <p className="text-sm text-muted-foreground">
          Click cells to edit • Head position: {headPosition}
        </p>
      </div>
      
      <div 
        ref={tapeRef}
        className="flex items-center gap-1 overflow-x-auto scroll-smooth pb-8 pt-12 px-4"
        style={{ 
          scrollbarWidth: 'thin',
          scrollbarColor: 'hsl(var(--primary)) hsl(var(--muted))'
        }}
      >
        {cells}
      </div>
      
      <div className="mt-4 flex justify-between items-center text-xs text-muted-foreground">
        <span>Showing positions {startPos} to {endPos}</span>
        <span>∅ = blank symbol ({blankSymbol})</span>
      </div>
    </div>
  );
};