import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { QrCode, Play, Pause, Square, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { generateQRCode } from '@/lib/webhook';

interface QRCodeSession {
  id: string;
  name: string;
  phone: string;
  qrCode: string;
  status: 'pending' | 'showing' | 'connected' | 'failed' | 'timeout';
  timestamp: string;
}

export const BulkQRManager = ({ onAccountConnected }: { onAccountConnected: (account: any) => void }) => {
  const [isActive, setIsActive] = useState(false);
  const [currentSession, setCurrentSession] = useState<QRCodeSession | null>(null);
  const [queuedSessions, setQueuedSessions] = useState<QRCodeSession[]>([]);
  const [completedSessions, setCompletedSessions] = useState<QRCodeSession[]>([]);
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [accountsText, setAccountsText] = useState('');
  const [qrDisplayTime, setQrDisplayTime] = useState(60); // segundos
  const [autoAdvance, setAutoAdvance] = useState(true);
  const { toast } = useToast();

  const parseAccountsText = (text: string): Omit<QRCodeSession, 'id' | 'qrCode' | 'status' | 'timestamp'>[] => {
    return text
      .split('\n')
      .filter(line => line.trim())
      .map((line, index) => {
        const [name, phone] = line.split(',').map(s => s.trim());
        return {
          name: name || `Conta ${index + 1}`,
          phone: phone || `+55 11 9${String(index).padStart(4, '0')}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`
        };
      });
  };


  const startBulkProcess = async () => {
    const accounts = parseAccountsText(accountsText);
    
    if (accounts.length === 0) {
      toast({
        title: "Lista vazia",
        description: "Adicione pelo menos uma conta para conectar",
        variant: "destructive"
      });
      return;
    }

    // Criar sessões para a fila
    const sessions: QRCodeSession[] = [];
    for (const account of accounts) {
      const result = await generateQRCode(account.name, account.phone);
      if (result.success && result.qrCode) {
        sessions.push({
          id: `session_${Date.now()}_${Math.random()}`,
          name: account.name,
          phone: account.phone,
          qrCode: result.qrCode,
          status: 'pending',
          timestamp: new Date().toISOString()
        });
      } else {
        toast({
          title: "Erro ao gerar QR Code",
          description: `Falha para ${account.name}: ${result.error || 'Erro desconhecido'}`,
          variant: "destructive"
        });
      }
    }

    setQueuedSessions(sessions);
    setShowBulkDialog(false);
    setIsActive(true);
    
    toast({
      title: "Processo iniciado!",
      description: `${sessions.length} contas adicionadas à fila de conexão`,
    });

    // Iniciar primeiro QR code
    processNextQR();
  };

  const processNextQR = () => {
    if (queuedSessions.length === 0) {
      setIsActive(false);
      setCurrentSession(null);
      toast({
        title: "Processo concluído!",
        description: `Conectadas: ${completedSessions.filter(s => s.status === 'connected').length}/${completedSessions.length}`,
      });
      return;
    }

    const nextSession = queuedSessions[0];
    setCurrentSession({ ...nextSession, status: 'showing' });
    setQueuedSessions(prev => prev.slice(1));

    // Auto-timeout se não confirmar em X segundos
    if (autoAdvance) {
      setTimeout(() => {
        if (currentSession?.id === nextSession.id && currentSession.status === 'showing') {
          handleTimeout();
        }
      }, qrDisplayTime * 1000);
    }
  };

  const confirmConnection = () => {
    if (!currentSession) return;

    const connectedSession = { ...currentSession, status: 'connected' as const };
    setCompletedSessions(prev => [...prev, connectedSession]);
    
    // Adicionar conta aos accounts conectados
    onAccountConnected({
      id: connectedSession.id,
      name: connectedSession.name,
      phone: connectedSession.phone,
      status: 'connected',
      lastActivity: new Date().toLocaleString('pt-BR'),
      health: {
        messagesDelivered: 0,
        messagesRead: 0,
        messagesFailed: 0,
        noResponseCount: 0,
        healthScore: 100
      }
    });

    toast({
      title: "Conta conectada!",
      description: `${connectedSession.name} foi conectada com sucesso`,
    });

    // Processar próximo
    processNextQR();
  };

  const markAsFailed = () => {
    if (!currentSession) return;

    const failedSession = { ...currentSession, status: 'failed' as const };
    setCompletedSessions(prev => [...prev, failedSession]);
    
    toast({
      title: "Conexão falhou",
      description: `${failedSession.name} - tente novamente mais tarde`,
      variant: "destructive"
    });

    // Processar próximo
    processNextQR();
  };

  const handleTimeout = () => {
    if (!currentSession) return;

    const timeoutSession = { ...currentSession, status: 'timeout' as const };
    setCompletedSessions(prev => [...prev, timeoutSession]);
    
    toast({
      title: "Tempo esgotado",
      description: `${timeoutSession.name} - pulando para próxima conta`,
      variant: "destructive"
    });

    // Processar próximo
    processNextQR();
  };

  const stopProcess = () => {
    setIsActive(false);
    if (currentSession) {
      setCompletedSessions(prev => [...prev, { ...currentSession, status: 'failed' }]);
    }
    setCurrentSession(null);
    setQueuedSessions([]);
  };

  const skipCurrent = () => {
    processNextQR();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle2 className="h-4 w-4 text-cyber-green" />;
      case 'failed': return <XCircle className="h-4 w-4 text-destructive" />;
      case 'timeout': return <Clock className="h-4 w-4 text-warning-foreground" />;
      default: return <QrCode className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const totalSessions = queuedSessions.length + completedSessions.length + (currentSession ? 1 : 0);
  const progress = totalSessions > 0 ? (completedSessions.length / totalSessions) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Controles */}
      <div className="flex items-center gap-4">
        <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
          <DialogTrigger asChild>
            <Button disabled={isActive} className="bg-primary hover:bg-primary/90">
              <QrCode className="h-4 w-4 mr-2" />
              Conectar em Massa
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Conexão em Massa - QR Codes</DialogTitle>
              <DialogDescription>
                Configure a conexão automática de múltiplas contas WhatsApp
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="accounts">Lista de Contas (Nome,Telefone por linha)</Label>
                <textarea
                  id="accounts"
                  value={accountsText}
                  onChange={(e) => setAccountsText(e.target.value)}
                  placeholder="Vendas 1,+55 11 99999-1111&#10;Vendas 2,+55 11 99999-2222&#10;Suporte,+55 11 99999-3333"
                  className="w-full h-32 p-3 text-sm bg-muted/50 border rounded-md resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Formato: Nome,Telefone (uma conta por linha)
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="qrTime">Tempo por QR (segundos)</Label>
                  <Input
                    id="qrTime"
                    type="number"
                    min="30"
                    max="300"
                    value={qrDisplayTime}
                    onChange={(e) => setQrDisplayTime(parseInt(e.target.value) || 60)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Avanço Automático</Label>
                  <div className="flex items-center space-x-2 pt-2">
                    <input
                      type="checkbox"
                      checked={autoAdvance}
                      onChange={(e) => setAutoAdvance(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">Pular automaticamente</span>
                  </div>
                </div>
              </div>

              <Button onClick={startBulkProcess} className="w-full">
                <Play className="h-4 w-4 mr-2" />
                Iniciar Processo
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {isActive && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={skipCurrent}>
              Pular
            </Button>
            <Button variant="destructive" onClick={stopProcess}>
              <Square className="h-4 w-4 mr-2" />
              Parar
            </Button>
          </div>
        )}
      </div>

      {/* QR Code Atual */}
      {currentSession && (
        <Card className="bg-card/90 backdrop-blur-sm border-cyber-border">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Conectando: {currentSession.name}</span>
              <div className="text-sm text-muted-foreground">
                Fila: {queuedSessions.length} | Concluídos: {completedSessions.length}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <div className="w-48 h-48 bg-white rounded-lg flex items-center justify-center p-2">
                <img 
                  src={`data:image/png;base64,${currentSession.qrCode}`} 
                  alt="QR Code WhatsApp" 
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            
            <div className="text-center space-y-2">
              <p className="font-medium">{currentSession.phone}</p>
              <p className="text-sm text-muted-foreground">
                Escaneie o QR Code com WhatsApp e confirme a conexão
              </p>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={confirmConnection}
                className="flex-1 bg-cyber-green hover:bg-cyber-green/90 text-white"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Confirmar Conexão
              </Button>
              <Button 
                variant="destructive"
                onClick={markAsFailed}
                className="flex-1"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Falhou
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress */}
      {(isActive || completedSessions.length > 0) && (
        <Card className="bg-card/80 backdrop-blur-sm border-cyber-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Progresso da Conexão em Massa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progresso Total</span>
                <span>{completedSessions.length}/{totalSessions}</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Sessões Concluídas */}
            {completedSessions.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Concluídas</h4>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {completedSessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-2 bg-muted/30 rounded text-sm">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(session.status)}
                        <span>{session.name}</span>
                        <span className="text-muted-foreground">{session.phone}</span>
                      </div>
                      <span className={`text-xs font-medium ${
                        session.status === 'connected' ? 'text-cyber-green' :
                        session.status === 'failed' ? 'text-destructive' :
                        'text-warning-foreground'
                      }`}>
                        {session.status === 'connected' ? 'Conectado' :
                         session.status === 'failed' ? 'Falhou' : 'Timeout'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};