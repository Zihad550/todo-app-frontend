import { ChevronRight, ChevronDown, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GoalCard } from './GoalCard';
import { CreateGoalModal } from './CreateGoalModal';
import {
  type GoalTreeNode,
  type CreateGoalInput,
  type UpdateGoalInput,
} from '@/types/goal';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface GoalTreeProps {
  goals: GoalTreeNode[];
  onGoalUpdate: (id: string, updates: UpdateGoalInput) => void;
  onGoalDelete: (id: string) => void;
  onToggleExpanded: (goalId: string) => void;
  onGoalCreate: (input: CreateGoalInput) => void;
  getGoalProgress: (goalId: string) => number;
  canStartGoal: (goalId: string) => boolean;
  className?: string;
}

export function GoalTree({
  goals,
  onGoalUpdate,
  onGoalDelete,
  onToggleExpanded,
  onGoalCreate,
  getGoalProgress,
  canStartGoal,
  className,
}: GoalTreeProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState<
    string | undefined
  >();

  const handleCreateSubGoal = (parentId: string) => {
    setSelectedParentId(parentId);
    setShowCreateModal(true);
  };

  const handleCreateRootGoal = () => {
    setSelectedParentId(undefined);
    setShowCreateModal(true);
  };

  const handleCreateGoal = (input: CreateGoalInput) => {
    onGoalCreate({
      ...input,
      parentId: selectedParentId,
    });
    setShowCreateModal(false);
    setSelectedParentId(undefined);
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Learning Goals</h2>
        <Button onClick={handleCreateRootGoal} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Root Goal
        </Button>
      </div>

      <div className="space-y-1">
        {goals.map((goal) => (
          <div key={goal.id} className="relative">
            {/* Indentation and tree lines */}
            <div
              className="flex items-start"
              style={{ paddingLeft: `${goal.level * 24}px` }}
            >
              {/* Tree connector lines */}
              {goal.level > 0 && (
                <div className="absolute left-0 top-0 bottom-0 flex">
                  {Array.from({ length: goal.level }).map((_, index) => (
                    <div
                      key={index}
                      className="w-6 flex justify-center"
                      style={{ left: `${index * 24}px` }}
                    >
                      {index === goal.level - 1 ? (
                        <div className="w-px bg-border h-6 mt-6" />
                      ) : (
                        <div className="w-px bg-border h-full" />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Expand/collapse button */}
              <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center mr-2 mt-4">
                {goal.children.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => onToggleExpanded(goal.id)}
                  >
                    {goal.isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>

              {/* Goal card */}
              <div className="flex-1 min-w-0">
                <GoalCard
                  goal={goal}
                  progress={getGoalProgress(goal.id)}
                  canStart={canStartGoal(goal.id)}
                  onUpdate={(updates) => onGoalUpdate(goal.id, updates)}
                  onDelete={() => onGoalDelete(goal.id)}
                  onCreateSubGoal={() => handleCreateSubGoal(goal.id)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {goals.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <div className="text-lg mb-2">No goals yet</div>
          <div className="text-sm mb-4">Start building your learning path</div>
          <Button onClick={handleCreateRootGoal}>
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Goal
          </Button>
        </div>
      )}

      <CreateGoalModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setSelectedParentId(undefined);
        }}
        onSubmit={handleCreateGoal}
        parentId={selectedParentId}
      />
    </div>
  );
}
