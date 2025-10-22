import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';

export default function Header() {
  const { isAuthenticated, email, signOut } = useAuth();
  const { isFree } = useSubscription();
  const navigate = useNavigate();

  if (!isAuthenticated) return null;

  const handleSignOut = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  return (
    <header className="bg-background text-foreground border-b border-border">
      <div className="max-w-7xl mx-auto px-4 py-2 flex justify-between items-center">
        <nav className="flex flex-wrap gap-4 text-sm">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/vault">Vault</Link>
          <Link to="/explorer">Explorer</Link>
          <Link to="/ai-studio">AI Studio</Link>
          <Link to="/calendar">Calendar</Link>
          <Link to="/feedback">Feedback</Link>
          <Link to="/metadata">Metadata</Link>
          <Link to="/analytics">Analytics</Link>
          <Link to="/marketplace">Marketplace</Link>
          <Link to="/pricing">Pricing</Link>
        </nav>
        <div className="flex gap-3 items-center">
          {isFree && (
            <Link to="/pricing" className="px-3 py-1 rounded border border-primary text-primary hover:bg-primary/10 transition-smooth" aria-label="Upgrade para PRO">
              Upgrade
            </Link>
          )}
          <span className="text-xs md:text-sm">{email}</span>
          <button 
            onClick={handleSignOut} 
            className="px-3 py-1 rounded border border-border hover:bg-muted transition-smooth"
            aria-label="Sair da conta"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
