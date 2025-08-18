import { useState, useEffect } from 'react';

export interface WhatsAppAccount {
  row_number: number;
  id: string | number; // ✅ CORRIGIDO: Pode ser string vazia ou número
  nome_conta: string | number; // ✅ CORRIGIDO: Pode ser string ou número
  telefone: string | number; // ✅ CORRIGIDO: Pode ser string ou número
  status: string; // ✅ CORRIGIDO: Aceita qualquer status
  reputacao: string; // ✅ CORRIGIDO: Aceita qualquer reputação
  criado_em: string; // ✅ CORRIGIDO: Pode ser string vazia
  atualizado_em: string; // ✅ CORRIGIDO: Pode ser string vazia
  id_tag: string | number; // ✅ CORRIGIDO: Pode ser string vazia ou número
}

export const useAccounts = () => {
  const [accounts, setAccounts] = useState<WhatsAppAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);

  const BASE_URL = 'https://automatewebhook.techfala.com.br/webhook/ler_todas_contas';

  // ✅ CORRIGIDO: Função para validar estrutura da conta - mais flexível
  const validateAccountStructure = (account: any): account is WhatsAppAccount => {
    if (!account || typeof account !== 'object') return false;
    
    // ✅ CORRIGIDO: Campos obrigatórios mínimos
    const requiredFields = ['nome_conta', 'telefone', 'status'];
    const hasRequiredFields = requiredFields.every(field => field in account);
    
    if (!hasRequiredFields) {
      console.warn('⚠️ Conta sem campos obrigatórios:', { account, camposFaltando: requiredFields.filter(field => !(field in account)) });
      return false;
    }
    
    // ✅ CORRIGIDO: Validar se nome_conta é válido (não pode ser string vazia ou null)
    if (!account.nome_conta || account.nome_conta === '') {
      console.warn('⚠️ Conta com nome vazio:', account);
      return false;
    }
    
    // ✅ CORRIGIDO: Validar se telefone é válido (não pode ser string vazia ou null)
    if (!account.telefone || account.telefone === '') {
      console.warn('⚠️ Conta com telefone vazio:', account);
      return false;
    }
    
    return true;
  };

  // Função para processar dados da API
  const processApiData = (data: any): WhatsAppAccount[] => {
    console.log('🔄 Processando dados da API de contas...', {
      dadosBrutos: data,
      tipo: typeof data,
      isArray: Array.isArray(data),
      isObject: data && typeof data === 'object',
      tamanho: data ? (Array.isArray(data) ? data.length : 1) : 0
    });
    
    let accountsArray: WhatsAppAccount[] = [];
    
    // ✅ CORRIGIDO: Estratégia para lidar com estrutura aninhada da API
    // Estratégia 1: Se é um array que contém objetos com propriedade 'data'
    if (Array.isArray(data) && data.length > 0 && data[0] && typeof data[0] === 'object' && data[0].data) {
      console.log(`✅ Array com objetos contendo propriedade 'data' encontrado`);
      // Extrair todas as propriedades 'data' dos objetos do array
      const allDataArrays = data.map(item => item.data).filter(Boolean);
      if (allDataArrays.length > 0) {
        // Concatenar todos os arrays de dados
        accountsArray = allDataArrays.flat();
        console.log(`✅ Extraídos ${accountsArray.length} itens de ${allDataArrays.length} arrays de dados`);
      }
    }
    // Estratégia 2: Se já é um array direto
    else if (Array.isArray(data)) {
      console.log(`✅ Dados já são um array com ${data.length} itens`);
      accountsArray = data;
    }
    // Estratégia 3: Se é um objeto com propriedade 'data'
    else if (data && typeof data === 'object' && data.data && Array.isArray(data.data)) {
      console.log(`✅ Encontrada propriedade 'data' com ${data.data.length} itens`);
      accountsArray = data.data;
    }
    // Estratégia 4: Se é um objeto único
    else if (data && typeof data === 'object') {
      console.log('⚠️ ATENÇÃO: API retornou apenas 1 item em vez de array!');
      console.log('🔄 Convertendo objeto único para array');
      accountsArray = [data];
    }
    // Estratégia 5: Se é uma string JSON
    else if (typeof data === 'string') {
      try {
        console.log('🔄 Tentando parsear string JSON');
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          console.log(`✅ String JSON parseada para array com ${parsed.length} itens`);
          accountsArray = parsed;
        } else if (parsed && typeof parsed === 'object' && parsed.data && Array.isArray(parsed.data)) {
          console.log(`✅ String JSON parseada com propriedade 'data' contendo ${parsed.data.length} itens`);
          accountsArray = parsed.data;
        } else if (parsed && typeof parsed === 'object') {
          console.log('⚠️ ATENÇÃO: JSON contém apenas 1 item!');
          accountsArray = [parsed];
        }
      } catch (parseError) {
        console.warn('⚠️ Falha ao parsear string JSON:', parseError);
      }
    }
    // Estratégia 6: Se é null/undefined
    else if (data == null) {
      console.warn('⚠️ Dados são null/undefined');
      return [];
    }
    // Estratégia 7: Formato inesperado
    else {
      console.error('❌ Formato de dados inesperado:', data);
      return [];
    }
    
    // Validar e filtrar contas
    console.log('🔍 Validando contas...');
    const validAccounts = accountsArray.filter(validateAccountStructure);
    
    console.log(`✅ Processamento concluído: ${validAccounts.length} contas válidas de ${accountsArray.length} recebidas`);
    
    return validAccounts;
  };

  // Função principal de busca
  const fetchAccounts = async (forceRefresh = false) => {
    console.log('🔄 fetchAccounts chamada com forceRefresh:', forceRefresh);
    
    try {
      // Verificar se já está carregando
      if (loading && !forceRefresh) {
        console.log('⏳ Já está carregando, aguardando...');
        return;
      }
      
      console.log('🔄 Configurando estado de loading...');
      setLoading(true);
      setError(null);
      
      console.log(`🔄 Iniciando busca de contas...`);
      console.log(`📡 URL: ${BASE_URL}`);
      console.log(`🔍 Headers:`, {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      });
      
      console.log('🔄 Fazendo requisição fetch...');
      const response = await fetch(BASE_URL, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        cache: 'no-store'
      });
      
      console.log('✅ Requisição fetch concluída!');
      console.log('📡 Resposta recebida:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        url: response.url
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      // Tentar obter o texto primeiro para debug
      const responseText = await response.text();
      console.log('📄 Conteúdo bruto da resposta:', responseText);
      console.log('📏 Tamanho do conteúdo:', responseText.length, 'caracteres');
      
      let data: any;
      try {
        data = JSON.parse(responseText);
        console.log('🔍 JSON parseado com sucesso');
      } catch (parseError) {
        console.error('❌ Erro ao parsear JSON:', parseError);
        throw new Error('Resposta não é um JSON válido');
      }
      
      const processedAccounts = processApiData(data);
      
      if (processedAccounts.length === 0) {
        throw new Error('Nenhuma conta válida encontrada na resposta');
      }
      
      // Sucesso! Atualizar estado
      setAccounts(processedAccounts);
      setLastFetchTime(Date.now());
      
      console.log(`✅ Busca bem-sucedida: ${processedAccounts.length} contas carregadas`);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error(`❌ Erro na busca de contas:`, errorMessage);
      setError(errorMessage);
      setAccounts([]);
    } finally {
      setLoading(false);
      console.log('🏁 Busca de contas finalizada');
    }
  };

  // Função para refresh forçado
  const refreshAccounts = () => {
    console.log('🔄 Refresh forçado de contas solicitado');
    fetchAccounts(true);
  };

  // Função para fazer teste detalhado da API
  const testApiEndpoint = async () => {
    console.log('🧪 Iniciando teste detalhado da API de contas...');
    
    try {
      const response = await fetch(BASE_URL, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      
      console.log('📡 Resposta do teste:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        url: response.url
      });
      
      const text = await response.text();
      console.log('📄 Conteúdo bruto da resposta:', text);
      console.log('📏 Tamanho do conteúdo:', text.length, 'caracteres');
      
      try {
        const json = JSON.parse(text);
        console.log('🔍 JSON parseado:', json);
        console.log('📊 Tipo:', typeof json);
        console.log('🔍 É array?', Array.isArray(json));
        console.log('🔍 Tamanho:', Array.isArray(json) ? json.length : 1);
      } catch (parseError) {
        console.error('❌ Erro ao parsear JSON:', parseError);
      }
      
    } catch (error) {
      console.error('❌ Erro no teste da API:', error);
    }
  };

  // Função para obter estatísticas
  const getStats = () => {
    return {
      totalAccounts: accounts.length,
      accountsByStatus: accounts.reduce((acc, account) => {
        acc[account.status] = (acc[account.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      accountsByReputacao: accounts.reduce((acc, account) => {
        acc[account.reputacao] = (acc[account.reputacao] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      lastFetch: lastFetchTime ? new Date(lastFetchTime).toLocaleString('pt-BR') : 'Nunca',
      isLoading: loading,
      hasError: !!error
    };
  };

  // Função para buscar contas por status
  const getAccountsByStatus = (status: string): WhatsAppAccount[] => {
    return accounts.filter(account => account.status === status);
  };

  // Função para buscar contas por reputação
  const getAccountsByReputacao = (reputacao: string): WhatsAppAccount[] => {
    return accounts.filter(account => account.reputacao === reputacao);
  };

  // Função para buscar conta por ID
  const getAccountById = (id: number): WhatsAppAccount | undefined => {
    return accounts.find(account => account.id === id);
  };

  // Função para buscar conta por nome
  const getAccountByName = (nome: string): WhatsAppAccount | undefined => {
    return accounts.find(account => account.nome_conta.toLowerCase() === nome.toLowerCase());
  };

  // Função para buscar conta por telefone
  const getAccountByPhone = (telefone: number): WhatsAppAccount | undefined => {
    return accounts.find(account => account.telefone === telefone);
  };

  // useEffect para carregar contas na inicialização
  useEffect(() => {
    console.log('🚀 useAccounts inicializando...');
    console.log('🔍 URL da API:', BASE_URL);
    console.log('🔍 Estado inicial:', { accounts: accounts.length, loading, error });
    
    console.log('🔄 Fazendo requisição inicial para carregar contas...');
    fetchAccounts();
  }, []);

  // Log de estado para debug
  useEffect(() => {
    console.log('🔍 Estado do useAccounts atualizado:', {
      accountsCount: accounts.length,
      loading,
      error,
      lastFetchTime: lastFetchTime ? new Date(lastFetchTime).toLocaleString('pt-BR') : 'Nunca'
    });
  }, [accounts, loading, error, lastFetchTime]);

  return {
    // Estado principal
    accounts,
    loading,
    error,
    
    // Funções de busca
    fetchAccounts: () => fetchAccounts(false),
    refreshAccounts,
    testApiEndpoint,
    
    // Funções de consulta
    getAccountsByStatus,
    getAccountsByReputacao,
    getAccountById,
    getAccountByName,
    getAccountByPhone,
    
    // Estatísticas e debug
    getStats
  };
};
