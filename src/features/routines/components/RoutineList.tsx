import { useState } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RoutineCard } from './RoutineCard';
import { CreateRoutineModal } from './CreateRoutineModal';
import { RoutineSession } from './RoutineSession';
import type { Routine, CreateRoutineInput } from '@/types/routine';
import { RoutineStatus } from '@/types/routine';
import { cn } from '@/lib/utils';

interface RoutineListProps {
  routines: Routine[];
  isLoading: boolean;
  onCreateRoutine: (routine: CreateRoutineInput) => void;
  onUpdateRoutine: (id: string, updates: unknown) => void;
  onDeleteRoutine: (id: string) => void;
  onStartSession: (id: string) => void;
  onStepComplete: (routineId: string, stepId: string) => void;
  onSessionComplete: (routineId: string) => void;
  className?: string;
}

export function RoutineList({
  routines,
  isLoading,
  onCreateRoutine,
  onUpdateRoutine: _onUpdateRoutine,
  onDeleteRoutine,
  onStartSession,
  onStepComplete,
  onSessionComplete,
  className,
}: RoutineListProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const activeRoutine = routines.find((r) => r.id === activeSessionId);

  const filteredRoutines = routines.filter((routine) => {
    const matchesSearch =
      routine.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      routine.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || routine.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStartSession = (routineId: string) => {
    onStartSession(routineId);
    setActiveSessionId(routineId);
  };

  const handleSessionComplete = (routineId: string) => {
    onSessionComplete(routineId);
    setActiveSessionId(null);
  };

  const handleCloseSession = () => {
    setActiveSessionId(null);
  };

  if (activeRoutine) {
    return (
      <div className="container mx-auto px-4 py-8">
        <RoutineSession
          routine={activeRoutine}
          onStepComplete={(stepId) => onStepComplete(activeRoutine.id, stepId)}
          onSessionComplete={() => handleSessionComplete(activeRoutine.id)}
          onClose={handleCloseSession}
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={cn('space-y-6', className)}>
        <div className="flex justify-between items-center">
          <div className="h-8 w-32 bg-muted animate-pulse rounded" />
          <div className="h-10 w-32 bg-muted animate-pulse rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold routine-title-gradient">
            My Routines
          </h1>
          <p className="text-muted-foreground">
            Build consistent habits with interactive routines
          </p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          size="lg"
          className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Routine
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search routines..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Routines</SelectItem>
            <SelectItem value={RoutineStatus.ACTIVE}>Active</SelectItem>
            <SelectItem value={RoutineStatus.PAUSED}>Paused</SelectItem>
            <SelectItem value={RoutineStatus.COMPLETED}>Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Routines Grid */}
      {filteredRoutines.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <Plus className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No routines found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery || statusFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Create your first routine to get started'}
          </p>
          {!searchQuery && statusFilter === 'all' && (
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Routine
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRoutines.map((routine) => (
            <RoutineCard
              key={routine.id}
              routine={routine}
              onStart={handleStartSession}
              onEdit={(routine) => {
                // TODO: Implement edit functionality
                console.log('Edit routine:', routine);
              }}
              onDelete={onDeleteRoutine}
            />
          ))}
        </div>
      )}

      {/* Create Modal */}
      <CreateRoutineModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={onCreateRoutine}
      />
    </div>
  );
}
