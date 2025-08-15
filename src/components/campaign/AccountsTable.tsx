import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  Users, 
  Filter, 
  CheckSquare, 
  Square, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Shield,
  Phone,
  Tag,
  Search,
  X
} from 'lucide-react';
import { AccountReputation } from './NumberValidationService';
import { FixedSizeList as List } from 'react-window';

interface AccountsTableProps {
  accounts: AccountReputation[];
  selectedAccounts: string[];
  onSelectionChange: (accountIds: string[]) => void;
  className?: string;
}

interface FilterState {
  search: string;
  tags: string[];
  status: string[];
  reputation: string[];
}

const ITEM_HEIGHT = 80; // Altura de cada linha da tabela

export const AccountsTable: React.FC<AccountsTableProps> = ({
  accounts,
  selectedAccounts,
  onSelectionChange,
  className
}) => {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    tags: [],
    status: [],
    reputation: []
  });
  const [showFilters, setShowFilters] = useState(false);

  // Extrair opções únicas para filtros
  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    accounts.forEach(account => {
      account.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [accounts]);

  const availableStatuses = useMemo(() => {
    const statuses = new Set<string>();
    accounts.forEach(account => statuses.add(account.status));
    return Array.from(statuses).sort();
  }, [accounts]);

  const availableReputations = useMemo(() => {
    const reputations = new Set<string>();
    accounts.forEach(account => reputations.add(account.reputation));
    return Array.from(reputations).sort();
  }, [accounts]);

  // Aplicar filtros
  const filteredAccounts = useMemo(() => {
    return accounts.filter(account => {
      // Filtro de busca
      if (filters.search && !account.accountName.toLowerCase().includes(filters.search.toLowerCase()) &&
          !account.phone.includes(filters.search)) {
        return false;
      }

      // Filtro de tags
      if (filters.tags.length > 0 && !filters.tags.some(tag => account.tags.includes(tag))) {
        return false;
      }

      // Filtro de status
      if (filters.status.length > 0 && !filters.status.includes(account.status)) {
        return false;
      }

      // Filtro de reputação
      if (filters.reputation.length > 0 && !filters.reputation.includes(account.reputation)) {
        return false;
      }

      return true;
    });
  }, [accounts, filters]);

  // Ações de seleção em massa
  const selectAllFiltered = () => {
    const filteredIds = filteredAccounts.map(account => account.accountId);
    const newSelection = [...new Set([...selectedAccounts, ...filteredIds])];
    onSelectionChange(newSelection);
  };

  const deselectAllFiltered = () => {
    const filteredIds = filteredAccounts.map(account => account.accountId);
    const newSelection = selectedAccounts.filter(id => !filteredIds.includes(id));
    onSelectionChange(newSelection);
  };

  const selectByTag = (tag: string) => {
    const accountsWithTag = accounts.filter(account => account.tags.includes(tag));
    const accountIds = accountsWithTag.map(account => account.accountId);
    const newSelection = [...new Set([...selectedAccounts, ...accountIds])];
    onSelectionChange(newSelection);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      tags: [],
      status: [],
      reputation: []
    });
  };

  const toggleAccountSelection = (accountId: string) => {
    const newSelection = selectedAccounts.includes(accountId)
      ? selectedAccounts.filter(id => id !== accountId)
      : [...selectedAccounts, accountId];
    onSelectionChange(newSelection);
  };

  // Renderizar linha da tabela
  const renderRow = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const account = filteredAccounts[index];
    if (!account) return null;

    const isSelected = selectedAccounts.includes(account.accountId);

    return (
      <div style={style} className="flex items-center p-3 border-b border-border hover:bg-muted/50">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => toggleAccountSelection(account.accountId)}
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium truncate">{account.accountName}</span>
              <Badge variant={account.status === 'connected' ? 'default' : 'secondary'}>
                {account.status === 'connected' ? 'Conectado' : 'Desconectado'}
              </Badge>
              <Badge 
                variant={
                  account.reputation === 'excellent' ? 'default' :
                  account.reputation === 'good' ? 'secondary' :
                  account.reputation === 'fair' ? 'outline' : 'destructive'
                }
              >
                {account.reputation === 'excellent' ? 'Excelente' :
                 account.reputation === 'good' ? 'Boa' :
                 account.reputation === 'fair' ? 'Regular' : 'Ruim'}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-3 w-3" />
              <span className="truncate">{account.phone}</span>
            </div>
            
            {account.tags.length > 0 && (
              <div className="flex items-center gap-1 mt-1">
                <Tag className="h-3 w-3 text-muted-foreground" />
                {account.tags.slice(0, 3).map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {account.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{account.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Contas Disponíveis ({filteredAccounts.length})
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
            
            {filteredAccounts.length > 0 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectAllFiltered}
                  disabled={filteredAccounts.every(acc => selectedAccounts.includes(acc.accountId))}
                >
                  <CheckSquare className="h-4 w-4 mr-2" />
                  Selecionar Todas
                </Button>
                
                {filteredAccounts.some(acc => selectedAccounts.includes(acc.accountId)) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={deselectAllFiltered}
                  >
                    <Square className="h-4 w-4 mr-2" />
                    Desmarcar Todas
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Filtros */}
        {showFilters && (
          <div className="space-y-4 pt-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="search">Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Nome ou telefone..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="pl-8"
                  />
                </div>
              </div>

              <div>
                <Label>Tags</Label>
                <Select
                  value=""
                  onValueChange={(value) => {
                    if (value && !filters.tags.includes(value)) {
                      setFilters(prev => ({ ...prev, tags: [...prev.tags, value] }));
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Adicionar tag..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTags.map(tag => (
                      <SelectItem key={tag} value={tag}>
                        {tag}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {filters.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {filters.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                        <button
                          type="button"
                          onClick={() => setFilters(prev => ({ 
                            ...prev, 
                            tags: prev.tags.filter(t => t !== tag) 
                          }))}
                          className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <Label>Status</Label>
                <Select
                  value=""
                  onValueChange={(value) => {
                    if (value && !filters.status.includes(value)) {
                      setFilters(prev => ({ ...prev, status: [...prev.status, value] }));
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Adicionar status..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableStatuses.map(status => (
                      <SelectItem key={status} value={status}>
                        {status === 'connected' ? 'Conectado' : 'Desconectado'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {filters.status.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {filters.status.map(status => (
                      <Badge key={status} variant="secondary" className="text-xs">
                        {status === 'connected' ? 'Conectado' : 'Desconectado'}
                        <button
                          type="button"
                          onClick={() => setFilters(prev => ({ 
                            ...prev, 
                            status: prev.status.filter(s => s !== status) 
                          }))}
                          className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <Label>Reputação</Label>
                <Select
                  value=""
                  onValueChange={(value) => {
                    if (value && !filters.reputation.includes(value)) {
                      setFilters(prev => ({ ...prev, reputation: [...prev.reputation, value] }));
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Adicionar reputação..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableReputations.map(reputation => (
                      <SelectItem key={reputation} value={reputation}>
                        {reputation === 'excellent' ? 'Excelente' :
                         reputation === 'good' ? 'Boa' :
                         reputation === 'fair' ? 'Regular' : 'Ruim'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {filters.reputation.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {filters.reputation.map(reputation => (
                      <Badge key={reputation} variant="secondary" className="text-xs">
                        {reputation === 'excellent' ? 'Excelente' :
                         reputation === 'good' ? 'Boa' :
                         reputation === 'fair' ? 'Regular' : 'Ruim'}
                        <button
                          type="button"
                          onClick={() => setFilters(prev => ({ 
                            ...prev, 
                            reputation: prev.reputation.filter(r => r !== reputation) 
                          }))}
                          className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {filters.tags.length + filters.status.length + filters.reputation.length} filtros ativos
                </span>
                {(filters.search || filters.tags.length > 0 || filters.status.length > 0 || filters.reputation.length > 0) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                  >
                    Limpar filtros
                  </Button>
                )}
              </div>

              {/* Ações rápidas por tag */}
              {availableTags.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Ações rápidas:</span>
                  {availableTags.slice(0, 5).map(tag => (
                    <Button
                      key={tag}
                      variant="outline"
                      size="sm"
                      onClick={() => selectByTag(tag)}
                      className="text-xs"
                    >
                      Selecionar {tag}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        {filteredAccounts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma conta encontrada com os filtros aplicados.</p>
            <p className="text-sm">Tente ajustar os filtros ou limpar a busca.</p>
          </div>
        ) : (
          <div className="border-t">
            <List
              height={Math.min(400, filteredAccounts.length * ITEM_HEIGHT)}
              itemCount={filteredAccounts.length}
              itemSize={ITEM_HEIGHT}
              width="100%"
            >
              {renderRow}
            </List>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
