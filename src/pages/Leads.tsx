import { useState, useMemo } from 'react';
import { BackgroundGraph } from '@/components/ui/background-graph';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Search, Filter, Phone, Tag, ChevronDown, ChevronUp, FolderOpen, Folder, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { VirtualizedList } from '@/components/optimized/VirtualizedList';
import { LeadsPagination } from '@/components/leads/LeadsPagination';
import { LeadsImportExport } from '@/components/leads/LeadsImportExport';
import { useTags } from '@/hooks/useTags';

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
  const { 
    tags, 
    loading: tagsLoading, 
    error: tagsError, 
    retryCount,
    refreshTags,
    getStats,
    testApiEndpoint
  } = useTags();
  const navigate = useNavigate();
  
  // Debug logs com estatísticas
  console.log('🔍 Leads component - tags:', tags);
  console.log('🔍 Leads component - tagsLoading:', tagsLoading);
  console.log('🔍 Leads component - tagsError:', tagsError);
  console.log('🔍 Leads component - retryCount:', retryCount);
  console.log('📊 Estatísticas das tags:', getStats());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTag, setFilterTag] = useState('all');
  const [filterAccount, setFilterAccount] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(100);
  const [allLeads, setAllLeads] = useState(mockLeads);
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [isExpanded] = useState(true);

  // Simular milhões de leads para demonstração
  const [totalLeadsCount] = useState(5247891); // 5+ milhões

  const filteredLeads = useMemo(() => {
    let leads = allLeads.filter(lead => {
      const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           lead.phone.includes(searchTerm);
      const matchesTag = filterTag === 'all' || lead.tags.includes(filterTag);
      const matchesAccount = filterAccount === 'all' || 
                            lead.whatsappInteractions.some(interaction => interaction.accountName === filterAccount);
      const matchesFolder = selectedFolder === 'all' || lead.tags.includes(selectedFolder);
      
      return matchesSearch && matchesTag && matchesAccount && matchesFolder;
    });

    // Paginação eficiente
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return leads.slice(startIndex, endIndex);
  }, [allLeads, searchTerm, filterTag, filterAccount, selectedFolder, currentPage, itemsPerPage]);

  const totalFilteredCount = useMemo(() => {
    return allLeads.filter(lead => {
      const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           lead.phone.includes(searchTerm);
      const matchesTag = filterTag === 'all' || lead.tags.includes(filterTag);
      const matchesAccount = filterAccount === 'all' || 
                            lead.whatsappInteractions.some(interaction => interaction.accountName === filterAccount);
      const matchesFolder = selectedFolder === 'all' || lead.tags.includes(selectedFolder);
      
      return matchesSearch && matchesTag && matchesAccount && matchesFolder;
    }).length;
  }, [allLeads, searchTerm, filterTag, filterAccount, selectedFolder]);

  // Usar tags reais para as pastas em vez de dados mockados
  const folders = useMemo(() => {
    console.log('🔄 Calculando folders com tags reais...');
    
    if (!Array.isArray(tags) || tags.length === 0) {
      console.log('📭 Sem tags reais, usando fallback');
      return [
        { name: 'all', count: allLeads.length, label: 'Todas' }
      ];
    }
    
    // Criar pastas baseadas nas tags reais
    const realTagFolders = tags.map(tag => ({
      name: tag.nome,
      count: 0, // Por enquanto 0, será implementado quando tivermos endpoint de contagem
      label: tag.nome
    }));
    
    console.log('✅ Pastas criadas com tags reais:', realTagFolders);
    
    return [
      { name: 'all', count: allLeads.length, label: 'Todas' },
      ...realTagFolders
    ];
  }, [tags, allLeads]);

  // Usar tags reais para o filtro
  const availableTags = useMemo(() => {
    console.log('🔄 Calculando availableTags...');
    console.log('📊 Tags recebidas:', tags);
    console.log('🔍 Tipo de tags:', typeof tags);
    console.log('🔍 É array?', Array.isArray(tags));
    
    if (!Array.isArray(tags)) {
      console.warn('⚠️ Tags não é um array:', tags);
      return [];
    }
    
    if (tags.length === 0) {
      console.log('📭 Array de tags está vazio');
      return [];
    }
    
    const tagNames = tags.map(tag => {
      console.log('🏷️ Processando tag:', tag);
      return tag.nome;
    });
    
    console.log('✅ Tag names extraídos:', tagNames);
    return tagNames;
  }, [tags]);

  const handleImport = (newLeads: any[]) => {
    setAllLeads(prev => [...prev, ...newLeads]);
  };

  const handleExport = () => {
    // Lógica de exportação já implementada no componente
  };

  const renderLeadCard = (lead: Lead, index: number) => (
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
            {lead.whatsappInteractions.map((interaction, idx) => (
              <div key={idx} className="p-3 bg-muted/30 rounded-lg border">
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
  );

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

          {/* Card de Status das Tags */}
          <Card className="mb-6 bg-card/80 backdrop-blur-sm border-cyber-border">
            <CardHeader>
              <CardTitle className="text-cyber-green flex items-center">
                <Tag className="h-5 w-5 mr-2" />
                Status das Tags
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-cyber-purple">
                    {tagsLoading ? '...' : tags.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Total de Tags</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-cyber-blue">
                    {tagsLoading ? '...' : tags.filter(t => t.tipo === 'lead').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Tags de Lead</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-cyber-green">
                    {tagsLoading ? '...' : tags.filter(t => t.tipo === 'conta').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Tags de Conta</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-500">
                    {tagsLoading ? '...' : tags.filter(t => t.tipo === 'campanha').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Tags de Campanha</div>
                </div>
              </div>
              
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {tagsLoading ? (
                    <span className="flex items-center">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Carregando tags...
                    </span>
                  ) : tagsError ? (
                    <span className="text-red-500">Erro: {tagsError}</span>
                  ) : (
                    <span className="text-green-500">
                      ✅ Última atualização: {new Date().toLocaleTimeString('pt-BR')}
                    </span>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={refreshTags}
                    disabled={tagsLoading}
                    className="border-cyber-border hover:border-cyber-green"
                  >
                    {tagsLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      '🔄'
                    )}
                    Atualizar Tags
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={testApiEndpoint}
                    className="border-cyber-border hover:border-cyber-green"
                  >
                    🧪 Testar API
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Import/Export */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-cyber-blue hover:text-cyber-green"
              >
                {isExpanded ? <ChevronUp className="h-4 w-4 mr-2" /> : <ChevronDown className="h-4 w-4 mr-2" />}
                {isExpanded ? 'Minimizar' : 'Expandir'} Filtros
              </Button>
              <div className="text-sm text-muted-foreground">
                {totalFilteredCount.toLocaleString('pt-BR')} de {totalLeadsCount.toLocaleString('pt-BR')} registros
              </div>
            </div>
            <LeadsImportExport 
              totalLeads={totalLeadsCount}
              onImport={handleImport}
              onExport={handleExport}
            />
          </div>

          {/* Filters */}
          {isExpanded && (
            <Card className="mb-6 bg-card/80 backdrop-blur-sm border-cyber-border">
              <CardHeader>
                <CardTitle className="flex items-center text-cyber-green">
                  <Filter className="h-5 w-5 mr-2" />
                  Filtros Avançados
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Folders */}
                                 <div className="space-y-2">
                   <label className="text-sm font-medium">Pastas (Tags)</label>
                   <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                     <Button
                       variant={selectedFolder === 'all' ? 'default' : 'outline'}
                       size="sm"
                       onClick={() => setSelectedFolder('all')}
                       className="justify-start"
                     >
                       <FolderOpen className="h-3 w-3 mr-2" />
                       Todas ({allLeads.length})
                     </Button>
                     
                     {tagsLoading ? (
                       <div className="col-span-full flex items-center justify-center py-4">
                         <Loader2 className="h-4 w-4 animate-spin text-cyber-purple mr-2" />
                         <span className="text-sm text-muted-foreground">
                           Carregando tags...
                         </span>
                       </div>
                     ) : tagsError ? (
                       <div className="col-span-full text-center py-4 space-y-2">
                         <p className="text-xs text-red-500">Erro ao carregar tags</p>
                         <Button 
                           variant="outline" 
                           size="sm" 
                           onClick={refreshTags}
                           className="text-xs"
                         >
                           🔄 Tentar novamente
                         </Button>
                       </div>
                     ) : folders.length > 1 ? (
                       folders.slice(1).map((folder) => (
                         <Button
                           key={folder.name}
                           variant={selectedFolder === folder.name ? 'default' : 'outline'}
                           size="sm"
                           onClick={() => setSelectedFolder(folder.name)}
                           className="justify-start"
                         >
                           <Folder className="h-3 w-3 mr-2" />
                           {folder.label} ({folder.count})
                         </Button>
                       ))
                     ) : (
                       <div className="col-span-full text-center py-4">
                         <p className="text-xs text-muted-foreground">Nenhuma tag disponível</p>
                       </div>
                     )}
                   </div>
                 </div>

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
                       {tagsLoading ? (
                         <SelectItem value="loading" disabled>Carregando...</SelectItem>
                       ) : tagsError ? (
                         <SelectItem value="error" disabled>Erro ao carregar tags</SelectItem>
                       ) : availableTags.length === 0 ? (
                         <SelectItem value="empty" disabled>Nenhuma tag disponível</SelectItem>
                       ) : (
                         availableTags.map(tag => (
                           <SelectItem key={tag} value={tag}>
                             {tag.charAt(0).toUpperCase() + tag.slice(1)}
                           </SelectItem>
                         ))
                       )}
                     </SelectContent>
                   </Select>
                                       {tagsError && (
                      <div className="space-y-1">
                        <p className="text-xs text-red-500">Erro: {tagsError}</p>
                        {retryCount > 0 && (
                          <p className="text-xs text-orange-500">
                            Tentativas: {retryCount + 1}
                          </p>
                        )}
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={refreshTags}
                            className="text-xs h-6"
                          >
                            🔄 Refresh
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={testApiEndpoint}
                            className="text-xs h-6"
                          >
                            🧪 Testar API
                          </Button>
                        </div>
                      </div>
                    )}
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
          )}

          {/* Leads List - Virtualizado para performance */}
          <div className="space-y-4">
            <VirtualizedList
              items={filteredLeads}
              renderItem={renderLeadCard}
              itemHeight={320}
              containerHeight={600}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-card/30 backdrop-blur-sm border-cyber-border rounded-lg"
            />

            {/* Paginação */}
            <LeadsPagination
              currentPage={currentPage}
              totalItems={totalFilteredCount}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={(newSize) => {
                setItemsPerPage(newSize);
                setCurrentPage(1);
              }}
            />
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