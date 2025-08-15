import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { GlowCard } from '@/components/ui/glow-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff, Github, Twitter, Gamepad2 } from 'lucide-react';

const NexusLogin = () => {
  console.log('NexusLogin component rendering...'); // Debug log
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      if (email && password) {
        toast({
          title: "Acesso autorizado",
          description: "Bem-vindo à plataforma",
        });
        navigate('/dashboard');
      } else {
        toast({
          title: "Acesso negado",
          description: "Credenciais inválidas",
          variant: "destructive",
        });
      }
      setLoading(false);
    }, 1500);
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
              Login
            </h1>
            <p className="text-gray-300 text-sm">
              Acesse sua plataforma
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Input */}
            <div className="space-y-2">
              <Input
                id="email"
                type="email"
                placeholder="Email address"
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
                  placeholder="Password"
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
                  Remember me
                </Label>
              </div>
              <button
                type="button"
                className="text-purple-400 hover:text-purple-300 transition-colors"
                onClick={() => toast({
                  title: "Reset link sent",
                  description: "Check your email for password reset instructions",
                })}
              >
                Forgot password?
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

            {/* Social Login */}
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/20" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-slate-900 px-2 text-gray-400">quick access via</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="bg-white/10 border-white/20 hover:bg-purple-500/20 hover:border-purple-400 transition-all duration-300"
                >
                  <Github className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="bg-white/10 border-white/20 hover:bg-purple-500/20 hover:border-purple-400 transition-all duration-300"
                >
                  <Twitter className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="bg-white/10 border-white/20 hover:bg-purple-500/20 hover:border-purple-400 transition-all duration-300"
                >
                  <Gamepad2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Create Account */}
            <div className="text-center text-sm">
              <span className="text-gray-300">Don't have an account? </span>
              <button
                type="button"
                className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
                onClick={() => toast({
                  title: "Registration",
                  description: "Account creation coming soon!",
                })}
              >
                Create Account
              </button>
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