import { useState } from 'react';
import { BackgroundGraph } from '@/components/ui/background-graph';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, User, Bell, Shield, Palette, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // User settings
  const [userName, setUserName] = useState('João Silva');
  const [userEmail, setUserEmail] = useState('joao@empresa.com');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [campaignAlerts, setCampaignAlerts] = useState(true);
  const [dailyReports, setDailyReports] = useState(false);
  
  // App settings
  const [timezone, setTimezone] = useState('America/Sao_Paulo');
  const [language, setLanguage] = useState('pt-BR');
  const [theme, setTheme] = useState('dark');

  const handleSaveProfile = () => {
    toast({
      title: "Perfil atualizado!",
      description: "Suas informações foram salvas com sucesso",
    });
  };

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos de senha",
        variant: "destructive"
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Erro",
        description: "A nova senha e confirmação não coincidem",
        variant: "destructive"
      });
      return;
    }

    // Reset form
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');

    toast({
      title: "Senha alterada!",
      description: "Sua senha foi atualizada com sucesso",
    });
  };

  const handleSaveNotifications = () => {
    toast({
      title: "Notificações atualizadas!",
      description: "Suas preferências foram salvas",
    });
  };

  const handleSaveAppSettings = () => {
    toast({
      title: "Configurações salvas!",
      description: "As configurações do aplicativo foram atualizadas",
    });
  };

  return (
    <div className="min-h-screen relative">
      <BackgroundGraph className="absolute inset-0 z-0" />
      
      <div className="relative z-10 flex flex-col min-h-screen p-4">
        <div className="max-w-4xl mx-auto w-full">
          {/* Header */}
          <div className="flex items-center space-x-4 mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="text-cyber-blue hover:text-cyber-green hover:bg-cyber-surface"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyber-green to-cyber-blue bg-clip-text text-transparent">
              Configurações
            </h1>
          </div>

          <div className="space-y-6">
            {/* Profile Settings */}
            <Card className="bg-card/80 backdrop-blur-sm border-cyber-border">
              <CardHeader>
                <CardTitle className="flex items-center text-cyber-green">
                  <User className="h-5 w-5 mr-2" />
                  Perfil do Usuário
                </CardTitle>
                <CardDescription>
                  Gerencie suas informações pessoais
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input
                      id="name"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="bg-muted/50 border-cyber-border focus:border-cyber-green"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      className="bg-muted/50 border-cyber-border focus:border-cyber-green"
                    />
                  </div>
                </div>
                <Button 
                  onClick={handleSaveProfile}
                  className="bg-primary hover:bg-primary/90"
                >
                  Salvar Perfil
                </Button>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card className="bg-card/80 backdrop-blur-sm border-cyber-border">
              <CardHeader>
                <CardTitle className="flex items-center text-cyber-green">
                  <Shield className="h-5 w-5 mr-2" />
                  Segurança
                </CardTitle>
                <CardDescription>
                  Altere sua senha e configurações de segurança
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Senha Atual</Label>
                    <Input
                      id="current-password"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="bg-muted/50 border-cyber-border focus:border-cyber-green"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">Nova Senha</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="bg-muted/50 border-cyber-border focus:border-cyber-green"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirmar Senha</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="bg-muted/50 border-cyber-border focus:border-cyber-green"
                    />
                  </div>
                </div>
                <Button 
                  onClick={handleChangePassword}
                  className="bg-primary hover:bg-primary/90"
                >
                  Alterar Senha
                </Button>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card className="bg-card/80 backdrop-blur-sm border-cyber-border">
              <CardHeader>
                <CardTitle className="flex items-center text-cyber-green">
                  <Bell className="h-5 w-5 mr-2" />
                  Notificações
                </CardTitle>
                <CardDescription>
                  Configure como você quer receber notificações
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Notificações por Email</h4>
                    <p className="text-sm text-muted-foreground">Receba atualizações por email</p>
                  </div>
                  <Switch
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>
                <Separator className="bg-cyber-border" />
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Notificações Push</h4>
                    <p className="text-sm text-muted-foreground">Receba notificações no navegador</p>
                  </div>
                  <Switch
                    checked={pushNotifications}
                    onCheckedChange={setPushNotifications}
                  />
                </div>
                <Separator className="bg-cyber-border" />
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Alertas de Campanha</h4>
                    <p className="text-sm text-muted-foreground">Seja notificado sobre status das campanhas</p>
                  </div>
                  <Switch
                    checked={campaignAlerts}
                    onCheckedChange={setCampaignAlerts}
                  />
                </div>
                <Separator className="bg-cyber-border" />
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Relatórios Diários</h4>
                    <p className="text-sm text-muted-foreground">Receba resumos diários por email</p>
                  </div>
                  <Switch
                    checked={dailyReports}
                    onCheckedChange={setDailyReports}
                  />
                </div>
                <Button 
                  onClick={handleSaveNotifications}
                  className="bg-primary hover:bg-primary/90"
                >
                  Salvar Notificações
                </Button>
              </CardContent>
            </Card>

            {/* App Settings */}
            <Card className="bg-card/80 backdrop-blur-sm border-cyber-border">
              <CardHeader>
                <CardTitle className="flex items-center text-cyber-green">
                  <Palette className="h-5 w-5 mr-2" />
                  Configurações do Aplicativo
                </CardTitle>
                <CardDescription>
                  Personalize a experiência do aplicativo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Fuso Horário</Label>
                    <Select value={timezone} onValueChange={setTimezone}>
                      <SelectTrigger className="bg-muted/50 border-cyber-border focus:border-cyber-green">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/Sao_Paulo">São Paulo (UTC-3)</SelectItem>
                        <SelectItem value="America/New_York">Nova York (UTC-5)</SelectItem>
                        <SelectItem value="Europe/London">Londres (UTC+0)</SelectItem>
                        <SelectItem value="Asia/Tokyo">Tóquio (UTC+9)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language">Idioma</Label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger className="bg-muted/50 border-cyber-border focus:border-cyber-green">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                        <SelectItem value="en-US">English (US)</SelectItem>
                        <SelectItem value="es-ES">Español</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="theme">Tema</Label>
                    <Select value={theme} onValueChange={setTheme}>
                      <SelectTrigger className="bg-muted/50 border-cyber-border focus:border-cyber-green">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dark">Escuro (Cyber)</SelectItem>
                        <SelectItem value="light">Claro</SelectItem>
                        <SelectItem value="auto">Automático</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button 
                  onClick={handleSaveAppSettings}
                  className="bg-primary hover:bg-primary/90"
                >
                  Salvar Configurações
                </Button>
              </CardContent>
            </Card>

            {/* Account Info */}
            <Card className="bg-card/80 backdrop-blur-sm border-cyber-border">
              <CardHeader>
                <CardTitle className="flex items-center text-cyber-green">
                  <Globe className="h-5 w-5 mr-2" />
                  Informações da Conta
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Plano Atual:</p>
                    <p className="font-medium text-cyber-green">Pro</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Conta criada em:</p>
                    <p className="font-medium">15/01/2024</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Última atualização:</p>
                    <p className="font-medium">Hoje às 14:30</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Status:</p>
                    <p className="font-medium text-cyber-green">Ativo</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;