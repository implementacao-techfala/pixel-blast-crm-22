import { useState, useEffect, createContext, useContext } from 'react';
import { validateCredentials, saveAuthData, getSavedAuthData, clearAuthData, AUTH_CONFIG, isDemoUser } from '@/config/auth';

// ✅ INTERFACE: Dados de autenticação
interface AuthData {
  email: string;
  isAuthenticated: boolean;
  rememberMe: boolean;
  isDemoMode: boolean; // ✅ NOVO: Indica se está em modo DEMO
}

// ✅ INTERFACE: Contexto de autenticação
interface AuthContextType {
  authData: AuthData;
  login: (email: string, password: string, rememberMe: boolean) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => boolean;
}

// ✅ CONTEXTO: Contexto de autenticação
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ✅ HOOK: Hook de autenticação
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

// ✅ PROVIDER: Provedor de autenticação
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authData, setAuthData] = useState<AuthData>({
    email: '',
    isAuthenticated: false,
    rememberMe: false,
    isDemoMode: false
  });

  // ✅ NOVO: Verificar autenticação na inicialização
  useEffect(() => {
    const savedData = getSavedAuthData();
    if (savedData) {
      setAuthData({
        email: savedData.email,
        isAuthenticated: true,
        rememberMe: savedData.rememberMe,
        isDemoMode: savedData.isDemoMode
      });
    }
  }, []);

  // ✅ FUNÇÃO: Fazer login
  const login = async (email: string, password: string, rememberMe: boolean): Promise<boolean> => {
    try {
      console.log('🔐 Tentativa de login...');
      console.log('🔍 Email recebido:', email);
      console.log('🔍 Senha recebida:', password);
      console.log('🔍 RememberMe:', rememberMe);
      
      // Validar credenciais
      const isValid = validateCredentials(email, password);
      console.log('🔍 Resultado da validação:', isValid);
      
      if (isValid) {
        console.log('✅ Login bem-sucedido');
        
        // Salvar dados se "Lembrar de mim" estiver marcado
        if (rememberMe) {
          console.log('💾 Salvando dados de autenticação...');
          saveAuthData(email, rememberMe);
        }
        
        // Atualizar estado
        console.log('🔄 Atualizando estado de autenticação...');
        const demoMode = isDemoUser(email);
        console.log('🎭 Modo DEMO:', demoMode);
        
        setAuthData({
          email,
          isAuthenticated: true,
          rememberMe,
          isDemoMode: demoMode
        });
        
        console.log('✅ Estado atualizado, retornando true');
        return true;
      } else {
        console.log('❌ Credenciais inválidas');
        return false;
      }
    } catch (error) {
      console.error('❌ Erro durante login:', error);
      return false;
    }
  };

  // ✅ FUNÇÃO: Fazer logout
  const logout = () => {
    console.log('🚪 Fazendo logout...');
    
    // Limpar dados salvos
    clearAuthData();
    
    // Resetar estado
    setAuthData({
      email: '',
      isAuthenticated: false,
      rememberMe: false,
      isDemoMode: false
    });
  };

  // ✅ FUNÇÃO: Verificar se está autenticado
  const checkAuth = (): boolean => {
    console.log('🔍 checkAuth: Verificando autenticação...');
    console.log('🔍 checkAuth: Estado atual:', authData);
    
    // ✅ NOVO: Verificar primeiro o estado atual
    if (authData.isAuthenticated && authData.email) {
      console.log('🔍 checkAuth: Usuário já autenticado no estado atual');
      return true;
    }
    
    // ✅ NOVO: Se não estiver no estado, verificar localStorage
    const savedData = getSavedAuthData();
    console.log('🔍 checkAuth: Dados salvos no localStorage:', savedData);
    
    if (savedData) {
      console.log('🔍 checkAuth: Dados encontrados no localStorage, atualizando estado...');
      setAuthData(prev => ({
        ...prev,
        isAuthenticated: true,
        email: savedData.email,
        rememberMe: savedData.rememberMe,
        isDemoMode: savedData.isDemoMode
      }));
      return true;
    }
    
    console.log('🔍 checkAuth: Nenhuma autenticação encontrada');
    return false;
  };

  const value: AuthContextType = {
    authData,
    login,
    logout,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
