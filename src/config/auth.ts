// ✅ CONFIGURAÇÃO: Credenciais de acesso hardcode
export const AUTH_CONFIG = {
  // Credenciais fixas para acesso ao sistema
  CREDENTIALS: {
    email: 'luis.melo@techfala365.com.br',
    password: 'senha123'
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
  console.log('🔍 Email esperado:', AUTH_CONFIG.CREDENTIALS.email);
  console.log('🔍 Email recebido:', email);
  console.log('🔍 Senha esperada:', AUTH_CONFIG.CREDENTIALS.password);
  console.log('🔍 Senha recebida:', password);
  
  const emailMatch = email === AUTH_CONFIG.CREDENTIALS.email;
  const passwordMatch = password === AUTH_CONFIG.CREDENTIALS.password;
  
  console.log('🔍 Email coincide:', emailMatch);
  console.log('🔍 Senha coincide:', passwordMatch);
  
  const result = emailMatch && passwordMatch;
  console.log('🔍 Resultado final:', result);
  
  return result;
};

// ✅ FUNÇÃO: Salvar dados de autenticação
export const saveAuthData = (email: string, rememberMe: boolean): void => {
  const authData = {
    email,
    rememberMe,
    timestamp: Date.now()
  };
  
  localStorage.setItem(AUTH_CONFIG.SETTINGS.storageKey, JSON.stringify(authData));
};

// ✅ FUNÇÃO: Verificar se há dados de autenticação salvos
export const getSavedAuthData = (): { email: string; rememberMe: boolean } | null => {
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
      rememberMe: authData.rememberMe
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
