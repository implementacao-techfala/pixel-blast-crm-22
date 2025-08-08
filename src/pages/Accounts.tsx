import { useState } from 'react';
import { BackgroundGraph } from '@/components/ui/background-graph';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Plus, Smartphone, Wifi, WifiOff, QrCode } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { sendWebhookNotification, generateQRCode, WEBHOOK_ACTIONS } from '@/lib/webhook';

interface WhatsAppAccount {
  id: string;
  name: string;
  phone: string;
  status: 'connected' | 'disconnected' | 'connecting';
  lastActivity: string;
  profilePicture?: string;
  health: {
    messagesDelivered: number;
    messagesRead: number;
    messagesFailed: number;
    noResponseCount: number;
    healthScore: number; // 0-100
  };
}

const mockAccounts: WhatsAppAccount[] = [
  {
    id: '1',
    name: 'Conta Principal',
    phone: '+55 11 99999-1234',
    status: 'connected',
    lastActivity: '2024-01-15 14:30',
    health: {
      messagesDelivered: 892,
      messagesRead: 734,
      messagesFailed: 23,
      noResponseCount: 158,
      healthScore: 85
    }
  },
  {
    id: '2',
    name: 'Vendas',
    phone: '+55 11 98888-5678',
    status: 'connected',
    lastActivity: '2024-01-15 13:45',
    health: {
      messagesDelivered: 456,
      messagesRead: 321,
      messagesFailed: 12,
      noResponseCount: 135,
      healthScore: 78
    }
  },
  {
    id: '3',
    name: 'Suporte',
    phone: '+55 11 97777-9012',
    status: 'disconnected',
    lastActivity: '2024-01-14 16:20',
    health: {
      messagesDelivered: 234,
      messagesRead: 198,
      messagesFailed: 45,
      noResponseCount: 36,
      healthScore: 62
    }
  }
];

const Accounts = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [accounts, setAccounts] = useState(mockAccounts);
  const [showQrCode, setShowQrCode] = useState(false);
  const [qrCodeData, setQrCodeData] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [accountName, setAccountName] = useState('');
  const [accountPhone, setAccountPhone] = useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-cyber-green/20 text-cyber-green border-cyber-green/30';
      case 'disconnected': return 'bg-destructive/20 text-destructive border-destructive/30';
      case 'connecting': return 'bg-cyber-blue/20 text-cyber-blue border-cyber-blue/30';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-cyber-green';
    if (score >= 60) return 'text-warning-foreground';
    return 'text-destructive';
  };

  const getHealthBadgeColor = (score: number) => {
    if (score >= 80) return 'bg-cyber-green/20 text-cyber-green border-cyber-green/30';
    if (score >= 60) return 'bg-warning/20 text-warning-foreground border-warning/30';
    return 'bg-destructive/20 text-destructive border-destructive/30';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <Wifi className="h-4 w-4" />;
      case 'disconnected': return <WifiOff className="h-4 w-4" />;
      case 'connecting': return <Wifi className="h-4 w-4 animate-pulse" />;
      default: return <WifiOff className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected': return 'Conectado';
      case 'disconnected': return 'Desconectado';
      case 'connecting': return 'Conectando...';
      default: return 'Desconhecido';
    }
  };

  const handleAddAccount = async () => {
    if (!accountName.trim() || !accountPhone.trim()) {
      toast({
        title: "Dados obrigatórios",
        description: "Por favor, preencha o nome e número da conta",
        variant: "destructive"
      });
      return;
    }

    try {
      // Gerar QR Code real do servidor
      const qrResponse = await generateQRCode(accountName, accountPhone);
      
      if (!qrResponse.success || !qrResponse.qrCode) {
        toast({
          title: "Erro ao gerar QR Code",
          description: qrResponse.error || "Falha na comunicação com o servidor",
          variant: "destructive"
        });
        return;
      }

      setQrCodeData(qrResponse.qrCode);
      setShowAddForm(false);
      setShowQrCode(true);
      
      toast({
        title: "QR Code gerado!",
        description: "Escaneie o código com seu WhatsApp para conectar",
      });

      // Simular conexão após 5 segundos (aguardando implementação real do webhook)
      setTimeout(async () => {
        const newAccount: WhatsAppAccount = {
          id: Date.now().toString(),
          name: accountName,
          phone: accountPhone,
          status: 'connected',
          lastActivity: new Date().toLocaleString('pt-BR'),
          health: {
            messagesDelivered: 0,
            messagesRead: 0,
            messagesFailed: 0,
            noResponseCount: 0,
            healthScore: 100
          }
        };
        
        setAccounts([...accounts, newAccount]);
        setShowQrCode(false);
        setAccountName('');
        setAccountPhone('');
        
        toast({
          title: "Conta conectada com sucesso!",
          description: "Sua nova conta WhatsApp está pronta para uso",
        });
      }, 5000);
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast({
        title: "Erro",
        description: "Falha ao gerar QR Code. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleDisconnect = async (accountId: string) => {
    const account = accounts.find(acc => acc.id === accountId);
    
    setAccounts(accounts.map(account => 
      account.id === accountId 
        ? { ...account, status: 'disconnected' as const }
        : account
    ));

    // Send webhook notification
    if (account) {
      await sendWebhookNotification(
        WEBHOOK_ACTIONS.WHATSAPP_DISCONNECTED,
        'user-id-placeholder', // Replace with actual user ID
        {
          accountId: account.id,
          accountName: account.name,
          phone: account.phone
        }
      );
    }
    
    toast({
      title: "Conta desconectada",
      description: "A conta foi desconectada com sucesso",
    });
  };

  const handleReconnect = async (accountId: string) => {
    const account = accounts.find(acc => acc.id === accountId);
    
    setAccounts(accounts.map(account => 
      account.id === accountId 
        ? { ...account, status: 'connecting' as const }
        : account
    ));
    
    // Simular reconexão
    setTimeout(async () => {
      setAccounts(accounts.map(account => 
        account.id === accountId 
          ? { 
              ...account, 
              status: 'connected' as const,
              lastActivity: new Date().toLocaleString('pt-BR')
            }
          : account
      ));

      // Send webhook notification
      if (account) {
        await sendWebhookNotification(
          WEBHOOK_ACTIONS.WHATSAPP_CONNECTED,
          'user-id-placeholder', // Replace with actual user ID
          {
            accountId: account.id,
            accountName: account.name,
            phone: account.phone,
            action: 'reconnected'
          }
        );
      }
      
      toast({
        title: "Conta reconectada!",
        description: "A conta está novamente ativa",
      });
    }, 3000);
  };

  return (
    <div className="min-h-screen relative">
      <BackgroundGraph className="absolute inset-0 z-0" />
      
      <div className="relative z-10 flex flex-col min-h-screen p-4">
        <div className="max-w-7xl mx-auto w-full">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/dashboard')}
                className="text-cyber-blue hover:text-cyber-green hover:bg-cyber-surface"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyber-green to-cyber-blue bg-clip-text text-transparent">
                Contas WhatsApp
              </h1>
            </div>
            
            <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-cyber-green/20"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Conectar Nova Conta
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md bg-card/90 backdrop-blur-sm border-cyber-border">
                <DialogHeader>
                  <DialogTitle className="text-cyber-green">Nova Conta WhatsApp</DialogTitle>
                  <DialogDescription>
                    Preencha os dados da conta para gerar o QR Code
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="accountName">Nome da Conta</Label>
                    <Input
                      id="accountName"
                      placeholder="Ex: Vendas, Suporte, Principal..."
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      className="bg-background/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accountPhone">Número do WhatsApp</Label>
                    <Input
                      id="accountPhone"
                      placeholder="Ex: +55 11 99999-9999"
                      value={accountPhone}
                      onChange={(e) => setAccountPhone(e.target.value)}
                      className="bg-background/50"
                    />
                  </div>
                  <Button 
                    onClick={handleAddAccount}
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    Gerar QR Code
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={showQrCode} onOpenChange={setShowQrCode}>
              <DialogContent className="sm:max-w-md bg-card/90 backdrop-blur-sm border-cyber-border">
                <DialogHeader>
                  <DialogTitle className="text-cyber-green">Conectar WhatsApp</DialogTitle>
                  <DialogDescription>
                    Escaneie este QR Code com seu WhatsApp
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-48 h-48 bg-white rounded-lg flex items-center justify-center p-2">
                    {qrCodeData ? (
                      <img 
                        src={`data:image/png;base64,${qrCodeData}`} 
                        alt="QR Code WhatsApp" 
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <QrCode className="h-32 w-32 text-gray-800" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    1. Abra o WhatsApp no seu telefone<br/>
                    2. Vá em Menu {'>'} Dispositivos Conectados<br/>
                    3. Toque em "Conectar um dispositivo"<br/>
                    4. Escaneie este QR Code
                  </p>
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-cyber-green rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-cyber-blue rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-cyber-teal rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                  <p className="text-xs text-cyber-blue">Aguardando conexão...</p>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Accounts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accounts.map((account) => (
              <Card key={account.id} className="bg-card/80 backdrop-blur-sm border-cyber-border hover:border-cyber-green transition-all duration-300 hover:shadow-lg hover:shadow-cyber-green/10">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-full bg-gradient-to-br from-cyber-surface to-muted">
                        <Smartphone className="h-5 w-5 text-cyber-green" />
                      </div>
                      <div>
                        <CardTitle className="text-lg text-foreground">{account.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{account.phone}</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(account.status)}>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(account.status)}
                        <span>{getStatusText(account.status)}</span>
                      </div>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-2 bg-muted/50 rounded">
                      <p className="text-muted-foreground">Entregues</p>
                      <p className="font-medium text-cyber-green">{account.health.messagesDelivered}</p>
                    </div>
                    <div className="p-2 bg-muted/50 rounded">
                      <p className="text-muted-foreground">Lidas</p>
                      <p className="font-medium text-cyber-blue">{account.health.messagesRead}</p>
                    </div>
                    <div className="p-2 bg-muted/50 rounded">
                      <p className="text-muted-foreground">Falharam</p>
                      <p className="font-medium text-destructive">{account.health.messagesFailed}</p>
                    </div>
                    <div className="p-2 bg-muted/50 rounded">
                      <p className="text-muted-foreground">Sem resposta</p>
                      <p className="font-medium text-warning-foreground">{account.health.noResponseCount}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Saúde da Conta</span>
                      <Badge className={getHealthBadgeColor(account.health.healthScore)}>
                        {account.health.healthScore}%
                      </Badge>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          account.health.healthScore >= 80 ? 'bg-cyber-green' :
                          account.health.healthScore >= 60 ? 'bg-warning' : 'bg-destructive'
                        }`}
                        style={{ width: `${account.health.healthScore}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">Última atividade:</p>
                    <p className="text-sm font-medium text-primary">{account.lastActivity}</p>
                  </div>
                  
                  <div className="flex space-x-2">
                    {account.status === 'connected' ? (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDisconnect(account.id)}
                        className="flex-1"
                      >
                        Desconectar
                      </Button>
                    ) : account.status === 'disconnected' ? (
                      <Button
                        size="sm"
                        onClick={() => handleReconnect(account.id)}
                        className="flex-1 bg-primary hover:bg-primary/90"
                      >
                        Reconectar
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        disabled
                        className="flex-1"
                      >
                        Conectando...
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {accounts.length === 0 && (
            <Card className="bg-card/80 backdrop-blur-sm border-cyber-border">
              <CardContent className="text-center py-12">
                <Smartphone className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma conta conectada</h3>
                <p className="text-muted-foreground mb-4">
                  Conecte sua primeira conta WhatsApp para começar a usar o sistema
                </p>
                <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
                  <DialogTrigger asChild>
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                      <Plus className="h-4 w-4 mr-2" />
                      Conectar Primeira Conta
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Accounts;