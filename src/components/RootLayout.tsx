import { Outlet } from 'react-router';
import { Navigation } from '@/components/Navigation';
import { ThemeProvider } from '@/components/ThemeProvider';

export function RootLayout() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-6">
          <Outlet />
        </main>
      </div>
    </ThemeProvider>
  );
}
