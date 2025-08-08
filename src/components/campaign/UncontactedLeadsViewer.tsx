import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertTriangle, User, Phone, Download, FileText } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface UncontactedLead {
  id: string;
  name: string;
  phone: string;
  tags: string[];
  reason: 'account_blocked' | 'account_unavailable' | 'number_invalid' | 'system_error';
  lastAttempt: string;
  accountsAttempted: string[];
}

interface UncontactedLeadsViewerProps {
  campaignName: string;
  uncontactedLeads: UncontactedLead[];
  isOpen: boolean;
  onClose: () => void;
}

export const UncontactedLeadsViewer: React.FC<UncontactedLeadsViewerProps> = ({
  campaignName,
  uncontactedLeads,
  isOpen,
  onClose
}) => {
  const getReasonText = (reason: string) => {
    switch (reason) {
      case 'account_blocked': return 'Conta bloqueada';
      case 'account_unavailable': return 'Conta indisponível';
      case 'number_invalid': return 'Número inválido';
      case 'system_error': return 'Erro do sistema';
      default: return 'Motivo desconhecido';
    }
  };

  const getReasonColor = (reason: string) => {
    switch (reason) {
      case 'account_blocked': return 'bg-destructive/20 text-destructive border-destructive/50';
      case 'account_unavailable': return 'bg-yellow-500/20 text-yellow-600 border-yellow-500/50';
      case 'number_invalid': return 'bg-blue-500/20 text-blue-600 border-blue-500/50';
      case 'system_error': return 'bg-purple-500/20 text-purple-600 border-purple-500/50';
      default: return 'bg-muted text-muted-foreground border-cyber-border';
    }
  };

  const exportToCSV = () => {
    const headers = ['Nome', 'Telefone', 'Tags', 'Motivo', 'Última Tentativa', 'Contas Tentadas'];
    const rows = uncontactedLeads.map(lead => [
      lead.name,
      lead.phone,
      lead.tags.join(', '),
      getReasonText(lead.reason),
      new Date(lead.lastAttempt).toLocaleString('pt-BR'),
      lead.accountsAttempted.join(', ')
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `leads-nao-contatados-${campaignName.replace(/\s+/g, '-').toLowerCase()}.csv`;
    link.click();
  };

  const reasonSummary = uncontactedLeads.reduce((acc, lead) => {
    acc[lead.reason] = (acc[lead.reason] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card/90 backdrop-blur-sm border-cyber-border">
        <DialogHeader>
          <DialogTitle className="text-cyber-green flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Leads Não Contatados
          </DialogTitle>
          <DialogDescription>
            Campanha: {campaignName} • {uncontactedLeads.length} lead(s) não receberam mensagem
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary */}
          <Alert className="border-yellow-500/20 bg-yellow-500/10">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Resumo de Falhas:</strong> Alguns leads não puderam ser contatados devido às limitações das contas disponíveis.
            </AlertDescription>
          </Alert>

          {/* Reason Summary */}
          <Card className="border-cyber-border">
            <CardHeader>
              <CardTitle className="text-base">Motivos da Falha</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(reasonSummary).map(([reason, count]) => (
                  <div key={reason} className="text-center">
                    <Badge className={getReasonColor(reason)}>
                      {getReasonText(reason)}
                    </Badge>
                    <p className="text-lg font-semibold mt-2">{count}</p>
                    <p className="text-xs text-muted-foreground">leads</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={exportToCSV}
              className="border-cyber-border hover:border-cyber-green"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
          </div>

          {/* Leads List */}
          <Card className="border-cyber-border">
            <CardHeader>
              <CardTitle className="text-base">Lista Detalhada</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {uncontactedLeads.map((lead) => (
                  <div key={lead.id} className="flex items-center justify-between p-3 border border-cyber-border rounded-lg">
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">{lead.name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          <span>{lead.phone}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {lead.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs bg-cyber-surface">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <Badge className={getReasonColor(lead.reason)}>
                        {getReasonText(lead.reason)}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(lead.lastAttempt).toLocaleString('pt-BR')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Contas: {lead.accountsAttempted.join(', ')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};