
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { Mail, Lock, User, Music, ArrowLeft } from 'lucide-react';
import { Navigate } from 'react-router-dom';


interface AuthProps {
  onBack?: () => void;
}

export default function Auth({ onBack }: AuthProps) {
  const { user, loading, signIn, signInWithGoogle, signUp } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [djName, setDjName] = useState('');
  

  // Redirect if already authenticated
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    await signIn(email, password);
    
    setIsSubmitting(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { error } = await signUp(email, password, djName);
      if (!error) {
        // Optional: switch to sign-in tab after sign up
        setActiveTab('signin');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      {onBack && (
        <div className="p-4">
          <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </div>
      )}

      {/* Auth Form */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo/Title */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center mb-2">
              <img
                src="/lovable-uploads/23e55981-72ea-4de5-a422-fa6833eeb2b0.png"
                alt="RemiXense"
                className="w-40 h-auto drop-shadow-lg"
              />
            </div>
            <p className="text-muted-foreground">
              Sua jornada musical começa aqui
            </p>
            <p className="text-xs text-warning mt-1">Fase Beta - Release Candidate</p>
          </div>

          <Card className="glass border-glass-border p-6">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'signin' | 'signup')}>
              <TabsList className="grid w-full grid-cols-2 glass mb-6">
                <TabsTrigger value="signin">Entrar</TabsTrigger>
                <TabsTrigger value="signup">Cadastrar</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email" className="text-foreground">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signin-password" className="text-foreground">
                      Senha
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signin-password"
                        type="password"
                        placeholder="senha"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="neon"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Entrando...' : 'Entrar'}
                  </Button>
                </form>
                <div className="mt-4 space-y-3">
                  <div className="text-center text-xs text-muted-foreground">ou</div>
                  <Button variant="outline" className="w-full" type="button" onClick={signInWithGoogle}>
                    <span className="mr-2 inline-flex">{/* Google Icon */}
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-4 w-4">
                        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12 s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C35.202,7.163,29.902,5,24,5C12.955,5,4,13.955,4,25 s8.955,20,20,20s20-8.955,20-20C44,23.659,43.862,21.822,43.611,20.083z"/>
                        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.817C14.475,16.042,18.884,13,24,13c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657 C35.202,7.163,29.902,5,24,5C16.318,5,9.656,9.337,6.306,14.691z"/>
                        <path fill="#4CAF50" d="M24,45c5.166,0,9.86-1.977,13.409-5.197l-6.192-5.238C29.211,36.091,26.715,37,24,37 c-5.202,0-9.623-3.317-11.285-7.946l-6.536,5.036C9.5,40.556,16.227,45,24,45z"/>
                        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.093,5.565 c0.001-0.001,0.002-0.001,0.003-0.002l6.192,5.238C36.969,39.682,44,34,44,25C44,23.659,43.862,21.822,43.611,20.083z"/>
                      </svg>
                    </span>
                    Continuar com Google
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-djname" className="text-foreground">
                      RemiXer
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-djname"
                        type="text"
                        placeholder="RemiXer Username"
                        value={djName}
                        onChange={(e) => setDjName(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-foreground">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-foreground">
                      Senha
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="senha"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="neon"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Criando conta...' : 'Criar conta'}
                  </Button>
                </form>
              </TabsContent>
              </Tabs>


              <div className="mt-6 pt-6 border-t border-glass-border">
                <p className="text-xs text-muted-foreground text-center">
                  Ao continuar, você concorda com nossos{' '}
                  <a href="#" className="text-primary hover:underline">Termos de Uso</a>{' '}e{' '}
                  <a href="#" className="text-primary hover:underline">Política de Privacidade</a>
                </p>
              </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
