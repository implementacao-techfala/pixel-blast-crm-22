import { useState, useEffect } from 'react';
import { BackgroundGraph } from '@/components/ui/background-graph';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ArrowLeft, Plus, Smartphone, Wifi, WifiOff, QrCode, Loader2, RefreshCw, Users, Phone, Calendar, Shield, Star, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { sendWebhookNotification, generateQRCode, WEBHOOK_ACTIONS } from '@/lib/webhook';

// ✅ ATUALIZADO: Interface baseada na API real
interface WhatsAppAccount {
  row_number: number;
  id: string | number;
  nome_conta: string | number;
  telefone: string | number;
  status: string;
  reputacao: string;
  criado_em: string;
  atualizado_em: string;
  id_tag: string | number;
}

const Accounts = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<WhatsAppAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showQrCode, setShowQrCode] = useState(false);
  const [qrCodeData, setQrCodeData] = useState('');
  const [isCheckingConnection, setIsCheckingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'waiting' | 'checking' | 'connected' | 'failed'>('waiting');
  const [connectionMessage, setConnectionMessage] = useState('Aguardando conexão...');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showReconnectForm, setShowReconnectForm] = useState(false);
  const [reconnectAccountName, setReconnectAccountName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountPhone, setAccountPhone] = useState('');

  // ✅ NOVO: Função para buscar contas da API
  const fetchAccounts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Buscando contas da API...');
      const response = await fetch('https://automatewebhook.techfala.com.br/webhook/ler_todas_contas', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📥 Dados recebidos da API:', data);

      // ✅ CORRIGIDO: Processar estrutura aninhada da API
      let accountsArray: WhatsAppAccount[] = [];
      if (Array.isArray(data) && data.length > 0 && data[0] && typeof data[0] === 'object' && data[0].data) {
        accountsArray = data[0].data;
      } else if (Array.isArray(data)) {
        accountsArray = data;
      } else if (data && typeof data === 'object' && data.data && Array.isArray(data.data)) {
        accountsArray = data.data;
      }

      console.log(`✅ ${accountsArray.length} contas carregadas`);
      setAccounts(accountsArray);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('❌ Erro ao buscar contas:', errorMessage);
      setError(errorMessage);
      setAccounts([]);
      
      toast({
        title: "Erro ao carregar contas",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ NOVO: Carregar contas na inicialização
  useEffect(() => {
    fetchAccounts();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
      case 'conectado':
        return 'bg-cyber-green/20 text-cyber-green border-cyber-green/30';
      case 'close':
      case 'desconectado':
        return 'bg-destructive/20 text-destructive border-destructive/30';
      case 'connecting':
      case 'conectando':
        return 'bg-cyber-blue/20 text-cyber-blue border-cyber-blue/30';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
      case 'conectado':
        return <Wifi className="h-4 w-4" />;
      case 'close':
      case 'desconectado':
        return <WifiOff className="h-4 w-4" />;
      case 'connecting':
      case 'conectando':
        return <Wifi className="h-4 w-4 animate-pulse" />;
      default:
        return <WifiOff className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
      case 'conectado':
        return 'Conectado';
      case 'close':
      case 'desconectado':
        return 'Desconectado';
      case 'connecting':
      case 'conectando':
        return 'Conectando...';
      default:
        return status || 'Desconhecido';
    }
  };

  const getReputacaoColor = (reputacao: string) => {
    switch (reputacao?.toLowerCase()) {
      case 'boa':
        return 'bg-green-500/20 text-green-500 border-green-500/30';
      case 'ruim':
        return 'bg-red-500/20 text-red-500 border-red-500/30';
      case 'neutra':
        return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getReputacaoText = (reputacao: string) => {
    if (!reputacao || reputacao === '') return 'Não definida';
    switch (reputacao.toLowerCase()) {
      case 'boa': return 'Boa';
      case 'ruim': return 'Ruim';
      case 'neutra': return 'Neutra';
      default: return reputacao;
    }
  };

  // ✅ NOVO: Função para iniciar reconexão
  const startReconnect = (accountName: string) => {
    setReconnectAccountName(accountName);
    setAccountName(accountName);
    setAccountPhone('');
    setShowReconnectForm(true);
  };

  // ✅ NOVO: Função para verificar se a conta está conectada
  const checkConnectionStatus = async () => {
    try {
      setIsCheckingConnection(true);
      setConnectionStatus('checking');
      setConnectionMessage('Verificando conexão...');
      
      console.log('🔄 Verificando status da conexão...');
      console.log('📱 Número de telefone para verificação:', accountPhone);
      
      // ✅ CORRIGIDO: Endpoint correto da API
      const response = await fetch('https://automatewebhook.techfala.com.br/webhook/gestor-de-grupos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          telefone: accountPhone,
          nome_conta: accountName
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('📥 Resposta da verificação de conexão:', data);
      
      // ✅ NOVO: Verificar se já está conectado
      if (data && data.d === 'ja_conectado') {
        console.log('✅ Conta já está conectada!');
        
        setConnectionStatus('connected');
        setConnectionMessage('✅ Conta já está conectada!');
        
        // Atualizar status no frontend
        setAccounts(prevAccounts => 
          prevAccounts.map(acc => 
            acc.nome_conta === accountName 
              ? { ...acc, status: 'open' }
              : acc
          )
        );
        
        toast({
          title: "Conta já conectada!",
          description: "A conta já está ativa e funcionando",
        });
        
        // Fechar modal após 3 segundos
        setTimeout(() => {
          setShowQrCode(false);
          setShowReconnectForm(false);
          setConnectionStatus('waiting');
          setConnectionMessage('Aguardando conexão...');
        }, 3000);
        
        // ✅ NOVO: Recarregar contas para mostrar a nova
        setTimeout(() => {
          fetchAccounts();
        }, 1000);
        
        return;
      }
      
      // ✅ NOVO: Processar resposta da API
      if (data && data.connected === true) {
        setConnectionStatus('connected');
        setConnectionMessage('✅ Conta conectada com sucesso!');
        
        toast({
          title: "Conta conectada com sucesso!",
          description: "Sua nova conta WhatsApp está pronta para uso",
        });
        
        // Fechar modal após 3 segundos
        setTimeout(() => {
          setShowQrCode(false);
          setShowReconnectForm(false);
          setConnectionStatus('waiting');
          setConnectionMessage('Aguardando conexão...');
        }, 3000);
        
        // ✅ NOVO: Recarregar contas para mostrar a nova
        setTimeout(() => {
          fetchAccounts();
        }, 1000);
        
      } else {
        setConnectionStatus('failed');
        setConnectionMessage('❌ Conta ainda não conectada. Tente novamente.');
        
        toast({
          title: "Conta não conectada",
          description: "Escaneie o QR Code e tente verificar novamente",
          variant: "destructive"
        });
      }
      
    } catch (error) {
      console.error('❌ Erro ao verificar conexão:', error);
      setConnectionStatus('failed');
      setConnectionMessage('❌ Erro ao verificar conexão. Tente novamente.');
      
      toast({
        title: "Erro na verificação",
        description: "Falha ao verificar status da conexão",
        variant: "destructive"
      });
    } finally {
      setIsCheckingConnection(false);
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
      // ✅ NOVO: Usar endpoint de reconexão para criar/atualizar conta
      console.log('🔄 Enviando requisição para reconectar conta...');
      
      const response = await fetch('https://automatewebhook.techfala.com.br/webhook/gestor-de-grupos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          telefone: accountPhone,
          nome_conta: accountName
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📥 Resposta da API:', data);

      // ✅ NOVO: Verificar se já está conectado
      if (data && data.d === 'ja_conectado') {
        console.log('✅ Conta já está conectada, atualizando status...');
        
        // Atualizar status no frontend
        setAccounts(prevAccounts => 
          prevAccounts.map(acc => 
            acc.nome_conta === accountName 
              ? { ...acc, status: 'open' }
              : acc
          )
        );

        toast({
          title: "Conta já conectada!",
          description: "A conta já está ativa e funcionando",
        });

        // Fechar formulários
        setShowAddForm(false);
        setShowReconnectForm(false);
        
        // Recarregar contas para sincronizar
        setTimeout(() => {
          fetchAccounts();
        }, 1000);
        
        return;
      }

      // ✅ NOVO: Se não está conectado, gerar QR Code
      console.log('🔄 Conta não conectada, gerando QR Code...');
      
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
      setShowReconnectForm(false);
      setShowQrCode(true);
      
      // ✅ NOVO: Resetar status de conexão
      setConnectionStatus('waiting');
      setConnectionMessage('Aguardando conexão...');
      
      toast({
        title: "QR Code gerado!",
        description: "Escaneie o código com seu WhatsApp para conectar",
      });

    } catch (error) {
      console.error('Error generating QR code:', error);
      toast({
        title: "Erro",
        description: "Falha ao gerar QR Code. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleReconnect = async (accountId: string | number) => {
    const account = accounts.find(acc => acc.id === accountId);
    
    if (account) {
      startReconnect(String(account.nome_conta));
    }
  };

  // ✅ NOVO: Função para apagar instância da conta
  const handleDeleteInstance = async (account: WhatsAppAccount) => {
    try {
      console.log('🗑️ Apagando instância da conta:', account);
      
      const response = await fetch('https://automatewebhook.techfala.com.br/webhook/apagar-instancia-conta', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          telefone: account.telefone,
          nome_conta: account.nome_conta
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Instância apagada com sucesso:', data);
      
      // Atualizar status no frontend
      setAccounts(prevAccounts => 
        prevAccounts.map(acc => 
          acc.id === account.id 
            ? { ...acc, status: 'close' }
            : acc
        )
      );

      toast({
        title: "Instância apagada!",
        description: `A instância da conta ${account.nome_conta} foi removida com sucesso`,
      });

      // Recarregar contas para sincronizar
      setTimeout(() => {
        fetchAccounts();
      }, 1000);

    } catch (error) {
      console.error('❌ Erro ao apagar instância:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      toast({
        title: "Erro ao apagar instância",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  // ✅ NOVO: Função para formatar data
  const formatDate = (dateString: string) => {
    if (!dateString || dateString === '') return 'Não definida';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('pt-BR');
    } catch {
      return dateString;
    }
  };

  return (
    <TooltipProvider>
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
              
              <div className="flex gap-4">
                <Button 
                  onClick={fetchAccounts}
                  disabled={loading}
                  variant="outline"
                  className="border-cyber-border hover:border-cyber-green"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  {loading ? 'Carregando...' : 'Atualizar'}
                </Button>
                
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
              </div>

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
                    
                    {/* ✅ NOVO: Status da conexão com cores dinâmicas */}
                    <div className={`flex space-x-2 ${connectionStatus === 'connected' ? 'text-green-500' : connectionStatus === 'failed' ? 'text-red-500' : 'text-cyber-blue'}`}>
                      {connectionStatus === 'waiting' && (
                        <>
                          <div className="w-2 h-2 bg-cyber-green rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-cyber-blue rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-cyber-teal rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </>
                      )}
                      {connectionStatus === 'checking' && (
                        <>
                          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                        </>
                      )}
                      {connectionStatus === 'connected' && (
                        <>
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        </>
                      )}
                      {connectionStatus === 'failed' && (
                        <>
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        </>
                      )}
                    </div>
                    
                    {/* ✅ NOVO: Mensagem de status dinâmica */}
                    <p className={`text-xs ${connectionStatus === 'connected' ? 'text-green-500' : connectionStatus === 'failed' ? 'text-red-500' : 'text-cyber-blue'}`}>
                      {connectionMessage}
                    </p>
                    
                    {/* ✅ NOVO: Botão de verificação de conexão */}
                    <Button 
                      onClick={checkConnectionStatus}
                      disabled={isCheckingConnection}
                      className={`w-full transition-all duration-300 ${
                        connectionStatus === 'connected' 
                          ? 'bg-green-500 hover:bg-green-600' 
                          : connectionStatus === 'failed'
                          ? 'bg-red-500 hover:bg-red-600'
                          : 'bg-cyber-blue hover:bg-cyber-blue/90'
                      }`}
                    >
                      {isCheckingConnection ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Verificando...
                        </>
                      ) : connectionStatus === 'connected' ? (
                        '✅ Conectado!'
                      ) : connectionStatus === 'failed' ? (
                        '🔄 Tentar Novamente'
                      ) : (
                        '🔍 Verificar Conexão'
                      )}
                    </Button>
                    
                    {/* ✅ NOVO: Instruções adicionais */}
                    <div className="text-xs text-muted-foreground text-center bg-muted/30 p-3 rounded-lg">
                      <p className="font-medium mb-1">💡 Dica:</p>
                      <p>Após escanear o QR Code, clique em "Verificar Conexão" para confirmar se a conta foi conectada com sucesso.</p>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* ✅ MODIFICADO: Conexão em massa desabilitada */}
            <div className="mb-8">
              <Card className="bg-card/80 backdrop-blur-sm border-cyber-border">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3 text-cyber-purple">
                    <QrCode className="h-6 w-6" />
                    <span>Conexão em Massa</span>
                  </CardTitle>
                  <p className="text-muted-foreground">
                    Conecte múltiplas contas WhatsApp simultaneamente
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <div className="mb-4">
                      <Clock className="h-16 w-16 text-cyber-blue mx-auto opacity-60" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-cyber-blue">
                      Em Breve
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Esta funcionalidade está sendo desenvolvida e estará disponível em breve.
                    </p>
                    <Badge variant="outline" className="border-cyber-blue text-cyber-blue">
                      🚧 Em Desenvolvimento
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-cyber-green mr-3" />
                <span className="text-lg text-muted-foreground">Carregando contas...</span>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <Card className="bg-card/80 backdrop-blur-sm border-destructive">
                <CardContent className="text-center py-8">
                  <div className="text-destructive mb-4">
                    <Users className="h-12 w-12 mx-auto" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-destructive">Erro ao carregar contas</h3>
                  <p className="text-muted-foreground mb-4">{error}</p>
                  <Button onClick={fetchAccounts} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Tentar novamente
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Accounts Grid */}
            {!loading && !error && accounts.length > 0 && (
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
                            <CardTitle className="text-lg text-foreground">{String(account.nome_conta)}</CardTitle>
                            <p className="text-sm text-muted-foreground">{String(account.telefone)}</p>
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
                      {/* ✅ NOVO: Informações da API real */}
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="p-2 bg-muted/50 rounded">
                          <p className="text-muted-foreground">ID</p>
                          <p className="font-medium text-cyber-green">{account.id || 'N/A'}</p>
                        </div>
                        <div className="p-2 bg-muted/50 rounded">
                          <p className="text-muted-foreground">Row</p>
                          <p className="font-medium text-cyber-blue">{account.row_number}</p>
                        </div>
                        <div className="p-2 bg-muted/50 rounded">
                          <p className="text-muted-foreground">Tag ID</p>
                          <p className="font-medium text-cyber-purple">{account.id_tag || 'N/A'}</p>
                        </div>
                        <div className="p-2 bg-muted/50 rounded">
                          <p className="text-muted-foreground">Reputação</p>
                          <Badge className={getReputacaoColor(account.reputacao)}>
                            {getReputacaoText(account.reputacao)}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Criado em</span>
                          <span className="text-xs text-muted-foreground">{formatDate(account.criado_em)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Atualizado em</span>
                          <span className="text-xs text-muted-foreground">{formatDate(account.atualizado_em)}</span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        {account.status.toLowerCase() === 'open' ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReconnect(account.id)}
                              className="flex-1"
                            >
                              Reconectar
                            </Button>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDeleteInstance(account)}
                                    className="px-3"
                                  >
                                    🗑️
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Apagar instância da conta</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </>
                        ) : account.status.toLowerCase() === 'close' ? (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleReconnect(account.id)}
                              className="flex-1 bg-primary hover:bg-primary/90"
                            >
                              Reconectar
                            </Button>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDeleteInstance(account)}
                                    className="px-3"
                                  >
                                    🗑️
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Apagar instância da conta</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              disabled
                              className="flex-1"
                            >
                              Conectando...
                            </Button>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDeleteInstance(account)}
                                    className="px-3"
                                  >
                                    🗑️
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Apagar instância da conta</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && accounts.length === 0 && (
              <Card className="bg-card/80 backdrop-blur-sm border-cyber-border">
                <CardContent className="text-center py-12">
                  <Smartphone className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhuma conta encontrada</h3>
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
        {/* Modal de Reconexão */}
        <Dialog open={showReconnectForm} onOpenChange={setShowReconnectForm}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Reconectar Conta</DialogTitle>
              <DialogDescription>
                Reconecte a conta <strong>{reconnectAccountName}</strong> ao WhatsApp
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="reconnect-nome">Nome da Conta</Label>
                <Input
                  id="reconnect-nome"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="Nome da conta"
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Nome preenchido automaticamente
                </p>
              </div>
              
              <div>
                <Label htmlFor="reconnect-telefone">Número do Telefone *</Label>
                <Input
                  id="reconnect-telefone"
                  value={accountPhone}
                  onChange={(e) => setAccountPhone(e.target.value)}
                  placeholder="+55 11 99999-9999"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Digite o número do telefone da conta
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleAddAccount} disabled={!accountPhone.trim()} className="flex-1">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reconectar
                </Button>
                <Button variant="outline" onClick={() => setShowReconnectForm(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default Accounts;