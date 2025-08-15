import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Users, Search, Table, CheckCircle } from 'lucide-react';
import { AsyncMultiSelect, AsyncMultiSelectOption } from '@/components/ui/async-multi-select';
import { AccountsTable } from './AccountsTable';
import { AccountReputation } from './NumberValidationService';

interface AccountsSelectorProps {
  accounts: AccountReputation[];
  selectedAccounts: string[];
  onSelectionChange: (accountIds: string[]) => void;
  onSearch?: (query: string) => Promise<void>;
  loading?: boolean;
  className?: string;
}

export const AccountsSelector: React.FC<AccountsSelectorProps> = ({
  accounts,
  selectedAccounts,
  onSelectionChange,
  onSearch,
  loading = false,
  className
}) => {
  const [activeTab, setActiveTab] = useState('quick');
  const [searchQuery, setSearchQuery] = useState('');

  // Converter contas para formato do AsyncMultiSelect
  const accountOptions: AsyncMultiSelectOption[] = useMemo(() => {
    return accounts.map(account => ({
      value: account.accountId,
      label: account.accountName,
      description: account.phone,
      tags: account.tags,
      account // Manter referência completa para uso posterior
    }));
  }, [accounts]);

  // Contas selecionadas com detalhes
  const selectedAccountDetails = useMemo(() => {
    return accounts.filter(account => selectedAccounts.includes(account.accountId));
  }, [accounts, selectedAccounts]);

  // Função de busca para o AsyncMultiSelect
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (onSearch) {
      await onSearch(query);
    }
  };

  // Renderizar item selecionado customizado
  const renderSelectedAccount = (option: AsyncMultiSelectOption) => {
    const account = option.account as AccountReputation;
    return (
      <div className="flex items-center gap-2">
        <span className="truncate">{account.accountName}</span>
        <Badge 
          variant={
            account.reputation === 'excellent' ? 'default' :
            account.reputation === 'good' ? 'secondary' :
            account.reputation === 'fair' ? 'outline' : 'destructive'
          }
          className="text-xs"
        >
          {account.reputation === 'excellent' ? 'Excelente' :
           account.reputation === 'good' ? 'Boa' :
           account.reputation === 'fair' ? 'Regular' : 'Ruim'}
        </Badge>
      </div>
    );
  };

  // Estatísticas das contas selecionadas
  const selectionStats = useMemo(() => {
    const stats = {
      total: selectedAccounts.length,
      byReputation: {
        excellent: 0,
        good: 0,
        fair: 0,
        poor: 0
      },
      byStatus: {
        connected: 0,
        disconnected: 0
      },
      byTags: {} as Record<string, number>
    };

    selectedAccountDetails.forEach(account => {
      stats.byReputation[account.reputation]++;
      stats.byStatus[account.status]++;
      account.tags.forEach(tag => {
        stats.byTags[tag] = (stats.byTags[tag] || 0) + 1;
      });
    });

    return stats;
  }, [selectedAccountDetails]);

  return (
    <div className={className}>
      <Alert className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Ao selecionar múltiplas contas, os disparos serão distribuídos igualmente entre elas, 
          começando pela primeira conta selecionada.
        </AlertDescription>
      </Alert>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="quick" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Busca Rápida
          </TabsTrigger>
          <TabsTrigger value="table" className="flex items-center gap-2">
            <Table className="h-4 w-4" />
            Tabela Completa
          </TabsTrigger>
        </TabsList>

        <TabsContent value="quick" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Buscar e Selecionar Contas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AsyncMultiSelect
                options={accountOptions}
                selectedValues={selectedAccounts}
                onSelectionChange={onSelectionChange}
                onSearch={handleSearch}
                placeholder="Buscar contas por nome, telefone ou tag..."
                searchPlaceholder="Digite para buscar..."
                emptyMessage="Nenhuma conta encontrada. Tente ajustar a busca."
                loading={loading}
                maxDisplayedTags={5}
                renderSelectedItem={renderSelectedAccount}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="table" className="space-y-4">
          <AccountsTable
            accounts={accounts}
            selectedAccounts={selectedAccounts}
            onSelectionChange={onSelectionChange}
          />
        </TabsContent>
      </Tabs>

      {/* Resumo das Contas Selecionadas */}
      {selectedAccounts.length > 0 && (
        <Card className="mt-6 border-green-200 bg-green-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-5 w-5" />
              Contas Selecionadas ({selectionStats.total})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Distribuição por Reputação */}
              <div>
                <h4 className="font-medium text-sm mb-2">Por Reputação</h4>
                <div className="space-y-1">
                  {selectionStats.byReputation.excellent > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Excelente</span>
                      <Badge variant="default" className="text-xs">
                        {selectionStats.byReputation.excellent}
                      </Badge>
                    </div>
                  )}
                  {selectionStats.byReputation.good > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Boa</span>
                      <Badge variant="secondary" className="text-xs">
                        {selectionStats.byReputation.good}
                      </Badge>
                    </div>
                  )}
                  {selectionStats.byReputation.fair > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Regular</span>
                      <Badge variant="outline" className="text-xs">
                        {selectionStats.byReputation.fair}
                      </Badge>
                    </div>
                  )}
                  {selectionStats.byReputation.poor > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Ruim</span>
                      <Badge variant="destructive" className="text-xs">
                        {selectionStats.byReputation.poor}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>

              {/* Distribuição por Status */}
              <div>
                <h4 className="font-medium text-sm mb-2">Por Status</h4>
                <div className="space-y-1">
                  {selectionStats.byStatus.connected > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Conectado</span>
                      <Badge variant="default" className="text-xs">
                        {selectionStats.byStatus.connected}
                      </Badge>
                    </div>
                  )}
                  {selectionStats.byStatus.disconnected > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Desconectado</span>
                      <Badge variant="secondary" className="text-xs">
                        {selectionStats.byStatus.disconnected}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>

              {/* Top Tags */}
              <div>
                <h4 className="font-medium text-sm mb-2">Top Tags</h4>
                <div className="space-y-1">
                  {Object.entries(selectionStats.byTags)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5)
                    .map(([tag, count]) => (
                      <div key={tag} className="flex justify-between text-sm">
                        <span className="capitalize">{tag.replace('_', ' ')}</span>
                        <Badge variant="outline" className="text-xs">
                          {count}
                        </Badge>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Ações Rápidas */}
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Ações disponíveis para {selectionStats.total} conta(s)
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Aqui você pode implementar ações específicas
                      console.log('Ações para contas selecionadas:', selectedAccountDetails);
                    }}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Ver Detalhes
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
