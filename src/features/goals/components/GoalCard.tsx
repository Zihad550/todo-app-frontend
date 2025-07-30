import { useState } from 'react';
import {
  Clock,
  Target,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  CheckCircle,
  Circle,
  PlayCircle,
  PauseCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  type GoalTreeNode,
  GoalStatus,
  type UpdateGoalInput,
} from '@/types/goal';
import { EditGoalModal } from './EditGoalModal';
import { cn } from '@/lib/utils';

interface GoalCardProps {
  goal: GoalTreeNode;
  progress: number;
  canStart: boolean;
  onUpdate: (updates: UpdateGoalInput) => void;
  onDelete: () => void;
  onCreateSubGoal: () => void;
  className?: string;
}

const statusConfig = {
  [GoalStatus.NOT_STARTED]: {
    label: 'Not Started',
    color: 'bg-gray-500',
    textColor: 'text-gray-600',
    icon: Circle,
  },
  [GoalStatus.IN_PROGRESS]: {
    label: 'In Progress',
    color: 'bg-blue-500',
    textColor: 'text-blue-600',
    icon: PlayCircle,
  },
  [GoalStatus.COMPLETED]: {
    label: 'Completed',
    color: 'bg-green-500',
    textColor: 'text-green-600',
    icon: CheckCircle,
  },
  [GoalStatus.ON_HOLD]: {
    label: 'On Hold',
    color: 'bg-yellow-500',
    textColor: 'text-yellow-600',
    icon: PauseCircle,
  },
};

export function GoalCard({
  goal,
  progress,
  canStart,
  onUpdate,
  onDelete,
  onCreateSubGoal,
  className,
}: GoalCardProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const statusInfo = statusConfig[goal.status];
  const StatusIcon = statusInfo.icon;

  const handleStatusChange = (newStatus: GoalStatus) => {
    onUpdate({ status: newStatus });
  };

  const getNextStatus = () => {
    switch (goal.status) {
      case GoalStatus.NOT_STARTED:
        return canStart ? GoalStatus.IN_PROGRESS : null;
      case GoalStatus.IN_PROGRESS:
        return GoalStatus.COMPLETED;
      case GoalStatus.ON_HOLD:
        return GoalStatus.IN_PROGRESS;
      case GoalStatus.COMPLETED:
        return null;
      default:
        return null;
    }
  };

  const nextStatus = getNextStatus();

  return (
    <Card className={cn('mb-2', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <StatusIcon className={cn('h-5 w-5', statusInfo.textColor)} />
              <h3 className="font-semibold text-lg truncate">{goal.title}</h3>
              <Badge variant="outline" className="text-xs">
                {goal.category}
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground mb-3">
              {goal.description}
            </p>

            {goal.children.length > 0 && (
              <div className="mb-3">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 ml-4">
            {nextStatus && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleStatusChange(nextStatus)}
                disabled={!canStart && goal.status === GoalStatus.NOT_STARTED}
              >
                {nextStatus === GoalStatus.IN_PROGRESS && 'Start'}
                {nextStatus === GoalStatus.COMPLETED && 'Complete'}
              </Button>
            )}

            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowEditModal(true)}
            >
              <Edit className="h-4 w-4" />
            </Button>

            <Button size="sm" variant="ghost" onClick={onCreateSubGoal}>
              <Plus className="h-4 w-4" />
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={onDelete}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-start px-6 py-2 h-auto"
          >
            <span className="text-sm text-muted-foreground">
              {isExpanded ? 'Hide details' : 'Show details'}
            </span>
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="space-y-4">
              {/* Time tracking */}
              {(goal.estimatedHours || goal.actualHours) && (
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Estimated:</span>
                    <span>{goal.estimatedHours || 0}h</span>
                  </div>
                  {goal.actualHours && (
                    <div className="flex items-center gap-1">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Actual:</span>
                      <span>{goal.actualHours}h</span>
                    </div>
                  )}
                </div>
              )}

              {/* Resources */}
              {goal.resources.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm mb-2">Resources</h4>
                  <div className="space-y-2">
                    {goal.resources.map((resource) => (
                      <div
                        key={resource.id}
                        className="flex items-center justify-between p-2 bg-muted/50 rounded"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div
                            className={cn(
                              'h-2 w-2 rounded-full',
                              resource.completed
                                ? 'bg-green-500'
                                : 'bg-gray-300'
                            )}
                          />
                          <span className="text-sm truncate">
                            {resource.title}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {resource.type}
                          </Badge>
                        </div>
                        <Button size="sm" variant="ghost" asChild>
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {goal.notes && (
                <div>
                  <h4 className="font-medium text-sm mb-2">Notes</h4>
                  <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">
                    {goal.notes}
                  </p>
                </div>
              )}

              {/* Dates */}
              <div className="flex gap-4 text-xs text-muted-foreground">
                <div>Created: {goal.createdAt.toLocaleDateString()}</div>
                {goal.startedAt && (
                  <div>Started: {goal.startedAt.toLocaleDateString()}</div>
                )}
                {goal.completedAt && (
                  <div>Completed: {goal.completedAt.toLocaleDateString()}</div>
                )}
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>

      <EditGoalModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSubmit={(updates) => {
          onUpdate(updates);
          setShowEditModal(false);
        }}
        goal={goal}
      />
    </Card>
  );
}
