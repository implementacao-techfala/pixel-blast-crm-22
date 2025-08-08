import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Clock, Phone, User } from 'lucide-react';

interface ContactWarning {
  contactId: string;
  contactName: string;
  contactPhone: string;
  lastContactDate: string;
  contactedByAccounts: {
    accountId: string;
    accountName: string;
    lastContact: string;
  }[];
  hoursAgo: number;
}

interface ContactWarningSystemProps {
  selectedAccounts: string[];
  selectedTags: string[];
  warnings: ContactWarning[];
  onWarningsCalculated: (warnings: ContactWarning[]) => void;
}

export const ContactWarningSystem: React.FC<ContactWarningSystemProps> = ({
  selectedAccounts,
  selectedTags,
  warnings,
  onWarningsCalculated
}) => {
  // Simular verificação de contatos que receberam mensagens recentemente
  React.useEffect(() => {
    const checkRecentContacts = async () => {
      // Simular API call para verificar contatos recentes
      const mockWarnings: ContactWarning[] = [
        {
          contactId: '1',
          contactName: 'João Silva',
          contactPhone: '+55 11 99999-1234',
          lastContactDate: '2024-01-15T14:30:00Z',
          hoursAgo: 2,
          contactedByAccounts: [
            {
              accountId: '1',
              accountName: 'Conta Principal',
              lastContact: '2024-01-15T14:30:00Z'
            }
          ]
        },
        {
          contactId: '2',
          contactName: 'Maria Santos',
          contactPhone: '+55 11 88888-5678',
          lastContactDate: '2024-01-15T10:15:00Z',
          hoursAgo: 6,
          contactedByAccounts: [
            {
              accountId: '2',
              accountName: 'Suporte',
              lastContact: '2024-01-15T10:15:00Z'
            },
            {
              accountId: '1',
              accountName: 'Conta Principal',
              lastContact: '2024-01-14T16:20:00Z'
            }
          ]
        }
      ];

      // Filtrar warnings baseado nas contas e tags selecionadas
      if (selectedAccounts.length > 0 && selectedTags.length > 0) {
        const filteredWarnings = mockWarnings.filter(warning => 
          warning.contactedByAccounts.some(contact => 
            selectedAccounts.includes(contact.accountId)
          )
        );
        onWarningsCalculated(filteredWarnings);
      } else {
        onWarningsCalculated([]);
      }
    };

    if (selectedAccounts.length > 0 && selectedTags.length > 0) {
      checkRecentContacts();
    }
  }, [selectedAccounts, selectedTags, onWarningsCalculated]);

  if (warnings.length === 0) {
    return null;
  }

  const getWarningLevel = (hoursAgo: number) => {
    if (hoursAgo < 24) return { level: 'high', color: 'bg-destructive/10 border-destructive/20 text-destructive', text: 'Crítico' };
    if (hoursAgo < 72) return { level: 'medium', color: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-600', text: 'Atenção' };
    return { level: 'low', color: 'bg-blue-500/10 border-blue-500/20 text-blue-600', text: 'Informativo' };
  };

  return (
    <Card className="border-cyber-border">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
          Avisos de Contatos Recentes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="border-yellow-500/20 bg-yellow-500/10">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Detectamos {warnings.length} contato(s)</strong> que receberam mensagens recentemente das contas selecionadas.
            Considere ajustar a seleção para evitar spam.
          </AlertDescription>
        </Alert>

        <div className="space-y-3 max-h-60 overflow-y-auto">
          {warnings.map((warning) => {
            const warningLevel = getWarningLevel(warning.hoursAgo);
            
            return (
              <div key={warning.contactId} className={`p-3 rounded-lg border ${warningLevel.color}`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <div>
                      <p className="font-medium text-sm">{warning.contactName}</p>
                      <p className="text-xs opacity-80">{warning.contactPhone}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={`text-xs ${warningLevel.color}`}>
                    <Clock className="h-3 w-3 mr-1" />
                    {warningLevel.text}
                  </Badge>
                </div>
                
                <div className="space-y-1 text-xs">
                  <p className="opacity-80">
                    <strong>Último contato:</strong> há {warning.hoursAgo} hora(s)
                  </p>
                  
                  <div className="space-y-1">
                    <p className="font-medium">Contas que enviaram mensagens:</p>
                    {warning.contactedByAccounts.map((account) => (
                      <div key={account.accountId} className="flex items-center gap-2 ml-2">
                        <Phone className="h-3 w-3" />
                        <span>{account.accountName}</span>
                        <span className="opacity-60">
                          ({new Date(account.lastContact).toLocaleString('pt-BR')})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};