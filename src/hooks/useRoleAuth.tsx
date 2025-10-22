
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type UserRole = 'user' | 'admin';

interface Profile {
  id: string;
  username: string;
  avatar_url?: string;
  plan: string;
  subscription_plan: string;
  credits_remaining: number;
  role?: UserRole;
}

interface RoleAuthContextType {
  profile: Profile | null;
  loading: boolean;
  isAdmin: boolean;
  refreshProfile: () => Promise<void>;
}

const RoleAuthContext = createContext<RoleAuthContextType | undefined>(undefined);

interface RoleAuthProviderProps {
  children: ReactNode;
}

export function RoleAuthProvider({ children }: RoleAuthProviderProps) {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const refreshProfile = async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      // Check if user profile exists
      const { data: existingProfile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      // Determine role based on database admin_users table (server-side verification)
      const { data: adminData } = await supabase
        .from('admin_users')
        .select('id')
        .eq('email', user.email || '')
        .maybeSingle();
      
      const role: UserRole = adminData ? 'admin' : 'user';

      if (!existingProfile) {
        // Create profile for new user
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            username: user.email?.split('@')[0] || 'User',
            plan: 'free',
            subscription_plan: 'free',
            credits_remaining: 100
          })
          .select()
          .single();

        if (insertError) throw insertError;

        setProfile({ ...newProfile, role });
      } else {
        setProfile({ ...existingProfile, role });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Erro ao carregar perfil",
        description: "Não foi possível carregar as informações do usuário.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      refreshProfile();
    }
  }, [user, authLoading]);

  const isAdmin = profile?.role === 'admin';

  return (
    <RoleAuthContext.Provider value={{
      profile,
      loading: loading || authLoading,
      isAdmin,
      refreshProfile
    }}>
      {children}
    </RoleAuthContext.Provider>
  );
}

export function useRoleAuth() {
  const context = useContext(RoleAuthContext);
  if (context === undefined) {
    throw new Error('useRoleAuth must be used within a RoleAuthProvider');
  }
  return context;
}
