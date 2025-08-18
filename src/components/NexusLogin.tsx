import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { GlowCard } from '@/components/ui/glow-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff } from 'lucide-react';

const NexusLogin = () => {
  console.log('NexusLogin component rendering...'); // Debug log
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login, authData } = useAuth();

  // ✅ NOVO: Carregar dados salvos na inicialização
  useEffect(() => {
    if (authData.email && authData.rememberMe) {
      setEmail(authData.email);
      setRememberMe(authData.rememberMe);
    }
  }, [authData]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // ✅ NOVO: Validação com credenciais hardcode
      console.log('🔐 Validando credenciais...');
      
      if (!email.trim() || !password.trim()) {
        toast({
          title: "Campos obrigatórios",
          description: "Por favor, preencha email e senha",
          variant: "destructive",
        });
        return;
      }

      // ✅ NOVO: Usar hook de autenticação
      const success = await login(email, password, rememberMe);
      
      console.log('🔍 Resultado do login:', success);
      console.log('🔍 Email usado:', email);
      console.log('🔍 Senha usada:', password);
      
      if (success) {
        console.log('✅ Login bem-sucedido, redirecionando...');
        
        toast({
          title: "Acesso autorizado",
          description: "Bem-vindo à plataforma",
        });
        
        // ✅ NOVO: Verificar se há uma rota de redirecionamento salva
        const redirectPath = sessionStorage.getItem('redirectAfterLogin');
        console.log('🔍 Rota de redirecionamento salva:', redirectPath);
        
        if (redirectPath) {
          console.log('🔄 Redirecionando para:', redirectPath);
          sessionStorage.removeItem('redirectAfterLogin');
          navigate(redirectPath);
        } else {
          // ✅ NOVO: Redirecionar para dashboard padrão
          console.log('🔄 Redirecionando para dashboard padrão');
          navigate('/dashboard');
        }
      } else {
        console.log('❌ Credenciais inválidas');
        toast({
          title: "Acesso negado",
          description: "Email ou senha incorretos",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('❌ Erro durante login:', error);
      toast({
        title: "Erro no sistema",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      {/* Main content */}
      <div className="w-full max-w-md">
        <GlowCard 
          glowColor="purple" 
          className="w-full backdrop-blur-xl bg-white/10 border border-white/20"
          customSize={true}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              Acesso ao Sistema
            </h1>
            <p className="text-gray-300 text-sm">
              Digite suas credenciais para continuar
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Input */}
            <div className="space-y-2">
              <Input
                id="email"
                type="email"
                placeholder="Digite seu email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-purple-400/30 h-12"
                required
              />
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-purple-400/30 pr-12 h-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-purple-400 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Remember me & Forgot password */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  className="border-white/20 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
                />
                <Label htmlFor="remember" className="text-gray-300 cursor-pointer">
                  Lembrar de mim
                </Label>
              </div>
              <button
                type="button"
                className="text-purple-400 hover:text-purple-300 transition-colors"
                onClick={() => toast({
                  title: "Link de redefinição enviado",
                  description: "Verifique seu email para instruções de redefinição de senha",
                })}
              >
                Esqueceu a senha?
              </button>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold transition-all duration-300 hover:scale-105"
            >
              {loading ? "Entrando..." : "Fazer Login"}
            </Button>

            {/* ✅ REMOVIDO: Login social - não implementado */}

            {/* ✅ MODIFICADO: Botão de cadastro desabilitado */}
            <div className="text-center text-sm">
              <span className="text-gray-300">Não tem uma conta? </span>
              <span className="text-gray-500 italic">
                Acesso restrito - entre em contato com o administrador
              </span>
            </div>
          </form>
        </GlowCard>
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 left-0 right-0 text-center text-purple-400/60 text-xs">
        © 2025 Sistema de Gestão. Todos os direitos reservados.
      </div>
    </div>
  );
};

export default NexusLogin;