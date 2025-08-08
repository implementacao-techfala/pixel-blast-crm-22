import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { GlowCard } from '@/components/ui/glow-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff, Github, Twitter, Gamepad2 } from 'lucide-react';

// Floating background text component
const FloatingText = () => {
  const words = [
    'DIGITAL', 'SYSTEM', 'CYBER', 'MATRIX', 
    'PROTOCOL', 'ACCESS', 'PORTAL', 'NETWORK', 'CODE',
    'INTERFACE', 'CONNECTION', 'STREAM', 'DATA', 'CLOUD'
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-5">
      {words.map((word, index) => (
        <div
          key={index}
          className="absolute text-cyber-purple font-bold text-8xl md:text-9xl animate-float-slow"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${index * 0.5}s`,
            animationDuration: `${8 + Math.random() * 4}s`,
            transform: `rotate(${Math.random() * 20 - 10}deg)`,
            filter: 'blur(3px)',
          }}
        >
          {word}
        </div>
      ))}
    </div>
  );
};

const NexusLogin = () => {
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
    <div className="min-h-screen relative bg-gradient-to-br from-cyber-dark via-cyber-surface to-cyber-dark overflow-hidden">
      {/* Floating background text */}
      <FloatingText />
      
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyber-purple/5 via-transparent to-cyber-magenta/5 animate-pulse" />
      
      {/* Main content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <GlowCard 
          glowColor="purple" 
          className="w-full max-w-md backdrop-blur-xl bg-cyber-surface/30 border border-cyber-border/30"
          customSize={true}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyber-purple via-cyber-magenta to-cyber-violet bg-clip-text text-transparent mb-2 animate-glow-pulse">
              Login
            </h1>
            <p className="text-muted-foreground text-sm">
              Acesse sua plataforma
            </p>
            <p className="text-cyber-purple/60 text-xs mt-1">
              [Digite suas credenciais para continuar]
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Input */}
            <div className="space-y-2">
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-cyber-surface/50 border-cyber-border/50 text-foreground placeholder:text-muted-foreground focus:border-cyber-purple focus:ring-cyber-purple/30 pl-4 h-12 backdrop-blur-sm"
                  required
                />
              </div>
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
                  className="bg-cyber-surface/50 border-cyber-border/50 text-foreground placeholder:text-muted-foreground focus:border-cyber-purple focus:ring-cyber-purple/30 pl-4 pr-12 h-12 backdrop-blur-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-cyber-purple transition-colors"
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
                  className="border-cyber-border data-[state=checked]:bg-cyber-purple data-[state=checked]:border-cyber-purple"
                />
                <Label htmlFor="remember" className="text-muted-foreground cursor-pointer">
                  Remember me
                </Label>
              </div>
              <button
                type="button"
                className="text-cyber-purple hover:text-cyber-magenta transition-colors"
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
              className="w-full h-12 bg-gradient-to-r from-cyber-purple to-cyber-magenta hover:from-cyber-magenta hover:to-cyber-purple text-primary-foreground font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-cyber-purple/30 transform hover:scale-105"
            >
              {loading ? "Entrando..." : "Fazer Login"}
            </Button>

            {/* Social Login */}
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-cyber-border/30" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-cyber-surface px-2 text-muted-foreground">quick access via</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="bg-cyber-surface/30 border-cyber-border/50 hover:bg-cyber-purple/10 hover:border-cyber-purple/50 transition-all duration-300"
                >
                  <Github className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="bg-cyber-surface/30 border-cyber-border/50 hover:bg-cyber-purple/10 hover:border-cyber-purple/50 transition-all duration-300"
                >
                  <Twitter className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="bg-cyber-surface/30 border-cyber-border/50 hover:bg-cyber-purple/10 hover:border-cyber-purple/50 transition-all duration-300"
                >
                  <Gamepad2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Create Account */}
            <div className="text-center text-sm">
              <span className="text-muted-foreground">Don't have an account? </span>
              <button
                type="button"
                className="text-cyber-purple hover:text-cyber-magenta font-medium transition-colors"
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
      <div className="absolute bottom-4 left-0 right-0 text-center text-cyber-purple/40 text-xs z-20">
        © 2025 Sistema de Gestão. Todos os direitos reservados.
      </div>
    </div>
  );
};

export default NexusLogin;