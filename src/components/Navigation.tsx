import { NavLink } from 'react-router';
import { CheckSquare, Tags, BarChart3, FileText } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { cn } from '@/lib/utils';

export function Navigation() {
  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <CheckSquare className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">TaskFlow</span>
            </div>

            <div className="flex items-center space-x-1">
              <NavLink
                to="/tasks"
                className={({ isActive }) =>
                  cn(
                    'flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )
                }
              >
                <CheckSquare className="h-4 w-4" />
                <span>Tasks</span>
              </NavLink>

              <NavLink
                to="/tags"
                className={({ isActive }) =>
                  cn(
                    'flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )
                }
              >
                <Tags className="h-4 w-4" />
                <span>Tags</span>
              </NavLink>

              <NavLink
                to="/statistics"
                className={({ isActive }) =>
                  cn(
                    'flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )
                }
              >
                <BarChart3 className="h-4 w-4" />
                <span>Statistics</span>
              </NavLink>

              <NavLink
                to="/drafts"
                className={({ isActive }) =>
                  cn(
                    'flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )
                }
              >
                <FileText className="h-4 w-4" />
                <span>Drafts</span>
              </NavLink>
            </div>
          </div>

          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
