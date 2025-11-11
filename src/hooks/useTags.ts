import { useState, useEffect } from 'react';
import { getSavedAuthData } from '@/config/auth';
import { mockTags } from '@/config/mockData';

export interface Tag {
  row_number: number;
  id: number;
  nome: string;
  tipo: string;
  criado_em: string;
  atualizado_em: string;
}

export const useTags = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);

  const BASE_URL = 'https://automatewebhook.techfala.com.br/webhook/ler_todas_as_tags';

  // Função para validar estrutura da tag
  const validateTagStructure = (tag: any): tag is Tag => {
    if (!tag || typeof tag !== 'object') return false;
    
    const requiredFields = ['nome', 'tipo', 'id'];
    const hasRequiredFields = requiredFields.every(field => field in tag);
    
    if (!hasRequiredFields) {
      console.warn('⚠️ Tag sem campos obrigatórios:', { tag, camposFaltando: requiredFields.filter(field => !(field in tag)) });
      return false;
    }
    
    // Validar tipos dos campos
    if (typeof tag.nome !== 'string' || typeof tag.tipo !== 'string' || typeof tag.id !== 'number') {
      console.warn('⚠️ Tag com tipos inválidos:', { 
        tag, 
        tipos: {
          nome: typeof tag.nome,
          tipo: typeof tag.tipo,
          id: typeof tag.id
        }
      });
      return false;
    }
    
    return true;
  };

  // Função para processar dados da API
  const processApiData = (data: any): Tag[] => {
    console.log('🔄 Processando dados da API de tags...', {
      dadosBrutos: data,
      tipo: typeof data,
      isArray: Array.isArray(data),
      isObject: data && typeof data === 'object',
      tamanho: data ? (Array.isArray(data) ? data.length : 1) : 0
    });
    
    // Verificar se é resposta de workflow iniciado
    if (data && typeof data === 'object' && data.message === 'Workflow was started') {
      console.log('🔄 Workflow iniciado - aguardando dados...');
      return []; // Retorna array vazio para indicar que está processando
    }
    
    let tagsArray: Tag[] = [];
    
    // Estratégia 1: Se já é um array
    if (Array.isArray(data)) {
      console.log(`✅ Dados já são um array com ${data.length} itens`);
      tagsArray = data;
    }
    // Estratégia 2: Se é um objeto com propriedade 'data'
    else if (data && typeof data === 'object' && data.data && Array.isArray(data.data)) {
      console.log(`✅ Encontrada propriedade 'data' com ${data.data.length} itens`);
      tagsArray = data.data;
    }
    // Estratégia 3: Se é um objeto único
    else if (data && typeof data === 'object') {
      console.log('⚠️ ATENÇÃO: API retornou apenas 1 item em vez de array!');
      console.log('🔄 Convertendo objeto único para array');
      tagsArray = [data];
    }
    // Estratégia 4: Se é uma string JSON
    else if (typeof data === 'string') {
      try {
        console.log('🔄 Tentando parsear string JSON');
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          console.log(`✅ String JSON parseada para array com ${parsed.length} itens`);
          tagsArray = parsed;
        } else if (parsed && typeof parsed === 'object' && parsed.data && Array.isArray(parsed.data)) {
          console.log(`✅ String JSON parseada com propriedade 'data' contendo ${parsed.data.length} itens`);
          tagsArray = parsed.data;
        } else if (parsed && typeof parsed === 'object') {
          console.log('⚠️ ATENÇÃO: JSON contém apenas 1 item!');
          tagsArray = [parsed];
        }
      } catch (parseError) {
        console.warn('⚠️ Falha ao parsear string JSON:', parseError);
      }
    }
    // Estratégia 5: Se é null/undefined
    else if (data == null) {
      console.warn('⚠️ Dados são null/undefined');
      return [];
    }
    // Estratégia 6: Formato inesperado
    else {
      console.error('❌ Formato de dados inesperado:', data);
      return [];
    }
    
    // Validar e filtrar tags
    console.log('🔍 Validando tags...');
    const validTags = tagsArray.filter(validateTagStructure);
    
    console.log(`✅ Processamento concluído: ${validTags.length} tags válidas de ${tagsArray.length} recebidas`);
    
    return validTags;
  };

  // Função para buscar tags da API
  const fetchTags = async (forceRefresh: boolean = false) => {
    try {
      setLoading(true);
      setError(null);
      
      // ✅ VERIFICAR MODO DEMO
      const authData = getSavedAuthData();
      if (authData?.isDemoMode) {
        console.log('🎭 MODO DEMO ATIVADO - Usando tags mockadas');
        // Simular delay de rede
        await new Promise(resolve => setTimeout(resolve, 300));
        setTags(mockTags);
        setLastFetchTime(Date.now());
        setLoading(false);
        console.log(`✅ DEMO: ${mockTags.length} tags mockadas carregadas`);
        return;
      }
      
      console.log('🔄 Buscando tags da API...', { forceRefresh, url: BASE_URL });
      
      const response = await fetch(BASE_URL, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const responseText = await response.text();
      console.log('📄 Resposta bruta da API:', responseText);

      let data: any;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ Erro ao parsear resposta JSON:', parseError);
        throw new Error('Resposta da API não é um JSON válido');
      }

      console.log('📥 Dados parseados da API:', data);

      // ✅ CORRIGIDO: Processar dados sem polling complexo
      const processedTags = processApiData(data);
      
      if (processedTags.length === 0) {
        console.warn('⚠️ Nenhuma tag válida encontrada na resposta');
        setTags([]);
      } else {
        // Sucesso! Atualizar estado
        setTags(processedTags);
        setLastFetchTime(Date.now());
        console.log(`✅ Busca bem-sucedida: ${processedTags.length} tags carregadas`);
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error(`❌ Erro na busca de tags:`, errorMessage);
      setError(errorMessage);
      // ✅ CORRIGIDO: Não zerar tags em caso de erro para manter dados existentes
      // setTags([]); // REMOVIDO: Não zerar dados existentes
    } finally {
      setLoading(false);
      console.log('🏁 Busca de tags finalizada');
    }
  };

  // ✅ NOVO: Função para refresh forçado - APENAS quando solicitado manualmente
  const refreshTags = () => {
    console.log('🔄 Refresh forçado solicitado MANUALMENTE pelo usuário');
    console.log('📊 Tags atuais antes do refresh:', tags.length);
    fetchTags(true);
  };



  // Função para obter estatísticas
  const getStats = () => {
    return {
      totalTags: tags.length,
      tagsByType: tags.reduce((acc, tag) => {
        acc[tag.tipo] = (acc[tag.tipo] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      lastFetch: lastFetchTime ? new Date(lastFetchTime).toLocaleString('pt-BR') : 'Nunca',
      retryCount,
      isLoading: loading,
      hasError: !!error
    };
  };

  // Função para buscar tags por tipo com fallback
  const getTagsByType = (tipo: string): Tag[] => {
    const filtered = tags.filter(tag => tag.tipo === tipo);
    
    if (filtered.length === 0) {
      console.warn(`⚠️ Nenhuma tag encontrada para o tipo: ${tipo}`);
      // Fallback: retornar todas as tags se não encontrar por tipo
      return tags.length > 0 ? tags : [];
    }
    
    return filtered;
  };

  // Função para obter nomes das tags com validação
  const getTagNames = (): string[] => {
    if (tags.length === 0) {
      console.warn('⚠️ Nenhuma tag disponível para extrair nomes');
      return [];
    }
    
    const names = tags.map(tag => tag.nome).filter(Boolean);
    
    if (names.length !== tags.length) {
      console.warn(`⚠️ ${tags.length - names.length} tags sem nome válido`);
    }
    
    return names;
  };

  // Função para obter nomes por tipo com fallback
  const getTagNamesByType = (tipo: string): string[] => {
    const typeTags = getTagsByType(tipo);
    return typeTags.map(tag => tag.nome).filter(Boolean);
  };

  // Função para buscar tag por ID
  const getTagById = (id: number): Tag | undefined => {
    return tags.find(tag => tag.id === id);
  };

  // Função para buscar tag por nome
  const getTagByName = (nome: string): Tag | undefined => {
    return tags.find(tag => tag.nome.toLowerCase() === nome.toLowerCase());
  };

  // Função para verificar se uma tag existe
  const tagExists = (nome: string): boolean => {
    return tags.some(tag => tag.nome.toLowerCase() === nome.toLowerCase());
  };

  // useEffect para carregar tags na inicialização
  useEffect(() => {
    console.log('🚀 useTags inicializando...');
    console.log('🔍 URL da API:', BASE_URL);
    console.log('🔍 Estado inicial:', { tags: tags.length, loading, error, retryCount });
    
    // ✅ CORRIGIDO: Sempre fazer requisição inicial, mas apenas uma vez
    if (tags.length === 0) {
      console.log('🔄 Fazendo requisição inicial para carregar tags...');
      fetchTags();
    } else {
      console.log('✅ Tags já carregadas, pulando requisição inicial');
      setLoading(false);
    }
  }, []); // ✅ CORRIGIDO: Dependências vazias para executar apenas uma vez

  // Log de estado para debug
  useEffect(() => {
    console.log('🔍 Estado do useTags atualizado:', {
      tagsCount: tags.length,
      loading,
      error,
      retryCount,
      lastFetchTime: lastFetchTime ? new Date(lastFetchTime).toLocaleString('pt-BR') : 'Nunca'
    });
  }, [tags, loading, error, retryCount, lastFetchTime]);

  return {
    // Estado principal
    tags,
    loading,
    error,
    retryCount,
    
    // Funções de busca
    fetchTags: () => fetchTags(false),
    refreshTags,
    
    // Funções de consulta
    getTagsByType,
    getTagNames,
    getTagNamesByType,
    getTagById,
    getTagByName,
    tagExists,
    
    // Estatísticas e debug
    getStats
  };
};
