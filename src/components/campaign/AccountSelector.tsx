import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronLeft, ChevronRight, Users, MessageSquare, TrendingUp, Shield, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Account {
  id: string;
  name: string;
  phone: string;
  status: 'connected' | 'disconnected' | 'warning';
  reputation: {
    score: number;
    responseRate: number;
    deliveryRate: number;
    blockRate: number;
    totalMessagesSent: number;
    recentContacts: { contactId: string; lastContact: string; contactName: string }[];
  };
}

interface AccountSelectorProps {
  accounts: Account[];
  selectedAccounts: string[];
  onAccountsChange: (accounts: string[]) => void;
  totalLeads: number;
  onLeadDistributionCalculated: (distribution: { accountId: string; accountName: string; leads: number }[]) => void;
}

export const AccountSelector: React.FC<AccountSelectorProps> = ({
  accounts,
  selectedAccounts,
  onAccountsChange,
  totalLeads,
  onLeadDistributionCalculated
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const accountsPerPage = 2; // Reduzido para deixar menos itens por página
  
  const totalPages = Math.ceil(accounts.length / accountsPerPage);
  const startIndex = (currentPage - 1) * accountsPerPage;
  const currentAccounts = accounts.slice(startIndex, startIndex + accountsPerPage);

  const getReputationColor = (score: number) => {
    if (score >= 80) return 'text-cyber-green';
    if (score >= 60) return 'text-cyber-blue';
    if (score >= 40) return 'text-cyber-yellow';
    return 'text-destructive';
  };

  const getReputationText = (score: number) => {
    if (score >= 80) return 'Excelente';
    if (score >= 60) return 'Boa';
    if (score >= 40) return 'Regular';
    return 'Ruim';
  };

  const calculateLeadDistribution = () => {
    const selectedAccountsList = accounts.filter(acc => selectedAccounts.includes(acc.id));
    if (selectedAccountsList.length === 0) return [];

    const leadsPerAccount = Math.floor(totalLeads / selectedAccountsList.length);
    const remainder = totalLeads % selectedAccountsList.length;

    return selectedAccountsList.map((account, index) => ({
      accountId: account.id,
      accountName: account.name,
      leads: leadsPerAccount + (index < remainder ? 1 : 0)
    }));
  };

  const distribution = calculateLeadDistribution();
  
  React.useEffect(() => {
    onLeadDistributionCalculated(distribution);
  }, [selectedAccounts, totalLeads]);

  const toggleAccount = (accountId: string) => {
    const newSelected = selectedAccounts.includes(accountId)
      ? selectedAccounts.filter(id => id !== accountId)
      : [...selectedAccounts, accountId];
    onAccountsChange(newSelected);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Seleção de Contas</h3>
          <p className="text-sm text-muted-foreground">
            Escolha as contas que enviarão as mensagens ({selectedAccounts.length} selecionada(s))
          </p>
        </div>
        
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="border-cyber-border hover:border-cyber-purple"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <span className="text-sm text-muted-foreground">
              {currentPage} de {totalPages}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="border-cyber-border hover:border-cyber-purple"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Resumo de Distribuição */}
      {selectedAccounts.length > 0 && totalLeads > 0 && (
        <Alert className="border-cyber-border bg-cyber-surface/30">
          <Users className="h-4 w-4" />
          <AlertDescription>
            <strong>Distribuição de Leads:</strong> {totalLeads} leads serão divididos entre {selectedAccounts.length} conta(s).
            <div className="mt-2 space-y-1">
              {distribution.map(item => (
                <div key={item.accountId} className="text-sm">
                  • <strong>{item.accountName}:</strong> {item.leads} leads
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-4">
        {currentAccounts.map((account) => {
          const isSelected = selectedAccounts.includes(account.id);
          return (
            <Card 
              key={account.id}
              className={`border-cyber-border cursor-pointer transition-all hover:border-cyber-green/50 ${
                isSelected ? 'border-cyber-green bg-cyber-surface/20' : ''
              } ${account.reputation.score < 40 ? 'opacity-75' : ''}`}
              onClick={() => toggleAccount(account.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox 
                      checked={isSelected}
                      onChange={() => toggleAccount(account.id)}
                      className="border-cyber-border"
                    />
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        {account.name}
                        <Badge variant="outline" className="text-xs">
                          {account.phone}
                        </Badge>
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Status: <span className={account.status === 'connected' ? 'text-cyber-green' : 'text-destructive'}>
                          {account.status === 'connected' ? 'Conectada' : 'Desconectada'}
                        </span>
                      </p>
                    </div>
                  </div>
                  
                  <Badge className={`${getReputationColor(account.reputation.score)} border-current`}>
                    <Shield className="h-3 w-3 mr-1" />
                    {getReputationText(account.reputation.score)}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <MessageSquare className="h-4 w-4 text-cyber-blue mr-1" />
                      <span className="font-medium">{account.reputation.responseRate}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Taxa de Resposta</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <TrendingUp className="h-4 w-4 text-cyber-green mr-1" />
                      <span className="font-medium">{account.reputation.deliveryRate}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Taxa de Entrega</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <AlertTriangle className="h-4 w-4 text-destructive mr-1" />
                      <span className="font-medium">{account.reputation.blockRate}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Taxa de Bloqueio</p>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground space-y-1">
                  <div className="flex justify-between">
                    <span>Mensagens enviadas:</span>
                    <span className="font-medium">{account.reputation.totalMessagesSent.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Contatos recentes:</span>
                    <span className="font-medium">{account.reputation.recentContacts.length}</span>
                  </div>
                </div>

                {account.reputation.score < 40 && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-md p-2">
                    <p className="text-xs text-destructive">
                      ⚠️ Conta com reputação baixa. Uso não recomendado para campanhas importantes.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};