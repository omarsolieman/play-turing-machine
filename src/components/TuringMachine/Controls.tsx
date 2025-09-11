import { Play, Pause, Square, SkipForward, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface ControlsProps {
  isRunning: boolean;
  isPaused: boolean;
  isFinished: boolean;
  speed: number;
  soundEnabled: boolean;
  steps: number;
  onPlay: () => void;
  onPause: () => void;
  onStep: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
  onSoundToggle: () => void;
}

export const Controls = ({
  isRunning,
  isPaused,
  isFinished,
  speed,
  soundEnabled,
  steps,
  onPlay,
  onPause,
  onStep,
  onReset,
  onSpeedChange,
  onSoundToggle
}: ControlsProps) => {
  const speedToMs = (speed: number) => 1100 - speed; // Convert 100-1000 to 1000-100ms
  const msToSpeed = (ms: number) => 1100 - ms;

  return (
    <div className="bg-card rounded-lg border shadow-lg p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <div className="w-4 h-4 bg-gradient-to-r from-accent to-primary rounded"></div>
          Controls
        </h3>
        <p className="text-sm text-muted-foreground">
          Steps: {steps} • Speed: {Math.round(1000 / speedToMs(speed) * 10) / 10} steps/sec
        </p>
      </div>

      {/* Main Control Buttons */}
      <div className="flex gap-3 mb-6">
        <Button
          onClick={isRunning && !isPaused ? onPause : onPlay}
          disabled={isFinished}
          className={cn(
            "flex-1 h-12 text-lg font-semibold transition-all duration-200",
            isRunning && !isPaused 
              ? "bg-warning hover:bg-warning/80 text-warning-foreground animate-pulse-glow" 
              : "bg-accent hover:bg-accent/80 text-accent-foreground"
          )}
        >
          {isRunning && !isPaused ? (
            <>
              <Pause className="mr-2 h-5 w-5" />
              Pause
            </>
          ) : (
            <>
              <Play className="mr-2 h-5 w-5" />
              {isPaused ? 'Resume' : 'Run'}
            </>
          )}
        </Button>

        <Button
          onClick={onStep}
          disabled={isRunning || isFinished}
          variant="outline"
          className="h-12 px-6"
        >
          <SkipForward className="mr-2 h-5 w-5" />
          Step
        </Button>

        <Button
          onClick={onReset}
          variant="outline"
          className="h-12 px-6 hover:bg-destructive/10 hover:border-destructive/50"
        >
          <RotateCcw className="mr-2 h-5 w-5" />
          Reset
        </Button>
      </div>

      {/* Speed Control */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-foreground">
            Execution Speed
          </label>
          <span className="text-sm text-muted-foreground">
            {speedToMs(speed)}ms per step
          </span>
        </div>
        <Slider
          value={[speed]}
          onValueChange={(value) => onSpeedChange(value[0])}
          min={100}
          max={1000}
          step={50}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>Fast</span>
          <span>Slow</span>
        </div>
      </div>

      {/* Sound Toggle */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <span className="text-sm font-medium text-foreground">Sound Effects</span>
        <Button
          onClick={onSoundToggle}
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 w-8 p-0",
            soundEnabled ? "text-accent" : "text-muted-foreground"
          )}
        >
          {soundEnabled ? (
            <Volume2 className="h-4 w-4" />
          ) : (
            <VolumeX className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Status Indicator */}
      <div className="mt-4 flex items-center gap-2 text-sm">
        <div 
          className={cn(
            "w-3 h-3 rounded-full border-2",
            isFinished 
              ? "bg-destructive border-destructive animate-pulse"
              : isRunning
                ? "bg-accent border-accent animate-pulse"
                : "bg-muted border-muted"
          )}
        />
        <span className="text-muted-foreground">
          {isFinished 
            ? "Execution finished" 
            : isRunning 
              ? "Running..." 
              : "Ready"
          }
        </span>
      </div>
    </div>
  );
};