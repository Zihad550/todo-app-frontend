import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import {
  type Goal,
  type GoalTreeNode,
  GoalStatus,
  GoalCategory,
  type CreateGoalInput,
  type UpdateGoalInput,
} from '@/types/goal';

// Mock data for fullstack developer learning path
const mockGoals: Goal[] = [
  {
    id: '1',
    title: 'Frontend Development',
    description: 'Master modern frontend technologies and frameworks',
    category: GoalCategory.FRONTEND,
    status: GoalStatus.IN_PROGRESS,
    children: ['2', '3', '4'],
    prerequisites: [],
    resources: [],
    notes: 'Focus on React ecosystem first',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    title: 'HTML & CSS Fundamentals',
    description:
      'Master semantic HTML and modern CSS including Flexbox and Grid',
    category: GoalCategory.FRONTEND,
    status: GoalStatus.COMPLETED,
    parentId: '1',
    children: [],
    prerequisites: [],
    estimatedHours: 40,
    actualHours: 35,
    resources: [
      {
        id: 'r1',
        title: 'MDN HTML Guide',
        url: 'https://developer.mozilla.org/en-US/docs/Web/HTML',
        type: 'documentation',
        completed: true,
      },
      {
        id: 'r2',
        title: 'CSS Grid Complete Guide',
        url: 'https://css-tricks.com/snippets/css/complete-guide-grid/',
        type: 'tutorial',
        completed: true,
      },
    ],
    notes: 'Completed with strong foundation in responsive design',
    startedAt: new Date('2024-01-01'),
    completedAt: new Date('2024-01-15'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '3',
    title: 'JavaScript ES6+',
    description:
      'Modern JavaScript features, async/await, modules, and DOM manipulation',
    category: GoalCategory.FRONTEND,
    status: GoalStatus.COMPLETED,
    parentId: '1',
    children: [],
    prerequisites: ['2'],
    estimatedHours: 60,
    actualHours: 55,
    resources: [
      {
        id: 'r3',
        title: 'JavaScript.info',
        url: 'https://javascript.info/',
        type: 'tutorial',
        completed: true,
      },
    ],
    notes: 'Strong understanding of closures, promises, and async patterns',
    startedAt: new Date('2024-01-16'),
    completedAt: new Date('2024-02-10'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-02-10'),
  },
  {
    id: '4',
    title: 'React & TypeScript',
    description: 'Build modern React applications with TypeScript',
    category: GoalCategory.FRONTEND,
    status: GoalStatus.IN_PROGRESS,
    parentId: '1',
    children: ['5', '6'],
    prerequisites: ['3'],
    estimatedHours: 80,
    actualHours: 45,
    resources: [
      {
        id: 'r4',
        title: 'React Official Docs',
        url: 'https://react.dev/',
        type: 'documentation',
        completed: true,
      },
      {
        id: 'r5',
        title: 'TypeScript Handbook',
        url: 'https://www.typescriptlang.org/docs/',
        type: 'documentation',
        completed: false,
      },
    ],
    notes:
      'Currently working on advanced patterns and performance optimization',
    startedAt: new Date('2024-02-11'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-02-11'),
  },
  {
    id: '5',
    title: 'React Hooks & State Management',
    description: 'Master React hooks, context, and state management patterns',
    category: GoalCategory.FRONTEND,
    status: GoalStatus.IN_PROGRESS,
    parentId: '4',
    children: [],
    prerequisites: [],
    estimatedHours: 30,
    actualHours: 20,
    resources: [],
    notes: 'Learning advanced hook patterns',
    startedAt: new Date('2024-02-15'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-02-15'),
  },
  {
    id: '6',
    title: 'React Testing',
    description:
      'Unit and integration testing with Jest and React Testing Library',
    category: GoalCategory.FRONTEND,
    status: GoalStatus.NOT_STARTED,
    parentId: '4',
    children: [],
    prerequisites: ['5'],
    estimatedHours: 25,
    resources: [],
    notes: 'Will start after completing hooks mastery',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '7',
    title: 'Backend Development',
    description: 'Server-side development with Node.js and databases',
    category: GoalCategory.BACKEND,
    status: GoalStatus.NOT_STARTED,
    children: ['8', '9', '10'],
    prerequisites: ['4'],
    resources: [],
    notes: 'Will start after React mastery',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '8',
    title: 'Node.js & Express',
    description: 'Build REST APIs with Node.js and Express framework',
    category: GoalCategory.BACKEND,
    status: GoalStatus.NOT_STARTED,
    parentId: '7',
    children: [],
    prerequisites: [],
    estimatedHours: 50,
    resources: [],
    notes: '',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '9',
    title: 'Database Design',
    description: 'SQL and NoSQL database design and optimization',
    category: GoalCategory.DATABASE,
    status: GoalStatus.NOT_STARTED,
    parentId: '7',
    children: [],
    prerequisites: [],
    estimatedHours: 40,
    resources: [],
    notes: '',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '10',
    title: 'Authentication & Security',
    description: 'JWT, OAuth, and security best practices',
    category: GoalCategory.BACKEND,
    status: GoalStatus.NOT_STARTED,
    parentId: '7',
    children: [],
    prerequisites: ['8'],
    estimatedHours: 35,
    resources: [],
    notes: '',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>(mockGoals);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(
    new Set(['1', '4', '7'])
  );
  const [isLoading, setIsLoading] = useState(false);

  // Build tree structure
  const goalTree = useMemo(() => {
    const buildTree = (parentId?: string, level = 0): GoalTreeNode[] => {
      return goals
        .filter((goal) => goal.parentId === parentId)
        .map((goal) => ({
          ...goal,
          level,
          isExpanded: expandedNodes.has(goal.id),
          childNodes: buildTree(goal.id, level + 1),
        }))
        .sort((a, b) => {
          // Sort by status priority, then by creation date
          const statusOrder = {
            [GoalStatus.IN_PROGRESS]: 0,
            [GoalStatus.NOT_STARTED]: 1,
            [GoalStatus.ON_HOLD]: 2,
            [GoalStatus.COMPLETED]: 3,
          };

          if (statusOrder[a.status] !== statusOrder[b.status]) {
            return statusOrder[a.status] - statusOrder[b.status];
          }

          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        });
    };

    return buildTree();
  }, [goals, expandedNodes]);

  // Flatten tree for display
  const flattenedGoals = useMemo(() => {
    const flatten = (nodes: GoalTreeNode[]): GoalTreeNode[] => {
      const result: GoalTreeNode[] = [];

      for (const node of nodes) {
        result.push(node);
        if (node.isExpanded && node.childNodes.length > 0) {
          result.push(...flatten(node.childNodes));
        }
      }

      return result;
    };

    return flatten(goalTree);
  }, [goalTree]);

  const toggleExpanded = (goalId: string) => {
    setExpandedNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(goalId)) {
        newSet.delete(goalId);
      } else {
        newSet.add(goalId);
      }
      return newSet;
    });
  };

  const createGoal = async (input: CreateGoalInput) => {
    setIsLoading(true);
    try {
      const newGoal: Goal = {
        id: Date.now().toString(),
        ...input,
        status: GoalStatus.NOT_STARTED,
        children: [],
        prerequisites: input.prerequisites || [],
        resources: (input.resources || []).map((resource) => ({
          ...resource,
          id: Date.now().toString() + Math.random(),
          completed: false,
        })),
        notes: input.notes || '',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setGoals((prev) => {
        const updated = [...prev, newGoal];

        // Update parent's children array if this is a child goal
        if (input.parentId) {
          return updated.map((goal) =>
            goal.id === input.parentId
              ? { ...goal, children: [...goal.children, newGoal.id] }
              : goal
          );
        }

        return updated;
      });

      toast.success('Goal created successfully');
    } catch {
      toast.error('Failed to create goal');
    } finally {
      setIsLoading(false);
    }
  };

  const updateGoal = async (id: string, updates: UpdateGoalInput) => {
    setIsLoading(true);
    try {
      setGoals((prev) =>
        prev.map((goal) => {
          if (goal.id === id) {
            const updatedGoal = {
              ...goal,
              ...updates,
              updatedAt: new Date(),
            };

            // Handle status changes
            if (updates.status === GoalStatus.IN_PROGRESS && !goal.startedAt) {
              updatedGoal.startedAt = new Date();
            }

            if (updates.status === GoalStatus.COMPLETED && !goal.completedAt) {
              updatedGoal.completedAt = new Date();
            }

            return updatedGoal;
          }
          return goal;
        })
      );

      toast.success('Goal updated successfully');
    } catch {
      toast.error('Failed to update goal');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteGoal = async (id: string) => {
    setIsLoading(true);
    try {
      setGoals((prev) => {
        const goalToDelete = prev.find((g) => g.id === id);
        if (!goalToDelete) return prev;

        // Remove from parent's children array
        const updated = prev.map((goal) => {
          if (goal.id === goalToDelete.parentId) {
            return {
              ...goal,
              children: goal.children.filter((childId) => childId !== id),
            };
          }
          return goal;
        });

        // Remove the goal and all its descendants
        const removeDescendants = (goals: Goal[], parentId: string): Goal[] => {
          const childIds = goals
            .filter((g) => g.parentId === parentId)
            .map((g) => g.id);
          let filtered = goals.filter((g) => g.id !== parentId);

          for (const childId of childIds) {
            filtered = removeDescendants(filtered, childId);
          }

          return filtered;
        };

        return removeDescendants(updated, id);
      });

      toast.success('Goal deleted successfully');
    } catch {
      toast.error('Failed to delete goal');
    } finally {
      setIsLoading(false);
    }
  };

  const getGoalProgress = (goalId: string): number => {
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return 0;

    if (goal.children.length === 0) {
      return goal.status === GoalStatus.COMPLETED ? 100 : 0;
    }

    const childProgress = goal.children.map((childId) =>
      getGoalProgress(childId)
    );
    return (
      childProgress.reduce((sum, progress) => sum + progress, 0) /
      childProgress.length
    );
  };

  const canStartGoal = (goalId: string): boolean => {
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return false;

    return goal.prerequisites.every((prereqId) => {
      const prereq = goals.find((g) => g.id === prereqId);
      return prereq?.status === GoalStatus.COMPLETED;
    });
  };

  return {
    goals: flattenedGoals,
    goalTree,
    createGoal,
    updateGoal,
    deleteGoal,
    toggleExpanded,
    getGoalProgress,
    canStartGoal,
    isLoading,
  };
}
