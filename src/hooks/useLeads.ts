import { useState, useEffect, useCallback } from 'react';
import { getSavedAuthData } from '@/config/auth';
import { mockLeads } from '@/config/mockData';

export interface Lead {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  ultima_interacao: string;
  criado_em: string;
  atualizado_em: string;
  id_tag: string; // Tags separadas por vírgula
}

interface LeadStats {
  total: number;
  porTag: Record<string, number>;
  semTag: number;
}

interface UseLeadsReturn {
  leads: Lead[];
  loading: boolean;
  error: string | null;
  retryCount: number;
  refreshLeads: () => Promise<void>;
  importLeads: (leads: Omit<Lead, 'id' | 'criado_em' | 'atualizado_em'>[]) => Promise<boolean>;
  getStats: () => LeadStats;
  filterLeadsByTags: (selectedTags: string[]) => Lead[];
  searchLeads: (query: string) => Lead[];
}

const BASE_URL = 'https://automatewebhook.techfala.com.br/webhook';

export const useLeads = (): UseLeadsReturn => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // ✅ NOVO: Validar estrutura dos dados da API
  const validateLeadStructure = (data: any): data is Lead => {
    return (
      typeof data === 'object' &&
      data !== null &&
      typeof data.id === 'string' &&
      typeof data.nome === 'string' &&
      typeof data.telefone === 'string' &&
      typeof data.email === 'string' &&
      typeof data.ultima_interacao === 'string' &&
      typeof data.criado_em === 'string' &&
      typeof data.atualizado_em === 'string' &&
      typeof data.id_tag === 'string'
    );
  };

  // ✅ NOVO: Processar dados da API
  const processApiData = (data: any): Lead[] => {
    console.log('🔍 Processando dados da API de leads:', data);
    
    // Se receber "Workflow was started", aguardar e tentar novamente
    if (data && typeof data === 'object' && data.message === 'Workflow was started') {
      console.log('🔄 N8N workflow iniciado, aguardando...');
      return [];
    }

    // Verificar se é um array direto
    if (Array.isArray(data)) {
      console.log('📊 Dados recebidos como array direto');
      return data.filter(validateLeadStructure);
    }

    // Verificar se tem estrutura { data: [...] }
    if (data && typeof data === 'object' && Array.isArray(data.data)) {
      console.log('📊 Dados recebidos como { data: [...] }');
      return data.data.filter(validateLeadStructure);
    }

    // Verificar se é string JSON
    if (typeof data === 'string') {
      try {
        const parsed = JSON.parse(data);
        return processApiData(parsed);
      } catch (e) {
        console.error('❌ Erro ao fazer parse de string JSON:', e);
        return [];
      }
    }

    console.warn('⚠️ Estrutura de dados não reconhecida:', data);
    return [];
  };

  // ✅ NOVO: Buscar leads da API
  const fetchLeads = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      // ✅ VERIFICAR MODO DEMO
      const authData = getSavedAuthData();
      if (authData?.isDemoMode) {
        console.log('🎭 MODO DEMO ATIVADO - Usando leads mockados');
        // Simular delay de rede
        await new Promise(resolve => setTimeout(resolve, 400));
        
        // Converter mockLeads para formato da API
        const demoLeads: Lead[] = mockLeads.map(lead => ({
          id: lead.id,
          nome: lead.name,
          telefone: lead.phone,
          email: lead.email,
          ultima_interacao: lead.lastContact || lead.createdAt,
          criado_em: lead.createdAt,
          atualizado_em: lead.createdAt,
          id_tag: lead.tags.join(', ')
        }));
        
        setLeads(demoLeads);
        setRetryCount(0);
        setLoading(false);
        console.log(`✅ DEMO: ${demoLeads.length} leads mockados carregados`);
        return;
      }
      
      console.log('🔄 Buscando leads da API...');
      const response = await fetch(`${BASE_URL}/ler_todas_os_leads`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('📥 Resposta da API de leads:', data);
      
      const processedLeads = processApiData(data);
      console.log(`✅ ${processedLeads.length} leads processados com sucesso`);
      
      setLeads(processedLeads);
      setRetryCount(0);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('❌ Erro ao buscar leads:', errorMessage);
      setError(errorMessage);
      setRetryCount(prev => prev + 1);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ NOVO: Refresh com retry automático
  const refreshLeads = useCallback(async (): Promise<void> => {
    await fetchLeads();
  }, [fetchLeads]);

  // ✅ NOVO: Importar leads via API
  const importLeads = useCallback(async (newLeads: Omit<Lead, 'id' | 'criado_em' | 'atualizado_em'>[]): Promise<boolean> => {
    try {
      console.log(`🔄 Importando ${newLeads.length} leads...`);
      
      const response = await fetch(`${BASE_URL}/cadastrar_lead`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ leads: newLeads })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const result = await response.json();
      console.log('✅ Leads importados com sucesso:', result);
      
      // Recarregar leads após importação
      await refreshLeads();
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('❌ Erro ao importar leads:', errorMessage);
      setError(errorMessage);
      return false;
    }
  }, [refreshLeads]);

  // ✅ NOVO: Estatísticas dos leads
  const getStats = useCallback((): LeadStats => {
    const stats: LeadStats = {
      total: leads.length,
      porTag: {},
      semTag: 0
    };

    leads.forEach(lead => {
      if (lead.id_tag && lead.id_tag.trim()) {
        const tags = lead.id_tag.split(',').map(tag => tag.trim()).filter(tag => tag);
        tags.forEach(tag => {
          stats.porTag[tag] = (stats.porTag[tag] || 0) + 1;
        });
      } else {
        stats.semTag++;
      }
    });

    return stats;
  }, [leads]);

  // ✅ NOVO: Filtrar leads por tags selecionadas
  const filterLeadsByTags = useCallback((selectedTags: string[]): Lead[] => {
    if (selectedTags.length === 0) return leads;
    
    return leads.filter(lead => {
      // ✅ CORRIGIDO: Se o lead não tem tags, incluir apenas se não houver tags selecionadas específicas
      if (!lead.id_tag || !lead.id_tag.trim()) {
        // Se não há tags selecionadas específicas, incluir leads sem tags
        return selectedTags.length === 0;
      }
      
      const leadTags = lead.id_tag.split(',').map(tag => tag.trim()).filter(tag => tag);
      
      // ✅ CORRIGIDO: Se o lead tem tags, verificar se alguma das tags selecionadas está presente
      return selectedTags.some(selectedTag => leadTags.includes(selectedTag));
    });
  }, [leads]);

  // ✅ NOVO: Buscar leads por texto
  const searchLeads = useCallback((query: string): Lead[] => {
    if (!query.trim()) return leads;
    
    const searchTerm = query.toLowerCase();
    return leads.filter(lead => 
      lead.nome.toLowerCase().includes(searchTerm) ||
      lead.telefone.toLowerCase().includes(searchTerm) ||
      lead.email.toLowerCase().includes(searchTerm) ||
      lead.id_tag.toLowerCase().includes(searchTerm)
    );
  }, [leads]);

  // ✅ NOVO: Carregamento automático ao montar o hook
  useEffect(() => {
    console.log('🚀 Hook useLeads montado - Carregando leads automaticamente');
    fetchLeads();
  }, [fetchLeads]);

  return {
    leads,
    loading,
    error,
    retryCount,
    refreshLeads,
    importLeads,
    getStats,
    filterLeadsByTags,
    searchLeads
  };
};
