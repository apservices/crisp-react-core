import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Auth from '@/pages/Auth';
import { Music } from 'lucide-react';

interface AuthGuardProps {
  children: ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="glass border-glass-border rounded-lg p-8">
          <div className="flex items-center gap-3">
            <Music className="h-6 w-6 text-primary animate-pulse" />
            <p className="text-foreground">Carregando...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return <>{children}</>;
}