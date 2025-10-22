import { useState } from "react";

const steps = [
  "Escolha seu estilo musical",
  "Adicione suas redes sociais",
  "Conecte sua wallet (opcional)",
  "Configure preferências de IA",
];

export function OnboardingSteps({ onComplete }: { onComplete: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);

  const next = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="bg-card p-6 rounded-xl shadow-md w-full max-w-md text-center">
        <h2 className="text-xl font-bold mb-4">Bem-vindo ao RemiXense</h2>
        <p className="mb-6">{steps[currentStep]}</p>
        <button
          className="bg-primary text-white py-2 px-4 rounded hover:bg-primary/90 transition"
          onClick={next}
        >
          {currentStep === steps.length - 1 ? "Concluir" : "Próximo"}
        </button>
      </div>
      <div className="flex mt-4 gap-2">
        {steps.map((_, index) => (
          <div
            key={index}
            className={`h-2 w-2 rounded-full ${
              index <= currentStep ? "bg-primary" : "bg-muted"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
