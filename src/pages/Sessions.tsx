import { SessionHistory } from "@/components/SessionHistory";

const Sessions = () => {
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              Sessões RemiXer
            </h1>
            <p className="text-muted-foreground text-sm">
              Histórico e análise das suas mixagens
            </p>
          </div>

          {/* Histórico de Sessões */}
          <SessionHistory />
        </div>
      </div>
    </div>
  );
};

export default Sessions;