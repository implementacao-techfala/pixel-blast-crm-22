import { BackgroundGraph } from '@/components/ui/background-graph';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, MessageSquare, Send, Settings, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  const menuItems = [
    {
      title: "Leads & Clientes",
      description: "Gerencie seus contatos e leads",
      icon: Users,
      path: "/leads",
      color: "from-cyber-purple to-cyber-violet",
      locked: false
    },
    {
      title: "Contas WhatsApp",
      description: "Conecte e gerencie números",
      icon: MessageSquare,
      path: "/accounts",
      color: "from-cyber-violet to-cyber-purple",
      locked: false
    },
    {
      title: "Campanhas",
      description: "Crie e agende disparos",
      icon: Send,
      path: "/campaigns",
      color: "from-cyber-magenta to-cyber-violet",
      locked: false
    },
    {
      title: "Configurações",
      description: "Configurações da conta",
      icon: Settings,
      path: "/settings",
      color: "from-accent to-cyber-purple",
      locked: true
    }
  ];

  const handleItemClick = (item: any) => {
    if (item.locked) {
      // ✅ BLOQUEADO: Não navegar para configurações
      return;
    }
    navigate(item.path);
  };

  return (
    <div className="min-h-screen relative">
      <BackgroundGraph className="absolute inset-0 z-0" />
      
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-cyber-purple via-cyber-magenta to-cyber-violet bg-clip-text text-transparent animate-glow-pulse">
            Sistema de Gestão
          </h1>
          <p className="text-lg text-muted-foreground">
            Escolha uma seção para começar
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <Card 
                key={item.path}
                className={`group ${item.locked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:border-cyber-purple hover:shadow-xl hover:shadow-cyber-purple/20'} bg-card/80 backdrop-blur-sm border-cyber-border transition-all duration-300 animate-fade-in`}
                onClick={() => handleItemClick(item)}
              >
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 p-3 rounded-full bg-gradient-to-br from-cyber-surface to-muted relative">
                    <IconComponent className="h-8 w-8 text-cyber-purple group-hover:text-cyber-magenta transition-colors duration-300" />
                    {/* ✅ NOVO: Cadeado para configurações bloqueadas */}
                    {item.locked && (
                      <div className="absolute -top-2 -right-2 p-1.5 rounded-full bg-cyber-red/90 border-2 border-cyber-border">
                        <Lock className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                  <CardTitle className={`text-xl font-semibold bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}>
                    {item.title}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {item.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    className={`w-full font-semibold transition-all duration-300 ${
                      item.locked 
                        ? 'bg-muted text-muted-foreground cursor-not-allowed hover:bg-muted' 
                        : 'bg-primary hover:bg-primary/90 text-primary-foreground group-hover:shadow-lg group-hover:shadow-cyber-purple/30'
                    }`}
                    disabled={item.locked}
                  >
                    {item.locked ? 'Bloqueado' : 'Acessar'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Button
          variant="ghost"
          className="mt-8 text-cyber-purple hover:text-cyber-magenta hover:bg-cyber-surface/50 transition-all duration-300"
          onClick={() => navigate('/login')}
        >
          Sair
        </Button>
      </div>
    </div>
  );
};

export default Dashboard;