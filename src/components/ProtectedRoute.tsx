import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

// ✅ INTERFACE: Props do componente
interface ProtectedRouteProps {
  children: React.ReactNode;
}

// ✅ COMPONENTE: Rota protegida que verifica autenticação
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { authData, checkAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // ✅ NOVO: Verificar autenticação sempre que a rota mudar
    console.log('🔍 ProtectedRoute: Verificando autenticação...');
    console.log('🔍 ProtectedRoute: authData atual:', authData);
    
    const isAuthenticated = checkAuth();
    console.log('🔍 ProtectedRoute: Resultado da verificação:', isAuthenticated);
    
    if (!isAuthenticated) {
      console.log('🚫 Usuário não autenticado, redirecionando para login...');
      
      // ✅ NOVO: Salvar a rota que o usuário tentou acessar
      const currentPath = location.pathname;
      if (currentPath !== '/login' && currentPath !== '/') {
        sessionStorage.setItem('redirectAfterLogin', currentPath);
        console.log('🔍 ProtectedRoute: Rota salva para redirecionamento:', currentPath);
      }
      
      navigate('/login', { replace: true });
    } else {
      console.log('✅ Usuário autenticado, permitindo acesso...');
    }
  }, [checkAuth, navigate, location.pathname]);

  // ✅ NOVO: Mostrar loading enquanto verifica autenticação
  if (!authData.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-400 mx-auto mb-4" />
          <p className="text-white text-lg">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // ✅ NOVO: Renderizar conteúdo se autenticado
  return <>{children}</>;
};

export default ProtectedRoute;
