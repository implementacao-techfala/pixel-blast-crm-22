import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle, ArrowRight } from 'lucide-react';

interface Step {
  id: number;
  title: string;
  description: string;
  isCompleted: boolean;
  isActive: boolean;
}

interface CampaignStepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  onStepClick?: (step: number) => void;
}

export const CampaignStepIndicator: React.FC<CampaignStepIndicatorProps> = ({
  currentStep,
  totalSteps,
  onStepClick
}) => {
  const steps: Step[] = [
    {
      id: 1,
      title: 'Informações Básicas',
      description: 'Nome, data e horário da campanha',
      isCompleted: currentStep > 1,
      isActive: currentStep === 1
    },
    {
      id: 2,
      title: 'Seleção de Público',
      description: 'Tags e contatos para envio',
      isCompleted: currentStep > 2,
      isActive: currentStep === 2
    },
    {
      id: 3,
      title: 'Configuração de Contas',
      description: 'Escolha das contas para envio',
      isCompleted: currentStep > 3,
      isActive: currentStep === 3
    },
    {
      id: 4,
      title: 'Sequências e Mídia',
      description: 'Conteúdo das mensagens',
      isCompleted: currentStep > 4,
      isActive: currentStep === 4
    },
    {
      id: 5,
      title: 'Configurações Avançadas',
      description: 'Delays e configurações finais',
      isCompleted: currentStep > 5,
      isActive: currentStep === 5
    },
    {
      id: 6,
      title: 'Revisão e Confirmação',
      description: 'Validação final da campanha',
      isCompleted: currentStep > 6,
      isActive: currentStep === 6
    }
  ];

  const visibleSteps = steps.slice(0, totalSteps);

  return (
    <div className="w-full bg-card/50 backdrop-blur-sm border-b border-cyber-border p-4">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        {visibleSteps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div 
              className={`flex items-center gap-3 cursor-pointer transition-all ${
                onStepClick ? 'hover:scale-105' : ''
              } ${step.isActive ? 'opacity-100' : step.isCompleted ? 'opacity-90' : 'opacity-60'}`}
              onClick={() => onStepClick?.(step.id)}
            >
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                step.isCompleted 
                  ? 'bg-cyber-green border-cyber-green text-cyber-surface' 
                  : step.isActive 
                    ? 'bg-cyber-surface border-cyber-purple text-cyber-purple' 
                    : 'bg-transparent border-cyber-border text-muted-foreground'
              }`}>
                {step.isCompleted ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <span className="text-sm font-semibold">{step.id}</span>
                )}
              </div>
              
              <div className="text-left">
                <p className={`text-sm font-medium ${
                  step.isActive ? 'text-cyber-purple' : step.isCompleted ? 'text-cyber-green' : 'text-muted-foreground'
                }`}>
                  {step.title}
                </p>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  {step.description}
                </p>
              </div>
            </div>
            
            {index < visibleSteps.length - 1 && (
              <ArrowRight className={`h-4 w-4 transition-colors ${
                step.isCompleted ? 'text-cyber-green' : 'text-muted-foreground'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>
      
      <div className="mt-4 max-w-4xl mx-auto">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Etapa {currentStep} de {totalSteps}</span>
          <Badge variant="outline" className="bg-cyber-surface text-cyber-green border-cyber-border">
            {Math.round((currentStep / totalSteps) * 100)}% concluído
          </Badge>
        </div>
        
        <div className="w-full bg-cyber-border rounded-full h-1 mt-2">
          <div 
            className="bg-gradient-to-r from-cyber-purple to-cyber-green h-1 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};