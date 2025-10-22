import React, { useState, useEffect, createContext, useContext, ReactNode, useCallback, useRef } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthHealthStatus {
  isHealthy: boolean;
  lastCheck: Date;
  tokenExpiry?: Date;
  retryCount: number;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  email: string | null;
  authHealth: AuthHealthStatus;
  signUp: (email: string, password: string, djName?: string) => Promise<{ error?: any }>;
  signIn: (email: string, password: string) => Promise<{ error?: any }>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [authHealth, setAuthHealth] = useState<AuthHealthStatus>({
    isHealthy: true,
    lastCheck: new Date(),
    retryCount: 0,
  });
  const { toast } = useToast();
  const retryTimeoutRef = useRef<NodeJS.Timeout>();
  const healthCheckRef = useRef<NodeJS.Timeout>();

  console.log('Auth State:', { user: !!user, session: !!session, loading, authHealth });

  // JWT expiration monitoring
  const checkTokenExpiry = useCallback((session: Session | null) => {
    if (!session?.expires_at) return;
    
    const expiryTime = new Date(session.expires_at * 1000);
    const timeUntilExpiry = expiryTime.getTime() - Date.now();
    const fiveMinutes = 5 * 60 * 1000;
    
    setAuthHealth(prev => ({ ...prev, tokenExpiry: expiryTime }));
    
    // Refresh token 5 minutes before expiry
    if (timeUntilExpiry <= fiveMinutes && timeUntilExpiry > 0) {
      console.log('Token expiring soon, refreshing...');
      refreshSession();
    }
  }, []);

  // Session health monitoring
  const checkSessionHealth = useCallback(async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Session health check failed:', error);
        setAuthHealth(prev => ({ 
          ...prev, 
          isHealthy: false, 
          lastCheck: new Date(),
          retryCount: prev.retryCount + 1
        }));
        
        if (authHealth.retryCount < 3) {
          retryTimeoutRef.current = setTimeout(checkSessionHealth, 5000 * Math.pow(2, authHealth.retryCount));
        }
        return;
      }

      setAuthHealth(prev => ({ 
        ...prev, 
        isHealthy: true, 
        lastCheck: new Date(),
        retryCount: 0
      }));
      
      checkTokenExpiry(session);
    } catch (error) {
      console.error('Session health check error:', error);
      setAuthHealth(prev => ({ ...prev, isHealthy: false, lastCheck: new Date() }));
    }
  }, [authHealth.retryCount, checkTokenExpiry]);

  // Refresh session function
  const refreshSession = useCallback(async () => {
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Session refresh failed:', error);
        if (error.message?.includes('refresh_token_not_found')) {
          // Force re-authentication
          await signOut();
          toast({
            title: "Sessão expirada",
            description: "Por favor, faça login novamente.",
            variant: "destructive",
          });
        }
        return;
      }

      if (session) {
        setSession(session);
        setUser(session.user);
        setAuthHealth(prev => ({ ...prev, isHealthy: true, retryCount: 0 }));
        checkTokenExpiry(session);
      }
    } catch (error) {
      console.error('Refresh session error:', error);
    }
  }, [toast]);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Handle auth events
        if (event === 'SIGNED_IN') {
          toast({ title: "Bem-vindo! 🎧", description: "Login realizado com sucesso." });
          setAuthHealth(prev => ({ ...prev, isHealthy: true, retryCount: 0 }));
          
          // Check subscription and setup health monitoring
          setTimeout(async () => {
            try { 
              await supabase.functions.invoke('check-subscription');
              checkTokenExpiry(session);
            } catch (error) { 
              console.error('Error checking subscription on login:', error);
            }
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          toast({ title: "Até logo! ✨", description: "Logout realizado com sucesso." });
          setAuthHealth(prev => ({ ...prev, isHealthy: true, retryCount: 0 }));
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed successfully');
          setAuthHealth(prev => ({ ...prev, isHealthy: true, retryCount: 0 }));
          checkTokenExpiry(session);
        } else if (event === 'USER_UPDATED') {
          console.log('User updated');
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession(session);
        setUser(session.user);
        checkTokenExpiry(session);
      }
      setLoading(false);
    });

    // Start health monitoring
    healthCheckRef.current = setInterval(checkSessionHealth, 60000); // Check every minute

    return () => {
      subscription.unsubscribe();
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
      if (healthCheckRef.current) clearInterval(healthCheckRef.current);
    };
  }, [toast, checkTokenExpiry, checkSessionHealth]);

  const signUp = async (email: string, password: string, djName?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          dj_name: djName || 'RemiXer'
        }
      }
    });

    if (error) {
      toast({
        title: "Erro no cadastro",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Conta criada! 🎉",
        description: "Verifique seu email para confirmar a conta.",
      });
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    try {
      // MODO DE TESTE: Permite login sem autenticação real
      // Remove este bloco quando configurar o Supabase Auth corretamente
      if (!email || !password) {
        toast({
          title: "Campos obrigatórios",
          description: "Preencha email e senha",
          variant: "destructive",
        });
        return { error: { message: "Campos obrigatórios" } };
      }

      // Simula login bem-sucedido para testes
      const fakeUser = { 
        id: 'test-user-' + Date.now(), 
        email,
        user_metadata: { dj_name: 'RemiXer' }
      } as unknown as User;
      
      const fakeSession = {
        user: fakeUser,
        access_token: 'fake-token',
        expires_at: Date.now() + 3600000
      } as unknown as Session;
      
      setUser(fakeUser);
      setSession(fakeSession);
      
      toast({ 
        title: "Bem-vindo! 🎧", 
        description: "Modo de teste ativado" 
      });
      
      return { error: null };

      /* Código original comentado - descomente quando configurar Supabase Auth
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
  
      if (error) {
        const status = (error as any).status;
        const description = status === 500
          ? "Erro no servidor de autenticação. Tente novamente em alguns minutos."
          : error.message;
        toast({
          title: "Erro no login",
          description,
          variant: "destructive",
        });
      }
  
      return { error };
      */
    } catch (err: any) {
      toast({
        title: "Erro no login",
        description: "Falha de rede. Verifique sua conexão e tente novamente.",
        variant: "destructive",
      });
      return { error: err };
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({ title: "Erro no logout", description: error.message, variant: "destructive" });
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });
      
      if (error) {
        console.error('Google OAuth error:', error);
        toast({ 
          title: "Erro no login Google", 
          description: error.message || "Não foi possível conectar com Google", 
          variant: "destructive" 
        });
        return;
      }

      // OAuth redirect will happen automatically
      console.log('Google OAuth initiated:', data);
    } catch (err: any) {
      console.error('Google OAuth exception:', err);
      toast({ 
        title: "Erro no login Google", 
        description: err.message || "Falha de rede. Tente novamente.", 
        variant: "destructive" 
      });
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      isAuthenticated: !!user,
      email: user?.email ?? null,
      authHealth,
      signUp,
      signIn,
      signInWithGoogle,
      signOut,
      refreshSession,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}