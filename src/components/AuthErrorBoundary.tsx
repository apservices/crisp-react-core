import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  isAuthError: boolean;
  isOffline: boolean;
  retryCount: number;
}

export class AuthErrorBoundary extends Component<Props, State> {
  private retryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false, 
      isAuthError: false, 
      isOffline: !navigator.onLine,
      retryCount: 0 
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    const isAuthError = error.message?.includes('auth') || 
                       error.message?.includes('token') || 
                       error.message?.includes('session') ||
                       error.message?.includes('JWT');
    
    return { 
      hasError: true, 
      error,
      isAuthError
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('AuthErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
      isAuthError: this.isAuthRelatedError(error)
    });

    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to error tracking service
    }
  }

  componentDidMount() {
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
  }

  componentWillUnmount() {
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  handleOnline = () => {
    this.setState({ isOffline: false });
    if (this.state.hasError && this.state.isAuthError) {
      this.handleAuthRecovery();
    }
  };

  handleOffline = () => {
    this.setState({ isOffline: true });
  };

  isAuthRelatedError = (error: Error): boolean => {
    const authKeywords = ['auth', 'token', 'session', 'JWT', 'unauthorized', 'forbidden'];
    return authKeywords.some(keyword => 
      error.message?.toLowerCase().includes(keyword.toLowerCase()) ||
      error.stack?.toLowerCase().includes(keyword.toLowerCase())
    );
  };

  handleAuthRecovery = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        // Redirect to login
        window.location.href = '/login';
        return;
      }

      // Try to refresh session
      await supabase.auth.refreshSession();
      this.handleReload();
    } catch (error) {
      console.error('Auth recovery failed:', error);
      // Redirect to login as fallback
      window.location.href = '/login';
    }
  };

  handleReload = () => {
    this.setState({ 
      hasError: false, 
      error: undefined, 
      errorInfo: undefined, 
      isAuthError: false,
      retryCount: 0
    });
  };

  handleRetry = () => {
    const newRetryCount = this.state.retryCount + 1;
    this.setState({ retryCount: newRetryCount });

    if (this.state.isAuthError) {
      this.handleAuthRecovery();
    } else if (newRetryCount < 3) {
      // Exponential backoff for non-auth errors
      this.retryTimeoutId = setTimeout(() => {
        this.handleReload();
      }, Math.pow(2, newRetryCount) * 1000);
    } else {
      // Force reload after 3 retries
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { isAuthError, isOffline, retryCount } = this.state;

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="glass border-glass-border p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 glass rounded-full flex items-center justify-center mx-auto mb-6">
              {isOffline ? (
                <WifiOff className="h-8 w-8 text-destructive" />
              ) : isAuthError ? (
                <AlertTriangle className="h-8 w-8 text-warning" />
              ) : (
                <AlertTriangle className="h-8 w-8 text-destructive" />
              )}
            </div>
            
            <h2 className="text-heading-lg text-foreground mb-2">
              {isOffline 
                ? "Sem conexão" 
                : isAuthError 
                ? "Problema de autenticação" 
                : "Erro inesperado"
              }
            </h2>
            
            <p className="text-muted-foreground mb-6">
              {isOffline 
                ? "Verifique sua conexão com a internet e tente novamente."
                : isAuthError 
                ? "Sua sessão pode ter expirado. Vamos tentar reconectar automaticamente."
                : "Ocorreu um erro inesperado. Nossa equipe foi notificada."
              }
            </p>

            <div className="space-y-3">
              <Button 
                onClick={this.handleRetry}
                variant={isAuthError ? "neon" : "default"}
                className="w-full"
                disabled={retryCount >= 3 && !isAuthError}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {isAuthError 
                  ? "Reconectar" 
                  : retryCount >= 3 
                  ? "Muitas tentativas"
                  : "Tentar Novamente"
                }
              </Button>

              {isAuthError && (
                <Button 
                  onClick={() => window.location.href = '/login'}
                  variant="outline"
                  className="w-full"
                >
                  Ir para Login
                </Button>
              )}

              {isOffline && (
                <div className="flex items-center justify-center text-sm text-muted-foreground">
                  <Wifi className="h-4 w-4 mr-2" />
                  {navigator.onLine ? "Conectado" : "Desconectado"}
                </div>
              )}
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="text-left">
                  <summary className="text-sm text-muted-foreground cursor-pointer">
                    Detalhes do erro (desenvolvimento)
                  </summary>
                  <pre className="mt-2 text-xs bg-destructive/10 p-3 rounded overflow-auto max-h-32">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}