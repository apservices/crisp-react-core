import { supabase } from '@/integrations/supabase/client';

export async function bootAuth() {
  try {
    // Tenta obter/validar a sessão atual
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;

    // (Opcional) ouça mudanças de auth para depurar
    supabase.auth.onAuthStateChange((event) => {
      // console.log('auth event', event);
    });
  } catch {
    // Se o token estiver corrompido (ex.: refresh inválido), limpa e segue
    await supabase.auth.signOut();
  }
}
