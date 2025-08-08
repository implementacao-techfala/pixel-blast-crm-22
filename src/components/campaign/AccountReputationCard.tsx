import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, AlertTriangle, XCircle, TrendingUp, TrendingDown, Users, MessageSquare, Shield } from 'lucide-react';
import { AccountReputation } from './NumberValidationService';

interface AccountReputationCardProps {
  reputation: AccountReputation;
  isSelected?: boolean;
  onSelect?: (accountId: string) => void;
}

export const AccountReputationCard: React.FC<AccountReputationCardProps> = ({ 
  reputation, 
  isSelected = false, 
  onSelect 
}) => {
  const getReputationIcon = (rep: string) => {
    switch (rep) {
      case 'excellent':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'good':
        return <TrendingUp className="h-5 w-5 text-blue-500" />;
      case 'fair':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'poor':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Shield className="h-5 w-5 text-gray-500" />;
    }
  };

  const getReputationColor = (rep: string) => {
    switch (rep) {
      case 'excellent':
        return 'bg-green-500/20 text-green-700 border-green-500/50';
      case 'good':
        return 'bg-blue-500/20 text-blue-700 border-blue-500/50';
      case 'fair':
        return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/50';
      case 'poor':
        return 'bg-red-500/20 text-red-700 border-red-500/50';
      default:
        return 'bg-gray-500/20 text-gray-700 border-gray-500/50';
    }
  };

  const getReputationText = (rep: string) => {
    switch (rep) {
      case 'excellent':
        return 'Excelente';
      case 'good':
        return 'Boa';
      case 'fair':
        return 'Regular';
      case 'poor':
        return 'Ruim';
      default:
        return 'Desconhecida';
    }
  };

  const handleClick = () => {
    if (onSelect) {
      onSelect(reputation.accountId);
    }
  };

  return (
    <Card 
      className={`border-cyber-border cursor-pointer transition-all hover:border-cyber-green/50 ${
        isSelected ? 'border-cyber-green bg-cyber-surface/20' : ''
      } ${reputation.reputation === 'poor' ? 'opacity-60' : ''}`}
      onClick={handleClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            {getReputationIcon(reputation.reputation)}
            {reputation.accountName}
          </CardTitle>
          <Badge className={getReputationColor(reputation.reputation)}>
            {getReputationText(reputation.reputation)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <MessageSquare className="h-4 w-4 text-cyber-blue mr-1" />
              <span className="font-medium">{reputation.responseRate}%</span>
            </div>
            <p className="text-xs text-muted-foreground">Taxa de Resposta</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <TrendingUp className="h-4 w-4 text-cyber-green mr-1" />
              <span className="font-medium">{reputation.deliveryRate}%</span>
            </div>
            <p className="text-xs text-muted-foreground">Taxa de Entrega</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Shield className="h-4 w-4 text-destructive mr-1" />
              <span className="font-medium">{reputation.blockRate}%</span>
            </div>
            <p className="text-xs text-muted-foreground">Taxa de Bloqueio</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Entrega</span>
            <span>{reputation.deliveryRate}%</span>
          </div>
          <Progress value={reputation.deliveryRate} className="h-2" />
        </div>

        <div className="text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>Mensagens enviadas:</span>
            <span className="font-medium">{reputation.totalMessagesSent.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Mensagens entregues:</span>
            <span className="font-medium">{reputation.totalMessagesDelivered.toLocaleString()}</span>
          </div>
        </div>

        {reputation.reputation === 'poor' && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-md p-2">
            <p className="text-xs text-red-600 dark:text-red-400">
              ⚠️ Conta com reputação ruim. Uso não recomendado para campanhas importantes.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};