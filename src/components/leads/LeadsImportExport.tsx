import { useState, useRef, useEffect } from 'react';
import { BackgroundGraph } from '@/components/ui/background-graph';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useTags } from '@/hooks/useTags';
import { sendWebhookNotification, generateQRCode, WEBHOOK_ACTIONS } from '@/lib/webhook';
import { Loader2, RefreshCw, Users, Upload, Download, Plus, FileText, CheckCircle, AlertCircle, Trash2, Edit } from 'lucide-react';

interface Lead {
  id?: string;
  nome: string;
  telefone: string;
  email?: string;
  tags?: string[];
  criado_em?: string;
  ultima_interacao?: string;
  id_tag?: string;
  row_number?: number;
}

const LeadsImportExport = () => {
  const { toast } = useToast();
  const { tags, loading: tagsLoading, error: tagsError, getTagsByType } = useTags();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingLeads, setFetchingLeads] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [formData, setFormData] = useState<Lead>({
    nome: '',
    telefone: '',
    email: '',
    tags: []
  });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<Lead[]>([]);
  const [deletingLeads, setDeletingLeads] = useState<Set<string>>(new Set());
  const [editingLeads, setEditingLeads] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ✅ NOVO: Obter apenas tags do tipo 'lead'
  const leadTags = getTagsByType('lead');

  // ✅ NOVO: Função para alternar seleção de tag
  const toggleTag = (tagName: string) => {
    setSelectedTags(prev => {
      if (prev.includes(tagName)) {
        return prev.filter(tag => tag !== tagName);
      } else {
        return [...prev, tagName];
      }
    });
  };

  // ✅ NOVO: Sincronizar selectedTags com formData.tags
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      tags: selectedTags
    }));
  }, [selectedTags]);

  // ✅ NOVO: Função para buscar leads existentes da API
  const fetchLeads = async () => {
    try {
      setFetchingLeads(true);
      setError(null);
      
      console.log('🔄 Buscando leads da API...');
      const response = await fetch('https://automatewebhook.techfala.com.br/webhook/ler_todas_os_leads', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📥 Dados recebidos da API:', data);

      // ✅ CORRIGIDO: Processar estrutura aninhada da API
      let leadsArray: Lead[] = [];
      if (Array.isArray(data) && data.length > 0 && data[0] && typeof data[0] === 'object' && data[0].data) {
        leadsArray = data[0].data;
      } else if (Array.isArray(data)) {
        leadsArray = data;
      } else if (data && typeof data === 'object' && data.data && Array.isArray(data.data)) {
        leadsArray = data.data;
      }

      // ✅ NOVO: Filtrar leads inválidos (com campos obrigatórios vazios)
      const validLeads = leadsArray.filter(lead => {
        // Verificar se o lead tem nome e telefone válidos
        const hasValidName = lead.nome && lead.nome.trim() !== '';
        const hasValidPhone = lead.telefone && lead.telefone.toString().trim() !== '';
        
        // Retornar apenas leads com nome e telefone válidos
        return hasValidName && hasValidPhone;
      });

      console.log(`✅ ${validLeads.length} leads válidos de ${leadsArray.length} recebidos`);
      setLeads(validLeads);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('❌ Erro ao buscar leads:', errorMessage);
      setError(errorMessage);
      setLeads([]);
      
      toast({
        title: "Erro ao carregar leads",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setFetchingLeads(false);
    }
  };

  // ✅ NOVO: Carregar leads na inicialização
  useEffect(() => {
    fetchLeads();
  }, []);

  // ✅ NOVO: Função para deletar lead na API
  const deletarLead = async (lead: Lead) => {
    try {
      setLoading(true);
      
      console.log('🗑️ Deletando lead na API...', lead);
      
      const response = await fetch('https://automatewebhook.techfala.com.br/webhook/deletar_lead', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          nome: lead.nome,
          telefone: lead.telefone,
          email: lead.email || '',
          tags: lead.tags?.join(',') || ''
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Lead deletado com sucesso:', data);
      
      toast({
        title: "Lead deletado!",
        description: `${lead.nome} foi removido com sucesso`,
      });

      return { success: true, data };

    } catch (error) {
      console.error('❌ Erro ao deletar lead:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      toast({
        title: "Erro ao deletar lead",
        description: errorMessage,
        variant: "destructive"
      });

      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // ✅ NOVO: Função para cadastrar lead na API (criar ou atualizar)
  const cadastrarLead = async (lead: Lead) => {
    try {
      setLoading(true);
      
      console.log('🔄 Cadastrando/atualizando lead na API...', lead);
      
      const response = await fetch('https://automatewebhook.techfala.com.br/webhook/cadastrar_lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          nome: lead.nome,
          telefone: lead.telefone,
          email: lead.email || '',
          tags: lead.tags?.join(',') || ''
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Lead cadastrado/atualizado com sucesso:', data);
      
      toast({
        title: "Lead salvo!",
        description: `${lead.nome} foi processado com sucesso`,
      });

      return { success: true, data };

    } catch (error) {
      console.error('❌ Erro ao cadastrar/atualizar lead:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      toast({
        title: `Erro ao processar lead`,
        description: errorMessage,
        variant: "destructive"
      });

      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // ✅ NOVO: Função para cadastrar múltiplos leads
  const cadastrarLeadsEmLote = async (leadsToAdd: Lead[]) => {
    try {
      setLoading(true);
      
      console.log(`🔄 Cadastrando/atualizando ${leadsToAdd.length} leads em lote...`);
      
      const results = [];
      let successCount = 0;
      let errorCount = 0;

      for (const lead of leadsToAdd) {
        // ✅ NOVO: Usar o mesmo endpoint de cadastro para todos os leads
        const result = await cadastrarLead(lead);
        results.push(result);
        
        if (result.success) {
          successCount++;
        } else {
          errorCount++;
        }
      }

      console.log(`✅ Lote concluído: ${successCount} sucessos, ${errorCount} erros`);
      
      if (successCount > 0) {
        toast({
          title: "Lote processado!",
          description: `${successCount} leads foram processados com sucesso${errorCount > 0 ? `, ${errorCount} falharam` : ''}`,
          variant: errorCount > 0 ? "destructive" : "default"
        });
        
        // ✅ NOVO: Recarregar leads após importação
        setTimeout(() => {
          fetchLeads();
        }, 1000);
      }

      return { successCount, errorCount, results };

    } catch (error) {
      console.error('❌ Erro no processamento em lote:', error);
      toast({
        title: "Erro no processamento em lote",
        description: "Falha ao processar múltiplos leads",
        variant: "destructive"
      });
      return { successCount: 0, errorCount: leadsToAdd.length, results: [] };
    } finally {
      setLoading(false);
    }
  };

  const handleAddLead = async () => {
    if (!formData.nome.trim() || !formData.telefone.trim()) {
      toast({
        title: "Dados obrigatórios",
        description: "Nome e telefone são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    try {
      // ✅ NOVO: Usar o mesmo endpoint de cadastro para adição
      const result = await cadastrarLead(formData);
      
      if (result.success) {
        // ✅ NOVO: Recarregar leads após adição
        setTimeout(() => {
          fetchLeads();
        }, 1000);
        
        resetForm();
        setShowAddForm(false);
      }
    } catch (error) {
      console.error('Erro ao adicionar lead:', error);
    }
  };

  const handleEditLead = async () => {
    if (!editingLead || !editingLead.id) {
      console.error('❌ Não é possível editar: editingLead ou ID inválido', { editingLead });
      return;
    }

    console.log('🔄 Iniciando edição do lead:', editingLead);
    console.log('📝 Dados do formulário:', formData);
    console.log('🏷️ Tags selecionadas:', selectedTags);

    try {
      // ✅ NOVO: Marcar lead como sendo editado
      setEditingLeads(prev => new Set(prev).add(editingLead.id!));
      
      // ✅ NOVO: Usar o mesmo endpoint de cadastro para edição
      console.log('📡 Enviando requisição para API...');
      const result = await cadastrarLead(formData);
      
      console.log('✅ Resultado da edição:', result);
      
      if (result.success) {
        // ✅ NOVO: Recarregar leads após edição
        setTimeout(() => {
          fetchLeads();
        }, 1000);
        
        resetForm();
        setEditingLead(null);
      }
    } catch (error) {
      console.error('❌ Erro ao editar lead:', error);
    } finally {
      // ✅ NOVO: Remover lead da lista de editando
      setEditingLeads(prev => {
        const newSet = new Set(prev);
        newSet.delete(editingLead.id!);
        return newSet;
      });
    }
  };

  const handleDeleteLead = async (lead: Lead) => {
    if (!lead.id) return;
    
    try {
      // ✅ NOVO: Marcar lead como sendo deletado
      setDeletingLeads(prev => new Set(prev).add(lead.id!));
      
      const result = await deletarLead(lead);
      
      if (result.success) {
        // ✅ NOVO: Recarregar leads após deleção
        setTimeout(() => {
          fetchLeads();
        }, 1000);
      }
    } catch (error) {
      console.error('Erro ao deletar lead:', error);
    } finally {
      // ✅ NOVO: Remover lead da lista de deletando
      setDeletingLeads(prev => {
        const newSet = new Set(prev);
        newSet.delete(lead.id!);
        return newSet;
      });
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      telefone: '',
      email: '',
      tags: []
    });
    setSelectedTags([]);
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportFile(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        // ✅ ATUALIZADO: Usar as mesmas colunas do cadastro individual
        const previewLeads: Lead[] = lines.slice(0, 10).map((line, index) => {
          const [nome, telefone, email, tags] = line.split(',').map(field => field.trim());
          return {
            id: `preview-${index}`,
            nome: nome || `Lead ${index + 1}`,
            telefone: telefone || '',
            email: email || '',
            tags: tags ? tags.split(';').map(tag => tag.trim()) : []
          };
        });

        setImportPreview(previewLeads);
        
        toast({
          title: "Arquivo carregado",
          description: `${lines.length} leads encontrados no arquivo`,
        });
      } catch (error) {
        toast({
          title: "Erro ao processar arquivo",
          description: "Formato de arquivo inválido",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
  };

  const confirmImport = async () => {
    if (!importFile) return;

    try {
      const text = await importFile.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      // ✅ ATUALIZADO: Usar as mesmas colunas do cadastro individual
      const leadsToImport: Lead[] = lines.map((line, index) => {
        const [nome, telefone, email, tags] = line.split(',').map(field => field.trim());
        return {
          nome: nome || `Lead ${index + 1}`,
          telefone: telefone || '',
          email: email || '',
          tags: tags ? tags.split(';').map(tag => tag.trim()) : []
        };
      });

      await cadastrarLeadsEmLote(leadsToImport);
      
      // Limpar importação
      setImportFile(null);
      setImportPreview([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
    } catch (error) {
      console.error('Erro na importação:', error);
    }
  };

  const exportLeads = () => {
    if (leads.length === 0) {
      toast({
        title: "Nenhum lead para exportar",
        description: "Adicione leads antes de exportar",
        variant: "destructive"
      });
      return;
    }

    // ✅ ATUALIZADO: Usar as mesmas colunas do cadastro individual
    const csvContent = [
      'Nome,Telefone,Email,Tags',
      ...leads.map(lead => [
        lead.nome,
        lead.telefone,
        lead.email || '',
        (lead.tags || []).join(';')
      ].join(','))
    ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
    link.setAttribute('download', `leads_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
      title: "Leads exportados!",
      description: `${leads.length} leads foram exportados com sucesso`,
    });
  };

  const startEdit = (lead: Lead) => {
    console.log('🔄 Iniciando modo de edição para lead:', lead);
    
    setEditingLead(lead);
    
    // ✅ CORRIGIDO: Preencher formulário com dados corretos
    const leadData = {
      nome: lead.nome || '',
      telefone: lead.telefone || '',
      email: lead.email || '',
      tags: lead.tags || []
    };
    
    setFormData(leadData);
    
    // ✅ CORRIGIDO: Preencher tags selecionadas
    const leadTags = lead.tags || [];
    setSelectedTags(leadTags);
    
    console.log('✅ Formulário preenchido com dados do lead:', leadData);
    console.log('✅ Tags selecionadas:', leadTags);
  };

  // ✅ NOVO: Função para formatar data
  const formatDate = (dateString: string) => {
    if (!dateString || dateString === '') return 'Não definida';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('pt-BR');
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gerenciar Leads</h2>
          <p className="text-muted-foreground">Importe, exporte e gerencie seus leads</p>
        </div>
        
        <div className="flex gap-3">
          <Button 
            onClick={fetchLeads}
            disabled={fetchingLeads}
            variant="outline"
            className="border-cyber-border hover:border-cyber-green"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${fetchingLeads ? 'animate-spin' : ''}`} />
            {fetchingLeads ? 'Carregando...' : 'Atualizar'}
          </Button>
          
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="border-cyber-border hover:border-cyber-green"
          >
            <Upload className="h-4 w-4 mr-2" />
            Importar CSV
          </Button>
          
          <Button
            variant="outline"
            onClick={exportLeads}
            disabled={leads.length === 0}
            className="border-cyber-border hover:border-cyber-green"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
          
          <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Lead
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
                <DialogTitle>Adicionar Novo Lead</DialogTitle>
            <DialogDescription>
                  Preencha os dados do lead para cadastrá-lo no sistema
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nome">Nome *</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      placeholder="Nome completo"
                    />
                  </div>
                  <div>
                    <Label htmlFor="telefone">Telefone *</Label>
                    <Input
                      id="telefone"
                      value={formData.telefone}
                      onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                      placeholder="+55 11 99999-9999"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@exemplo.com"
                  />
                </div>
                
                <div>
                  <Label htmlFor="tags">Tags</Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Selecione as tags disponíveis para categorizar o lead
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {tagsLoading ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Carregando tags...
              </div>
                    ) : tagsError ? (
                      <p className="text-destructive text-sm">Erro ao carregar tags: {tagsError}</p>
                    ) : leadTags.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Nenhuma tag disponível</p>
                    ) : (
                      leadTags.map(tag => (
                        <Badge
                          key={tag.id}
                          variant={selectedTags.includes(tag.nome) ? "secondary" : "outline"}
                          className="cursor-pointer hover:bg-destructive/20 transition-colors"
                          onClick={() => toggleTag(tag.nome)}
                        >
                          {tag.nome}
                          {selectedTags.includes(tag.nome) && <CheckCircle className="h-4 w-4 ml-1" />}
                        </Badge>
                      ))
                    )}
                  </div>
                  {selectedTags.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Tags selecionadas: {selectedTags.join(', ')}
                    </p>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={handleAddLead} disabled={loading} className="flex-1">
                    {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                    {loading ? 'Salvando...' : 'Salvar Lead'}
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddForm(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
        accept=".csv,.txt"
        onChange={handleFileImport}
                  className="hidden"
                />

      {/* Import Preview */}
      {importFile && importPreview.length > 0 && (
        <Card className="border-cyber-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Prévia da Importação
            </CardTitle>
            <CardDescription>
              {importPreview.length} leads serão importados. Revise os dados antes de confirmar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {importPreview.map((lead) => (
                <div key={lead.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">{lead.nome}</p>
                    <p className="text-sm text-muted-foreground">{lead.telefone}</p>
                    {lead.email && <p className="text-sm text-muted-foreground">{lead.email}</p>}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {lead.tags && lead.tags.length > 0 && (
                      lead.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex gap-2 mt-4">
              <Button onClick={confirmImport} disabled={loading} className="bg-primary hover:bg-primary/90">
                {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                {loading ? 'Processando...' : 'Confirmar Importação'}
              </Button>
                <Button
                  variant="outline"
                onClick={() => {
                  setImportFile(null);
                  setImportPreview([]);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                >
                Cancelar
                </Button>
              </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {fetchingLeads && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-cyber-green mr-3" />
          <span className="text-lg text-muted-foreground">Carregando leads...</span>
        </div>
      )}

      {/* Error State */}
      {error && !fetchingLeads && (
        <Card className="bg-card/80 backdrop-blur-sm border-destructive">
          <CardContent className="text-center py-8">
            <div className="text-destructive mb-4">
              <Users className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-destructive">Erro ao carregar leads</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchLeads} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Leads List */}
      {!fetchingLeads && !error && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Leads ({leads.length})
            </CardTitle>
            <CardDescription>
              Lista de leads cadastrados no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            {leads.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum lead encontrado</p>
                <p className="text-sm">Use o botão "Adicionar Lead" para começar</p>
              </div>
            ) : (
              <div className="space-y-3">
                {leads.map((lead, index) => (
                  <div key={lead.id || `lead-${index}`} className="flex items-center justify-between p-4 border border-border rounded-lg hover:border-cyber-green transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium">{lead.nome}</h4>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                        <div>
                          <span className="font-medium">Telefone:</span> {lead.telefone}
                        </div>
                        {lead.email && (
                          <div>
                            <span className="font-medium">Email:</span> {lead.email}
                          </div>
                        )}
                      </div>
                      {lead.tags && lead.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {lead.tags.map((tag, tagIndex) => (
                            <Badge key={`${lead.id || 'lead'}-tag-${tagIndex}`} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      {lead.criado_em && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Criado em: {formatDate(lead.criado_em)}
                        </p>
            )}
          </div>
                    
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEdit(lead)}
                        disabled={editingLeads.has(lead.id || '') || deletingLeads.has(lead.id || '')}
                      >
                        {editingLeads.has(lead.id || '') ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Edit className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteLead(lead)}
                        disabled={deletingLeads.has(lead.id || '') || editingLeads.has(lead.id || '')}
                        className="text-destructive hover:text-destructive"
                      >
                        {deletingLeads.has(lead.id || '') ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
          </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Edit Lead Dialog */}
      <Dialog open={!!editingLead} onOpenChange={() => setEditingLead(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Lead</DialogTitle>
            <DialogDescription>
              Atualize os dados do lead
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-nome">Nome *</Label>
                <Input
                  id="edit-nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Nome completo"
                />
              </div>
                  <div>
                <Label htmlFor="edit-telefone">Telefone *</Label>
                <Input
                  id="edit-telefone"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  placeholder="+55 11 99999-9999"
                />
                  </div>
                </div>
            
            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@exemplo.com"
              />
                </div>
            
            <div>
              <Label htmlFor="edit-tags">Tags</Label>
              <p className="text-xs text-muted-foreground mb-2">
                Selecione as tags disponíveis para categorizar o lead
              </p>
              <div className="flex flex-wrap gap-2">
                {tagsLoading ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Carregando tags...
              </div>
                ) : tagsError ? (
                  <p className="text-destructive text-sm">Erro ao carregar tags: {tagsError}</p>
                ) : leadTags.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhuma tag disponível</p>
                ) : (
                  leadTags.map(tag => (
                    <Badge
                      key={tag.id}
                      variant={selectedTags.includes(tag.nome) ? "secondary" : "outline"}
                      className="cursor-pointer hover:bg-destructive/20 transition-colors"
                      onClick={() => toggleTag(tag.nome)}
                    >
                      {tag.nome}
                      {selectedTags.includes(tag.nome) && <CheckCircle className="h-4 w-4 ml-1" />}
                    </Badge>
                  ))
                )}
              </div>
              {selectedTags.length > 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  Tags selecionadas: {selectedTags.join(', ')}
                </p>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleEditLead} disabled={loading || editingLeads.has(editingLead?.id || '')} className="flex-1">
                {loading || editingLeads.has(editingLead?.id || '') ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Salvar Alterações
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={() => setEditingLead(null)}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* API Integration Info - REMOVIDO por segurança */}
    </div>
  );
};

export default LeadsImportExport;