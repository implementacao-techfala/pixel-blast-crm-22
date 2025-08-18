import { useState, useMemo } from 'react';
import { BackgroundGraph } from '@/components/ui/background-graph';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Search, Filter, Phone, Tag, ChevronDown, ChevronUp, FolderOpen, Folder, Loader2, AlertTriangle, CheckCircle, XCircle, Calendar, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { VirtualizedList } from '@/components/optimized/VirtualizedList';
import { LeadsPagination } from '@/components/leads/LeadsPagination';
import { LeadsImportExport } from '@/components/leads/LeadsImportExport';
import { useTags } from '@/hooks/useTags';
import { useLeads, Lead as ApiLead } from '@/hooks/useLeads';

// ✅ REMOVIDO: Interfaces e dados mockados antigos
// Agora usando dados reais da API via useLeads hook

const Leads = () => {
  const { 
    tags, 
    loading: tagsLoading, 
    error: tagsError, 
    retryCount: tagsRetryCount,
    refreshTags,
    getStats: getTagsStats
  } = useTags();
  
  // ✅ NOVO: Hook para leads reais da API
  const {
    leads,
    loading: leadsLoading,
    error: leadsError,
    retryCount: leadsRetryCount,
    refreshLeads,
    importLeads,
    getStats: getLeadsStats,
    filterLeadsByTags,
    searchLeads
  } = useLeads();
  
  const navigate = useNavigate();
  
  // Debug logs com estatísticas
  console.log('🔍 Leads component - tags:', tags);
  console.log('🔍 Leads component - tagsLoading:', tagsLoading);
  console.log('🔍 Leads component - tagsError:', tagsError);
  console.log('🔍 Leads component - tagsRetryCount:', tagsRetryCount);
  console.log('📊 Estatísticas das tags:', getTagsStats());
  console.log('🔍 Leads component - leads:', leads);
  console.log('🔍 Leads component - leadsLoading:', leadsLoading);
  console.log('🔍 Leads component - leadsError:', leadsError);
  console.log('🔍 Leads component - leadsRetryCount:', leadsRetryCount);
  console.log('📊 Estatísticas dos leads:', getLeadsStats());
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTag, setFilterTag] = useState('all');

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(100);
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [isExpanded, setIsExpanded] = useState(true);

  // ✅ NOVO: Usar leads reais da API
  const totalLeadsCount = leads.length;

  // ✅ NOVO: Filtrar leads baseado em busca e filtros
  const filteredLeads = useMemo(() => {
    let filtered = leads;

    // Aplicar filtro de busca
    if (searchTerm) {
      filtered = searchLeads(searchTerm);
    }

    // Aplicar filtro de tag
    if (filterTag !== 'all') {
      filtered = filterLeadsByTags([filterTag]);
    }

    // Aplicar filtro de pasta (tag)
    if (selectedFolder !== 'all') {
      filtered = filterLeadsByTags([selectedFolder]);
    }

    // Paginação eficiente
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filtered.slice(startIndex, endIndex);
  }, [leads, searchTerm, filterTag, selectedFolder, currentPage, itemsPerPage, searchLeads, filterLeadsByTags]);

  // ✅ NOVO: Contar leads filtrados
  const totalFilteredCount = useMemo(() => {
    let filtered = leads;

    if (searchTerm) {
      filtered = searchLeads(searchTerm);
    }

    if (filterTag !== 'all') {
      filtered = filterLeadsByTags([filterTag]);
    }

    if (selectedFolder !== 'all') {
      filtered = filterLeadsByTags([selectedFolder]);
    }

    return filtered.length;
  }, [leads, searchTerm, filterTag, selectedFolder, searchLeads, filterLeadsByTags]);

  // ✅ NOVO: Usar tags reais para as pastas com contagem real dos leads
  const folders = useMemo(() => {
    console.log('🔄 Calculando folders com tags reais e contagem de leads...');
    
    if (!Array.isArray(tags) || tags.length === 0) {
      console.log('📭 Sem tags reais, usando fallback');
      return [
        { name: 'all', count: leads.length, label: 'Todas' }
      ];
    }
    
    // ✅ NOVO: Criar pastas baseadas nas tags reais com contagem real
    const realTagFolders = tags.map(tag => {
      const count = filterLeadsByTags([tag.nome]).length;
      return {
        name: tag.nome,
        count,
        label: tag.nome
      };
    });
    
    console.log('✅ Pastas criadas com tags reais e contagem:', realTagFolders);
    
    return [
      { name: 'all', count: leads.length, label: 'Todas' },
      ...realTagFolders
    ];
  }, [tags, leads, filterLeadsByTags]);

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

  // ✅ NOVO: Importar leads via API real
  const handleImport = async (newLeads: any[]) => {
    console.log('🔄 Importando leads via API...');
    
    // Converter para formato da API
    const apiLeads = newLeads.map(lead => ({
      nome: lead.name || lead.nome,
      telefone: lead.phone || lead.telefone,
      email: lead.email || '',
      ultima_interacao: lead.lastContact || new Date().toISOString(),
      id_tag: Array.isArray(lead.tags) ? lead.tags.join(', ') : lead.tags || ''
    }));
    
    const success = await importLeads(apiLeads);
    
    if (success) {
      console.log('✅ Leads importados com sucesso via API');
    } else {
      console.error('❌ Falha na importação via API');
    }
  };

  const handleExport = () => {
    // Lógica de exportação já implementada no componente
  };

  // ✅ NOVO: Renderizar cards de leads com dados reais da API
  const renderLeadCard = (lead: ApiLead, index: number) => (
    <Card key={lead.id} className="bg-card/80 backdrop-blur-sm border-cyber-border hover:border-cyber-green transition-all duration-300 hover:shadow-lg hover:shadow-cyber-green/10">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg text-foreground">{lead.nome}</CardTitle>
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <Phone className="h-3 w-3 mr-1" />
              {lead.telefone}
            </div>
          </div>
          <Badge className="bg-cyber-green/20 text-cyber-green border-cyber-green/30">
            Ativo
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{lead.email || 'Sem email'}</p>
        </div>
        
        <div>
          <p className="text-sm text-muted-foreground mb-2">Tags:</p>
          <div className="flex flex-wrap gap-1">
            {lead.id_tag ? lead.id_tag.split(',').map(tag => tag.trim()).filter(tag => tag).map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs bg-cyber-surface text-cyber-green border-cyber-border">
                <Tag className="h-3 w-3 mr-1" />
                {tag}
              </Badge>
            )) : (
              <Badge variant="secondary" className="text-xs text-muted-foreground">
                Sem tags
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>Última interação: {lead.ultima_interacao}</span>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>Criado em: {lead.criado_em}</span>
        </div>
      </CardContent>
    </Card>
  );

  // ✅ REMOVIDO: Funções auxiliares não mais necessárias

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
                       Todas ({leads.length})
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
                        {tagsRetryCount > 0 && (
                          <p className="text-xs text-orange-500">
                            Tentativas: {tagsRetryCount + 1}
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

                        </div>
                      </div>
                    )}
                    
                    {/* ✅ NOVO: Status dos Leads */}
                    {leadsError && (
                      <div className="space-y-1">
                        <p className="text-xs text-red-500">Erro nos Leads: {leadsError}</p>
                        {leadsRetryCount > 0 && (
                          <p className="text-xs text-orange-500">
                            Tentativas: {leadsRetryCount + 1}
                          </p>
                        )}
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={refreshLeads}
                            className="text-xs h-6"
                          >
                            🔄 Refresh Leads
                          </Button>
                        </div>
                      </div>
                    )}
                 </div>

                </div>
              </CardContent>
            </Card>
          )}

          {/* ✅ NOVO: Status de Loading dos Leads */}
          {leadsLoading && (
            <Card className="bg-card/80 backdrop-blur-sm border-cyber-border">
              <CardContent className="text-center py-12">
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <p className="text-muted-foreground">Carregando leads da API...</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Leads List - Virtualizado para performance */}
          {!leadsLoading && (
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
          )}

          {!leadsLoading && filteredLeads.length === 0 && (
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