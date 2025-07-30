import { useState } from 'react';
import { Play, MoreVertical, Clock, Flame, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Routine } from '@/types/routine';
import { RoutineStatus } from '@/types/routine';
import { cn } from '@/lib/utils';

interface RoutineCardProps {
  routine: Routine;
  onStart: (id: string) => void;
  onEdit: (routine: Routine) => void;
  onDelete: (id: string) => void;
  className?: string;
}

export function RoutineCard({
  routine,
  onStart,
  onEdit,
  onDelete,
  className,
}: RoutineCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const completedSteps = routine.steps.filter((step) => step.completed).length;
  const totalSteps = routine.steps.length;
  const progressPercentage =
    totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;
  const isInProgress = completedSteps > 0 && completedSteps < totalSteps;
  const isCompleted = completedSteps === totalSteps && totalSteps > 0;

  const getFrequencyText = () => {
    switch (routine.frequency) {
      case 'daily':
        return 'Daily';
      case 'weekly':
        return 'Weekly';
      case 'monthly':
        return 'Monthly';
      case 'custom':
        return 'Custom';
      default:
        return routine.frequency;
    }
  };

  return (
    <Card
      className={cn(
        'group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] cursor-pointer routine-card-enter',
        isHovered && 'ring-2 ring-primary/20',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: `linear-gradient(135deg, ${routine.color}15 0%, ${routine.color}05 100%)`,
        borderColor: `${routine.color}30`,
      }}
    >
      {/* Animated background gradient */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `linear-gradient(135deg, ${routine.color}20 0%, ${routine.color}10 100%)`,
        }}
      />

      <CardHeader className="relative pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div
              className="p-2 rounded-xl shadow-lg routine-icon-float"
              style={{ backgroundColor: routine.color }}
            >
              <div className="w-6 h-6 text-white flex items-center justify-center">
                {/* Icon would be rendered here based on routine.icon */}
                <Target className="w-4 h-4" />
              </div>
            </div>
            <div>
              <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                {routine.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-1">
                {routine.description}
              </p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(routine)}>
                Edit Routine
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(routine.id)}
                className="text-destructive"
              >
                Delete Routine
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-4">
        {/* Progress Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">
              {completedSteps}/{totalSteps} steps
            </span>
          </div>
          <Progress
            value={progressPercentage}
            className="h-2"
            style={{
              background: `${routine.color}20`,
            }}
          />
        </div>

        {/* Stats Row */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{routine.totalEstimatedMinutes}m</span>
            </div>
            <div className="flex items-center space-x-1 text-muted-foreground">
              <Flame
                className={cn(
                  'w-4 h-4',
                  routine.streak > 0 && 'routine-streak-bounce'
                )}
              />
              <span className="font-medium">{routine.streak}</span>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs">
            {getFrequencyText()}
          </Badge>
        </div>

        {/* Action Button */}
        <Button
          onClick={() => onStart(routine.id)}
          className="w-full group-hover:shadow-lg transition-all duration-300"
          style={{
            backgroundColor: routine.color,
            color: 'white',
          }}
          disabled={routine.status === RoutineStatus.PAUSED}
        >
          <Play className="w-4 h-4 mr-2" />
          {isInProgress ? 'Continue Session' : 'Start Routine'}
        </Button>

        {/* Status Indicator */}
        {isCompleted && (
          <div className="absolute top-4 right-4 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
        )}
      </CardContent>
    </Card>
  );
}
