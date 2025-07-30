export enum GoalStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  ON_HOLD = 'on_hold',
}

export enum GoalCategory {
  FRONTEND = 'frontend',
  BACKEND = 'backend',
  DATABASE = 'database',
  DEVOPS = 'devops',
  TOOLS = 'tools',
  SOFT_SKILLS = 'soft_skills',
  ARCHITECTURE = 'architecture',
}

export interface Resource {
  id: string;
  title: string;
  url: string;
  type: 'documentation' | 'tutorial' | 'course' | 'book' | 'video' | 'practice';
  completed: boolean;
}

export interface CreateGoalInput {
  title: string;
  description: string;
  category: GoalCategory;
  parentId?: string;
  prerequisites?: string[];
  estimatedHours?: number;
  resources?: Omit<Resource, 'id' | 'completed'>[];
  notes?: string;
}

export interface UpdateGoalInput {
  title?: string;
  description?: string;
  category?: GoalCategory;
  status?: GoalStatus;
  parentId?: string;
  prerequisites?: string[];
  estimatedHours?: number;
  actualHours?: number;
  resources?: Resource[];
  notes?: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  category: GoalCategory;
  status: GoalStatus;
  parentId?: string;
  children: string[];
  prerequisites: string[];
  estimatedHours?: number;
  actualHours?: number;
  resources: Resource[];
  notes: string;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface GoalTreeNode extends Goal {
  level: number;
  isExpanded: boolean;
  childNodes: GoalTreeNode[];
}
