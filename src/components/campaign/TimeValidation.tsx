import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Clock } from 'lucide-react';

interface TimeValidationProps {
  schedules: Array<{ date: string; time: string }>;
}

export const TimeValidation: React.FC<TimeValidationProps> = ({ schedules }) => {
  const validateScheduleTime = (time: string): { isValid: boolean; warning?: string } => {
    const hour = parseInt(time.split(':')[0]);
    
    // Check for problematic hours
    if (hour >= 0 && hour <= 6) {
      return {
        isValid: false,
        warning: `${time} é muito cedo (madrugada). Isso pode irritar seus contatos e prejudicar a reputação da conta.`
      };
    }
    
    if (hour >= 22) {
      return {
        isValid: false,
        warning: `${time} é muito tarde. Recomendamos envios entre 8h e 21h para melhor recepção.`
      };
    }
    
    if (hour >= 12 && hour <= 14) {
      return {
        isValid: true,
        warning: `${time} é horário de almoço. Considere que as taxas de resposta podem ser menores.`
      };
    }
    
    return { isValid: true };
  };

  const timeValidations = schedules
    .filter(schedule => schedule.time)
    .map(schedule => ({
      ...schedule,
      validation: validateScheduleTime(schedule.time)
    }));

  const hasErrors = timeValidations.some(tv => !tv.validation.isValid);
  const hasWarnings = timeValidations.some(tv => tv.validation.warning && tv.validation.isValid);

  if (!hasErrors && !hasWarnings) {
    return null;
  }

  return (
    <div className="space-y-2">
      {timeValidations.map((tv, index) => (
        tv.validation.warning && (
          <Alert key={index} className={tv.validation.isValid ? "border-amber-500" : "border-destructive"}>
            {tv.validation.isValid ? (
              <Clock className="h-4 w-4 text-amber-500" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-destructive" />
            )}
            <AlertDescription className={tv.validation.isValid ? "text-amber-700 dark:text-amber-400" : "text-destructive"}>
              <strong>Data {new Date(tv.date).toLocaleDateString('pt-BR')}:</strong> {tv.validation.warning}
            </AlertDescription>
          </Alert>
        )
      ))}
      
      {hasErrors && (
        <Alert className="border-destructive">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <AlertDescription className="text-destructive">
            <strong>Atenção:</strong> Horários inadequados foram detectados. Ajuste os horários para continuar.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export const getOptimalSendingHours = (): string[] => {
  return [
    '08:00', '09:00', '10:00', '11:00',
    '15:00', '16:00', '17:00', '18:00',
    '19:00', '20:00'
  ];
};

export const isOptimalHour = (time: string): boolean => {
  return getOptimalSendingHours().includes(time);
};