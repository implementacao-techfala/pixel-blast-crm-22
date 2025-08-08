import { useState } from 'react';
import { BackgroundGraph } from '@/components/ui/background-graph';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Plus, Send, Calendar, Clock, Image, Video, FileText, Mic, File, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface Campaign {
  id: string;
  name: string;
  scheduledDate: string;
  scheduledTime: string;
  status: 'scheduled' | 'sending' | 'completed' | 'cancelled';
  targetCount: number;
  sentCount: number;
  mediaTypes: string[];
}

interface MediaItem {
  id: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'file';
  content: string;
  order: number;
  delay?: number; // delay in seconds before sending this item
}

const mockCampaigns: Campaign[] = [
  {
    id: '1',
    name: 'Promoção Black Friday',
    scheduledDate: '2024-01-20',
    scheduledTime: '09:00',
    status: 'scheduled',
    targetCount: 150,
    sentCount: 0,
    mediaTypes: ['text', 'image']
  },
  {
    id: '2',
    name: 'Newsletter Mensal',
    scheduledDate: '2024-01-15',
    scheduledTime: '14:30',
    status: 'completed',
    targetCount: 200,
    sentCount: 195,
    mediaTypes: ['text']
  }
];

const mockTags = ['cliente', 'lead', 'premium', 'interessado', 'vip'];
const mockAccounts = [
  { id: '1', name: 'Conta Principal', phone: '+55 11 99999-9999', status: 'connected' },
  { id: '2', name: 'Suporte', phone: '+55 11 88888-8888', status: 'connected' },
  { id: '3', name: 'Vendas', phone: '+55 11 77777-7777', status: 'disconnected' }
];

const Campaigns = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState(mockCampaigns);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  
  // Form states
  const [campaignName, setCampaignName] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [excludedContacts, setExcludedContacts] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('');
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-cyber-blue/20 text-cyber-blue border-cyber-blue/50';
      case 'sending': return 'bg-cyber-green/20 text-cyber-green border-cyber-green/50';
      case 'completed': return 'bg-accent/20 text-accent border-accent/50';
      case 'cancelled': return 'bg-destructive/20 text-destructive border-destructive/50';
      default: return 'bg-muted text-muted-foreground border-cyber-border';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Agendada';
      case 'sending': return 'Enviando';
      case 'completed': return 'Concluída';
      case 'cancelled': return 'Cancelada';
      default: return 'Desconhecido';
    }
  };

  const addMediaItem = (type: MediaItem['type']) => {
    const newItem: MediaItem = {
      id: Date.now().toString(),
      type,
      content: '',
      order: mediaItems.length + 1,
      delay: 0
    };
    setMediaItems([...mediaItems, newItem]);
  };

  const updateMediaItem = (id: string, content: string) => {
    setMediaItems(mediaItems.map(item => 
      item.id === id ? { ...item, content } : item
    ));
  };

  const updateMediaDelay = (id: string, delay: number) => {
    setMediaItems(mediaItems.map(item => 
      item.id === id ? { ...item, delay } : item
    ));
  };

  const moveMediaItem = (id: string, direction: 'up' | 'down') => {
    const currentIndex = mediaItems.findIndex(item => item.id === id);
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === mediaItems.length - 1)
    ) return;

    const newItems = [...mediaItems];
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    [newItems[currentIndex], newItems[targetIndex]] = [newItems[targetIndex], newItems[currentIndex]];
    
    // Update order numbers
    newItems.forEach((item, index) => {
      item.order = index + 1;
    });
    
    setMediaItems(newItems);
  };

  const removeMediaItem = (id: string) => {
    setMediaItems(mediaItems.filter(item => item.id !== id));
  };

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'text': return <FileText className="h-4 w-4" />;
      case 'image': return <Image className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      case 'audio': return <Mic className="h-4 w-4" />;
      case 'file': return <File className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const handleCreateCampaign = () => {
    if (!campaignName || !scheduledDate || !scheduledTime || selectedTags.length === 0 || !selectedAccount) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios, incluindo a conta",
        variant: "destructive"
      });
      return;
    }

    const newCampaign: Campaign = {
      id: Date.now().toString(),
      name: campaignName,
      scheduledDate,
      scheduledTime,
      status: 'scheduled',
      targetCount: Math.floor(Math.random() * 100) + 50,
      sentCount: 0,
      mediaTypes: mediaItems.map(item => item.type)
    };

    setCampaigns([...campaigns, newCampaign]);
    
    // Reset form
    setCampaignName('');
    setScheduledDate('');
    setScheduledTime('');
    setSelectedTags([]);
    setExcludedContacts('');
    setSelectedAccount('');
    setMediaItems([]);
    setShowCreateDialog(false);

    toast({
      title: "Campanha criada!",
      description: "Sua campanha foi agendada com sucesso",
    });
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
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyber-purple to-cyber-magenta bg-clip-text text-transparent">
                Campanhas
              </h1>
            </div>
            
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-cyber-green/20">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Campanha
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl bg-card/90 backdrop-blur-sm border-cyber-border max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-cyber-green">Criar Nova Campanha</DialogTitle>
                  <DialogDescription>
                    Configure sua campanha de mensagens
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Nome da Campanha</Label>
                      <Input
                        id="name"
                        value={campaignName}
                        onChange={(e) => setCampaignName(e.target.value)}
                        placeholder="Ex: Promoção de Natal"
                        className="bg-muted/50 border-cyber-border focus:border-cyber-green"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="date">Data do Envio</Label>
                        <Input
                          id="date"
                          type="date"
                          value={scheduledDate}
                          onChange={(e) => setScheduledDate(e.target.value)}
                          className="bg-muted/50 border-cyber-border focus:border-cyber-green"
                        />
                      </div>
                      <div>
                        <Label htmlFor="time">Horário</Label>
                        <Input
                          id="time"
                          type="time"
                          value={scheduledTime}
                          onChange={(e) => setScheduledTime(e.target.value)}
                          className="bg-muted/50 border-cyber-border focus:border-cyber-green"
                        />
                      </div>
                    </div>
                  </div>

                   {/* Account Selection */}
                   <div>
                     <Label htmlFor="account">Conta do WhatsApp *</Label>
                     <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                       <SelectTrigger className="bg-muted/50 border-cyber-border focus:border-cyber-purple">
                         <SelectValue placeholder="Selecione a conta para envio" />
                       </SelectTrigger>
                       <SelectContent>
                         {mockAccounts.map((account) => (
                           <SelectItem key={account.id} value={account.id} disabled={account.status === 'disconnected'}>
                             <div className="flex items-center justify-between w-full">
                               <span>{account.name} - {account.phone}</span>
                               <Badge variant={account.status === 'connected' ? 'default' : 'destructive'} className="ml-2">
                                 {account.status === 'connected' ? 'Conectada' : 'Desconectada'}
                               </Badge>
                             </div>
                           </SelectItem>
                         ))}
                       </SelectContent>
                     </Select>
                   </div>

                   {/* Target Selection */}
                   <div className="space-y-4">
                     <Label>Público-alvo (Tags)</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {mockTags.map((tag) => (
                        <div key={tag} className="flex items-center space-x-2">
                          <Checkbox
                            id={tag}
                            checked={selectedTags.includes(tag)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedTags([...selectedTags, tag]);
                              } else {
                                setSelectedTags(selectedTags.filter(t => t !== tag));
                              }
                            }}
                          />
                          <Label htmlFor={tag} className="text-sm">{tag}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Exclusions */}
                  <div>
                    <Label htmlFor="exclusions">Exceções (telefones separados por vírgula)</Label>
                    <Textarea
                      id="exclusions"
                      value={excludedContacts}
                      onChange={(e) => setExcludedContacts(e.target.value)}
                      placeholder="Ex: +5511999999999, +5511888888888"
                      className="bg-muted/50 border-cyber-border focus:border-cyber-green"
                    />
                  </div>

                  {/* Media Items */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Conteúdo da Mensagem</Label>
                      <div className="flex space-x-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => addMediaItem('text')}
                          className="border-cyber-border hover:border-cyber-green"
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          Texto
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => addMediaItem('image')}
                          className="border-cyber-border hover:border-cyber-green"
                        >
                          <Image className="h-4 w-4 mr-1" />
                          Imagem
                        </Button>
                         <Button
                           type="button"
                           size="sm"
                           variant="outline"
                           onClick={() => addMediaItem('video')}
                           className="border-cyber-border hover:border-cyber-purple"
                         >
                           <Video className="h-4 w-4 mr-1" />
                           Vídeo
                         </Button>
                         <Button
                           type="button"
                           size="sm"
                           variant="outline"
                           onClick={() => addMediaItem('audio')}
                           className="border-cyber-border hover:border-cyber-purple"
                         >
                           <Mic className="h-4 w-4 mr-1" />
                           Áudio
                         </Button>
                      </div>
                    </div>

                    {mediaItems.map((item) => (
                      <Card key={item.id} className="border-cyber-border">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                             <div className="flex items-center space-x-2">
                               {getMediaIcon(item.type)}
                               <span className="text-sm font-medium capitalize">{item.type}</span>
                               <Badge variant="secondary" className="text-xs">
                                 Ordem {item.order}
                               </Badge>
                             </div>
                             <div className="flex items-center space-x-1">
                               <Button
                                 type="button"
                                 size="sm"
                                 variant="ghost"
                                 onClick={() => moveMediaItem(item.id, 'up')}
                                 disabled={item.order === 1}
                                 className="h-6 w-6 p-0"
                               >
                                 <ChevronUp className="h-3 w-3" />
                               </Button>
                               <Button
                                 type="button"
                                 size="sm"
                                 variant="ghost"
                                 onClick={() => moveMediaItem(item.id, 'down')}
                                 disabled={item.order === mediaItems.length}
                                 className="h-6 w-6 p-0"
                               >
                                 <ChevronDown className="h-3 w-3" />
                               </Button>
                               <Button
                                 type="button"
                                 size="sm"
                                 variant="ghost"
                                 onClick={() => removeMediaItem(item.id)}
                                 className="text-destructive hover:text-destructive h-6 w-6 p-0"
                               >
                                 <Trash2 className="h-3 w-3" />
                               </Button>
                             </div>
                          </div>
                        </CardHeader>
                         <CardContent className="space-y-3">
                           {item.type === 'text' ? (
                             <Textarea
                               value={item.content}
                               onChange={(e) => updateMediaItem(item.id, e.target.value)}
                               placeholder="Digite sua mensagem..."
                               className="bg-muted/50 border-cyber-border focus:border-cyber-purple"
                             />
                           ) : (
                             <Input
                               type="file"
                               onChange={(e) => {
                                 const file = e.target.files?.[0];
                                 if (file) updateMediaItem(item.id, file.name);
                               }}
                               className="bg-muted/50 border-cyber-border focus:border-cyber-purple"
                               accept={
                                 item.type === 'image' ? 'image/*' :
                                 item.type === 'video' ? 'video/*' :
                                 item.type === 'audio' ? 'audio/*' : '*/*'
                               }
                             />
                           )}
                           <div>
                             <Label htmlFor={`delay-${item.id}`} className="text-xs">Delay (segundos)</Label>
                             <Input
                               id={`delay-${item.id}`}
                               type="number"
                               min="0"
                               max="300"
                               value={item.delay || 0}
                               onChange={(e) => updateMediaDelay(item.id, parseInt(e.target.value) || 0)}
                               className="bg-muted/50 border-cyber-border focus:border-cyber-purple"
                               placeholder="0"
                             />
                           </div>
                         </CardContent>
                      </Card>
                    ))}
                  </div>

                  <div className="flex justify-end space-x-3">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setShowCreateDialog(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="button"
                      onClick={handleCreateCampaign}
                      className="bg-primary hover:bg-primary/90"
                    >
                      Criar Campanha
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Campaigns List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {campaigns.map((campaign) => (
              <Card key={campaign.id} className="bg-card/80 backdrop-blur-sm border-cyber-border hover:border-cyber-green transition-all duration-300 hover:shadow-lg hover:shadow-cyber-green/10">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg text-foreground">{campaign.name}</CardTitle>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(campaign.scheduledDate).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{campaign.scheduledTime}</span>
                        </div>
                      </div>
                    </div>
                    <Badge className={getStatusColor(campaign.status)}>
                      {getStatusText(campaign.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Público-alvo</p>
                      <p className="font-medium text-cyber-green">{campaign.targetCount} contatos</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Enviados</p>
                      <p className="font-medium text-cyber-blue">{campaign.sentCount} / {campaign.targetCount}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Tipos de mídia:</p>
                    <div className="flex space-x-2">
                      {campaign.mediaTypes.map((type) => (
                        <Badge key={type} variant="secondary" className="text-xs bg-cyber-surface text-cyber-green border-cyber-border">
                          {getMediaIcon(type)}
                          <span className="ml-1 capitalize">{type}</span>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {campaign.status === 'scheduled' && (
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="destructive"
                        className="flex-1"
                        onClick={() => {
                          setCampaigns(campaigns.map(c => 
                            c.id === campaign.id ? { ...c, status: 'cancelled' as const } : c
                          ));
                          toast({
                            title: "Campanha cancelada",
                            description: "A campanha foi cancelada com sucesso",
                          });
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 bg-primary hover:bg-primary/90"
                        onClick={() => {
                          setCampaigns(campaigns.map(c => 
                            c.id === campaign.id ? { ...c, status: 'sending' as const } : c
                          ));
                          toast({
                            title: "Campanha iniciada",
                            description: "Os disparos foram iniciados",
                          });
                        }}
                      >
                        <Send className="h-4 w-4 mr-1" />
                        Enviar Agora
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {campaigns.length === 0 && (
            <Card className="bg-card/80 backdrop-blur-sm border-cyber-border">
              <CardContent className="text-center py-12">
                <Send className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma campanha criada</h3>
                <p className="text-muted-foreground mb-4">
                  Crie sua primeira campanha para começar a enviar mensagens
                </p>
                <Button 
                  onClick={() => setShowCreateDialog(true)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeira Campanha
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Campaigns;