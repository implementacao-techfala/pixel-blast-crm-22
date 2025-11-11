// ✅ CONFIGURAÇÃO: Credenciais de acesso hardcode
export const AUTH_CONFIG = {
  // Credenciais fixas para acesso ao sistema
  CREDENTIALS: {
    // Credencial REAL - acessa API real
    REAL: {
      email: 'luis.melo@techfala365.com.br',
      password: 'senha123'
    },
    // Credencial DEMO - usa dados mockados
    DEMO: {
      email: 'demo@techfala365.com.br',
      password: 'demo123'
    }
  },
  
  // Configurações de autenticação
  SETTINGS: {
    // Tempo de expiração da sessão (em milissegundos)
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 horas
    
    // Chave para armazenar dados de autenticação no localStorage
    storageKey: 'nexus_auth_data',
    
    // URL de redirecionamento após login bem-sucedido
    redirectUrl: '/dashboard'
  }
};

// ✅ FUNÇÃO: Verificar se as credenciais são válidas
export const validateCredentials = (email: string, password: string): boolean => {
  console.log('🔍 Validando credenciais...');
  console.log('🔍 Email recebido:', email);
  
  // Verificar credencial REAL
  const isRealUser = email === AUTH_CONFIG.CREDENTIALS.REAL.email && 
                     password === AUTH_CONFIG.CREDENTIALS.REAL.password;
  
  // Verificar credencial DEMO
  const isDemoUser = email === AUTH_CONFIG.CREDENTIALS.DEMO.email && 
                     password === AUTH_CONFIG.CREDENTIALS.DEMO.password;
  
  const result = isRealUser || isDemoUser;
  console.log('🔍 Resultado:', result ? '✅ VÁLIDO' : '❌ INVÁLIDO');
  console.log('🔍 Tipo:', isRealUser ? 'REAL' : isDemoUser ? 'DEMO' : 'NENHUM');
  
  return result;
};

// ✅ FUNÇÃO: Verificar se é usuário DEMO
export const isDemoUser = (email: string): boolean => {
  return email === AUTH_CONFIG.CREDENTIALS.DEMO.email;
};

// ✅ FUNÇÃO: Salvar dados de autenticação
export const saveAuthData = (email: string, rememberMe: boolean): void => {
  const authData = {
    email,
    rememberMe,
    timestamp: Date.now(),
    isDemoMode: isDemoUser(email)
  };
  
  localStorage.setItem(AUTH_CONFIG.SETTINGS.storageKey, JSON.stringify(authData));
};

// ✅ FUNÇÃO: Verificar se há dados de autenticação salvos
export const getSavedAuthData = (): { email: string; rememberMe: boolean; isDemoMode: boolean } | null => {
  try {
    const saved = localStorage.getItem(AUTH_CONFIG.SETTINGS.storageKey);
    if (!saved) return null;
    
    const authData = JSON.parse(saved);
    const now = Date.now();
    
    // Verificar se a sessão não expirou
    if (now - authData.timestamp > AUTH_CONFIG.SETTINGS.sessionTimeout) {
      localStorage.removeItem(AUTH_CONFIG.SETTINGS.storageKey);
      return null;
    }
    
    return {
      email: authData.email,
      rememberMe: authData.rememberMe,
      isDemoMode: authData.isDemoMode || isDemoUser(authData.email)
    };
  } catch (error) {
    console.error('Erro ao recuperar dados de autenticação:', error);
    return null;
  }
};

// ✅ FUNÇÃO: Limpar dados de autenticação
export const clearAuthData = (): void => {
  localStorage.removeItem(AUTH_CONFIG.SETTINGS.storageKey);
};
