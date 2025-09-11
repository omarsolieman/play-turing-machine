import { TuringMachineState } from '@/types/turing-machine';
import { cn } from '@/lib/utils';
import { CheckCircle, XCircle, Circle } from 'lucide-react';

interface StateDisplayProps {
  states: TuringMachineState[];
  currentState: string;
  isFinished: boolean;
  isAccepted: boolean;
}

export const StateDisplay = ({ 
  states, 
  currentState, 
  isFinished, 
  isAccepted 
}: StateDisplayProps) => {
  const currentStateObj = states.find(s => s.name === currentState);

  return (
    <div className="bg-card rounded-lg border shadow-lg p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <div className="w-4 h-4 bg-gradient-to-r from-primary to-accent rounded"></div>
          States
        </h3>
        <p className="text-sm text-muted-foreground">
          Current: {currentState}
          {isFinished && (
            <span className={cn(
              "ml-2 font-semibold",
              isAccepted ? "text-accent" : "text-destructive"
            )}>
              {isAccepted ? "ACCEPTED" : "REJECTED"}
            </span>
          )}
        </p>
      </div>

      {/* Current State Highlight */}
      <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-lg">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all",
            currentStateObj?.isAccept 
              ? "bg-accent text-accent-foreground animate-pulse-glow"
              : currentStateObj?.isReject
                ? "bg-destructive text-destructive-foreground animate-pulse-glow"  
                : "bg-primary text-primary-foreground animate-pulse-glow"
          )}>
            {currentStateObj?.isAccept ? (
              <CheckCircle className="w-4 h-4" />
            ) : currentStateObj?.isReject ? (
              <XCircle className="w-4 h-4" />
            ) : (
              <Circle className="w-4 h-4 fill-current" />
            )}
          </div>
          <div>
            <div className="font-semibold text-lg animate-state-change">
              {currentState}
            </div>
            <div className="text-sm text-muted-foreground">
              {currentStateObj?.isAccept 
                ? "Accept State"
                : currentStateObj?.isReject 
                  ? "Reject State"
                  : "Active State"
              }
            </div>
          </div>
        </div>
      </div>

      {/* All States Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
        {states.map((state) => {
          const isCurrent = state.name === currentState;
          
          return (
            <div
              key={state.name}
              className={cn(
                "relative p-3 rounded-lg border text-center transition-all duration-200 cursor-default",
                isCurrent 
                  ? "bg-primary/20 border-primary text-primary-foreground scale-110 animate-pulse-glow"
                  : "bg-muted/50 border-muted hover:bg-muted",
                state.isAccept && "ring-2 ring-accent/50",
                state.isReject && "ring-2 ring-destructive/50"
              )}
            >
              <div className={cn(
                "text-sm font-semibold mb-1",
                isCurrent ? "text-primary" : "text-foreground"
              )}>
                {state.name}
              </div>
              
              {(state.isAccept || state.isReject) && (
                <div className={cn(
                  "text-xs",
                  state.isAccept ? "text-accent" : "text-destructive"
                )}>
                  {state.isAccept ? "ACCEPT" : "REJECT"}
                </div>
              )}

              {isCurrent && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-pulse"></div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="text-xs text-muted-foreground space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary rounded-full"></div>
            <span>Current state</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 border-2 border-accent rounded-full"></div>
            <span>Accept state</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 border-2 border-destructive rounded-full"></div>
            <span>Reject state</span>
          </div>
        </div>
      </div>
    </div>
  );
};