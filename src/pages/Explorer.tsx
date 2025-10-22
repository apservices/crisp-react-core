import ComprehensiveDashboard from '@/components/ComprehensiveDashboard';

export default function Explorer() {
  console.log('Explorer page rendered');
  
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="px-4 py-6">
          <h1 className="text-3xl font-bold text-foreground">
            Dashboard Explorer
          </h1>
          <p className="text-muted-foreground text-base mt-2">
            Análise completa dos seus dados musicais
          </p>
        </div>
      </div>
      
      <div className="px-4 py-6">
        <ComprehensiveDashboard />
      </div>
    </div>
  );
}
