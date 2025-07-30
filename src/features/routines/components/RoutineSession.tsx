import { useState, useEffect } from 'react';
import { Check, Clock, Trophy, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import type { Routine } from '@/types/routine';
import { cn } from '@/lib/utils';

interface RoutineSessionProps {
  routine: Routine;
  onStepComplete: (stepId: string) => void;
  onSessionComplete: () => void;
  onClose: () => void;
  className?: string;
}

export function RoutineSession({
  routine,
  onStepComplete,
  onSessionComplete,
  onClose,
  className,
}: RoutineSessionProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [sessionStartTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);

  const completedSteps = routine.steps.filter((step) => step.completed);
  const totalSteps = routine.steps.length;
  const progressPercentage = (completedSteps.length / totalSteps) * 100;
  const currentStep = routine.steps[currentStepIndex];
  const isSessionComplete = completedSteps.length === totalSteps;

  // Timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - sessionStartTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionStartTime]);

  // Auto-advance to next incomplete step
  useEffect(() => {
    if (currentStep?.completed) {
      const nextIncompleteIndex = routine.steps.findIndex(
        (step, index) => index > currentStepIndex && !step.completed
      );
      if (nextIncompleteIndex !== -1) {
        setCurrentStepIndex(nextIncompleteIndex);
      }
    }
  }, [routine.steps, currentStepIndex, currentStep]);

  const handleStepComplete = () => {
    if (currentStep) {
      onStepComplete(currentStep.id);
      // Add visual feedback
      const stepElement = document.querySelector(
        `[data-step-id="${currentStep.id}"]`
      );
      if (stepElement) {
        stepElement.classList.add('routine-step-complete');
        setTimeout(() => {
          stepElement.classList.remove('routine-step-complete');
        }, 400);
      }
    }
  };

  const handleSessionComplete = () => {
    onSessionComplete();
    onClose();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isSessionComplete) {
    return (
      <Card className={cn('w-full max-w-2xl mx-auto', className)}>
        <CardContent className="p-8 text-center space-y-6">
          <div className="space-y-4">
            <div
              className="w-20 h-20 mx-auto rounded-full flex items-center justify-center"
              style={{ backgroundColor: routine.color }}
            >
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Routine Complete! 🎉
              </h2>
              <p className="text-muted-foreground">
                You've completed all {totalSteps} steps in{' '}
                {formatTime(elapsedTime)}
              </p>
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <Button onClick={handleSessionComplete} size="lg">
              Finish Session
            </Button>
            <Button variant="outline" onClick={onClose} size="lg">
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('w-full max-w-2xl mx-auto', className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className="p-2 rounded-lg"
              style={{ backgroundColor: routine.color }}
            >
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">{routine.title}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Step {currentStepIndex + 1} of {totalSteps} •{' '}
                {formatTime(elapsedTime)} elapsed
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Overall Progress</span>
            <span>
              {completedSteps.length}/{totalSteps} completed
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Current Step */}
        <div
          className="p-6 rounded-xl border-2 transition-all duration-300"
          style={{
            borderColor: routine.color,
            background: `linear-gradient(135deg, ${routine.color}10 0%, ${routine.color}05 100%)`,
          }}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{currentStep?.title}</h3>
              <Badge
                variant="secondary"
                className="text-xs"
                style={{ backgroundColor: `${routine.color}20` }}
              >
                {currentStep?.estimatedMinutes}m
              </Badge>
            </div>

            {currentStep?.description && (
              <p className="text-muted-foreground">{currentStep.description}</p>
            )}

            <Button
              onClick={handleStepComplete}
              className="w-full"
              size="lg"
              style={{ backgroundColor: routine.color }}
              disabled={currentStep?.completed}
            >
              {currentStep?.completed ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Completed
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Mark Complete
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Steps Overview */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-muted-foreground">
            All Steps
          </h4>
          <div className="space-y-2">
            {routine.steps.map((step, index) => (
              <div
                key={step.id}
                data-step-id={step.id}
                className={cn(
                  'flex items-center space-x-3 p-3 rounded-lg transition-all duration-200',
                  index === currentStepIndex && 'bg-muted',
                  step.completed && 'opacity-60'
                )}
              >
                <div
                  className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium',
                    step.completed
                      ? 'bg-green-500 text-white'
                      : index === currentStepIndex
                      ? 'text-white'
                      : 'bg-muted text-muted-foreground'
                  )}
                  style={
                    index === currentStepIndex && !step.completed
                      ? { backgroundColor: routine.color }
                      : {}
                  }
                >
                  {step.completed ? <Check className="w-3 h-3" /> : index + 1}
                </div>
                <div className="flex-1">
                  <p
                    className={cn(
                      'text-sm font-medium',
                      step.completed && 'line-through'
                    )}
                  >
                    {step.title}
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {step.estimatedMinutes}m
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
