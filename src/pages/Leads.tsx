import { useState } from 'react';
import { BackgroundGraph } from '@/components/ui/background-graph';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Search, Filter, Phone, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface WhatsAppInteraction {
  accountName: string;
  lastContact: string;
  messageCount: number;
  status: 'delivered' | 'read' | 'failed' | 'no_response';
  attemptedContacts: number;
}

interface Lead {
  id: string;
  name: string;
  phone: string;
  tags: string[];
  whatsappInteractions: WhatsAppInteraction[];
  status: 'active' | 'inactive' | 'blocked';
}

const mockLeads: Lead[] = [
  {
    id: '1',
    name: 'João Silva',
    phone: '+55 11 99999-1234',
    tags: ['cliente', 'premium'],
    whatsappInteractions: [
      { accountName: 'Conta Principal', lastContact: '2024-01-15', messageCount: 45, status: 'read', attemptedContacts: 45 },
      { accountName: 'Vendas', lastContact: '2024-01-12', messageCount: 12, status: 'delivered', attemptedContacts: 15 }
    ],
    status: 'active'
  },
  {
    id: '2',
    name: 'Maria Santos',
    phone: '+55 11 98888-5678',
    tags: ['lead', 'interessado'],
    whatsappInteractions: [
      { accountName: 'Vendas', lastContact: '2024-01-14', messageCount: 8, status: 'no_response', attemptedContacts: 12 }
    ],
    status: 'active'
  },
  {
    id: '3',
    name: 'Carlos Oliveira',
    phone: '+55 11 97777-9012',
    tags: ['cliente'],
    whatsappInteractions: [
      { accountName: 'Suporte', lastContact: '2024-01-13', messageCount: 23, status: 'read', attemptedContacts: 23 },
      { accountName: 'Conta Principal', lastContact: '2024-01-10', messageCount: 5, status: 'failed', attemptedContacts: 8 }
    ],
    status: 'inactive'
  },
  {
    id: '4',
    name: 'Ana Costa',
    phone: '+55 11 96666-3456',
    tags: ['vip', 'cliente'],
    whatsappInteractions: [
      { accountName: 'Conta Principal', lastContact: '2024-01-16', messageCount: 67, status: 'read', attemptedContacts: 67 },
      { accountName: 'Vendas', lastContact: '2024-01-14', messageCount: 15, status: 'delivered', attemptedContacts: 18 },
      { accountName: 'Suporte', lastContact: '2024-01-11', messageCount: 8, status: 'no_response', attemptedContacts: 15 }
    ],
    status: 'active'
  }
];

const Leads = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTag, setFilterTag] = useState('all');
  const [filterAccount, setFilterAccount] = useState('all');

  const filteredLeads = mockLeads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.phone.includes(searchTerm);
    const matchesTag = filterTag === 'all' || lead.tags.includes(filterTag);
    const matchesAccount = filterAccount === 'all' || 
                          lead.whatsappInteractions.some(interaction => interaction.accountName === filterAccount);
    
    return matchesSearch && matchesTag && matchesAccount;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-cyber-green/20 text-cyber-green border-cyber-green/30';
      case 'inactive': return 'bg-muted text-muted-foreground border-border';
      case 'blocked': return 'bg-destructive/20 text-destructive border-destructive/30';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getInteractionStatusColor = (status: string) => {
    switch (status) {
      case 'read': return 'bg-cyber-green/20 text-cyber-green';
      case 'delivered': return 'bg-cyber-blue/20 text-cyber-blue';
      case 'failed': return 'bg-destructive/20 text-destructive';
      case 'no_response': return 'bg-warning/20 text-warning-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getInteractionStatusText = (status: string) => {
    switch (status) {
      case 'read': return 'Lida';
      case 'delivered': return 'Entregue';
      case 'failed': return 'Falhou';
      case 'no_response': return 'Sem resposta';
      default: return 'Desconhecido';
    }
  };

  return (
    <div className="min-h-screen relative">
      <BackgroundGraph className="absolute inset-0 z-0" />
      
      <div className="relative z-10 flex flex-col min-h-screen p-4">
        <div className="max-w-7xl mx-auto w-full">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/dashboard')}
                className="text-cyber-blue hover:text-cyber-green hover:bg-cyber-surface"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyber-green to-cyber-blue bg-clip-text text-transparent">
                Leads & Clientes
              </h1>
            </div>
          </div>

          {/* Filters */}
          <Card className="mb-6 bg-card/80 backdrop-blur-sm border-cyber-border">
            <CardHeader>
              <CardTitle className="flex items-center text-cyber-green">
                <Filter className="h-5 w-5 mr-2" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Buscar</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Nome ou telefone..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-muted/50 border-cyber-border focus:border-cyber-green"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tag</label>
                  <Select value={filterTag} onValueChange={setFilterTag}>
                    <SelectTrigger className="bg-muted/50 border-cyber-border focus:border-cyber-green">
                      <SelectValue placeholder="Selecione uma tag" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as tags</SelectItem>
                      <SelectItem value="cliente">Cliente</SelectItem>
                      <SelectItem value="lead">Lead</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="interessado">Interessado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Conta WhatsApp</label>
                  <Select value={filterAccount} onValueChange={setFilterAccount}>
                    <SelectTrigger className="bg-muted/50 border-cyber-border focus:border-cyber-green">
                      <SelectValue placeholder="Selecione uma conta" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as contas</SelectItem>
                      <SelectItem value="Conta Principal">Conta Principal</SelectItem>
                      <SelectItem value="Vendas">Vendas</SelectItem>
                      <SelectItem value="Suporte">Suporte</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Comercial">Comercial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Leads List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLeads.map((lead) => (
              <Card key={lead.id} className="bg-card/80 backdrop-blur-sm border-cyber-border hover:border-cyber-green transition-all duration-300 hover:shadow-lg hover:shadow-cyber-green/10">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg text-foreground">{lead.name}</CardTitle>
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <Phone className="h-3 w-3 mr-1" />
                        {lead.phone}
                      </div>
                    </div>
                    <Badge className={getStatusColor(lead.status)}>
                      {lead.status === 'active' ? 'Ativo' : lead.status === 'inactive' ? 'Inativo' : 'Bloqueado'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Interações WhatsApp:</p>
                    <div className="space-y-2">
                      {lead.whatsappInteractions.map((interaction, index) => (
                        <div key={index} className="p-3 bg-muted/30 rounded-lg border">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="text-sm font-medium text-primary">{interaction.accountName}</p>
                              <p className="text-xs text-muted-foreground">
                                {interaction.messageCount} mensagens • {interaction.attemptedContacts} tentativas
                              </p>
                            </div>
                            <Badge className={getInteractionStatusColor(interaction.status)} variant="secondary">
                              {getInteractionStatusText(interaction.status)}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Último contato: {new Date(interaction.lastContact).toLocaleDateString('pt-BR')}
                          </p>
                          {interaction.status === 'no_response' && (
                            <p className="text-xs text-warning-foreground mt-1">
                              ⚠️ {interaction.attemptedContacts - interaction.messageCount} mensagens sem resposta
                            </p>
                          )}
                          {interaction.status === 'failed' && (
                            <p className="text-xs text-destructive mt-1">
                              ❌ {interaction.attemptedContacts - interaction.messageCount} tentativas falharam
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Tags:</p>
                    <div className="flex flex-wrap gap-1">
                      {lead.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs bg-cyber-surface text-cyber-green border-cyber-border">
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredLeads.length === 0 && (
            <Card className="bg-card/80 backdrop-blur-sm border-cyber-border">
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground">Nenhum lead encontrado com os filtros aplicados.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leads;