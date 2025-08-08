import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Send, Calendar, Clock, Image, Video, FileText, Mic, File, Trash2, Play, Eye, Copy, BarChart3, AlertTriangle, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PageLayout } from '@/components/layout/PageLayout';
import { CampaignWizard } from '@/components/campaign/CampaignWizard';
import { CampaignEditor } from '@/components/campaign/CampaignEditor';
import { UncontactedLeadsViewer } from '@/components/campaign/UncontactedLeadsViewer';
import { sendWebhookNotification, WEBHOOK_ACTIONS } from '@/lib/webhook';

interface Campaign {
  id: string;
  name: string;
  schedules: Array<{
    date: string;
    time: string;
  }>;
  status: 'scheduled' | 'sending' | 'completed' | 'cancelled';
  targetCount: number;
  sentCount: number;
  mediaTypes: string[];
  selectedAccounts: string[];
  selectedTags: string[];
  excludedContacts: string;
  mediaItems: any[];
  randomizeMedia: boolean;
  maxLeads: number;
  delayMin: number;
  delayMax: number;
  useTemplate?: boolean;
  templateName?: string;
  createdAt: string;
  deliveryRate?: number;
  openRate?: number;
  uncontactedLeads?: UncontactedLead[];
}

interface UncontactedLead {
  id: string;
  name: string;
  phone: string;
  tags: string[];
  reason: 'account_blocked' | 'account_unavailable' | 'number_invalid' | 'system_error';
  lastAttempt: string;
  accountsAttempted: string[];
}

const mockCampaigns: Campaign[] = [
  {
    id: '1',
    name: 'Promoção Black Friday',
    schedules: [{ date: '2024-02-20', time: '09:00' }],
    status: 'scheduled',
    targetCount: 150,
    sentCount: 0,
    mediaTypes: ['text', 'image'],
    selectedAccounts: ['1', '2'],
    selectedTags: ['cliente', 'premium'],
    excludedContacts: '',
    mediaItems: [],
    randomizeMedia: true,
    maxLeads: 150,
    delayMin: 2,
    delayMax: 8,
    createdAt: '2024-01-15T10:30:00Z',
    deliveryRate: 0,
    openRate: 0
  },
  {
    id: '2',
    name: 'Newsletter Mensal',
    schedules: [{ date: '2024-01-15', time: '14:30' }],
    status: 'completed',
    targetCount: 200,
    sentCount: 195,
    mediaTypes: ['text'],
    selectedAccounts: ['1'],
    selectedTags: ['cliente'],
    excludedContacts: '',
    mediaItems: [],
    randomizeMedia: false,
    maxLeads: 200,
    delayMin: 1,
    delayMax: 3,
    createdAt: '2024-01-10T08:00:00Z',
    deliveryRate: 97.5,
    openRate: 85.2,
    uncontactedLeads: [
      {
        id: '1',
        name: 'Pedro Costa',
        phone: '+55 11 99999-0001',
        tags: ['cliente'],
        reason: 'account_blocked',
        lastAttempt: '2024-01-15T14:30:00Z',
        accountsAttempted: ['1']
      },
      {
        id: '2',
        name: 'Ana Silva',
        phone: '+55 11 88888-0002',
        tags: ['cliente'],
        reason: 'number_invalid',
        lastAttempt: '2024-01-15T14:35:00Z',
        accountsAttempted: ['1']
      }
    ]
  }
];

const CampaignsNew = () => {
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState(mockCampaigns);
  const [showCreateWizard, setShowCreateWizard] = useState(false);
  const [showCampaignHistory, setShowCampaignHistory] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [showCampaignEditor, setShowCampaignEditor] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [showUncontactedLeads, setShowUncontactedLeads] = useState(false);

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

  const handleCreateCampaign = async (campaign: Campaign) => {
    const newCampaign: Campaign = {
      ...campaign,
      createdAt: new Date().toISOString(),
      deliveryRate: 0,
      openRate: 0
    };

    setCampaigns([...campaigns, newCampaign]);
    setShowCreateWizard(false);

    // Send webhook notification
    await sendWebhookNotification(
      WEBHOOK_ACTIONS.CAMPAIGN_CREATED,
      'user-id-placeholder', // Replace with actual user ID
      {
        campaignId: newCampaign.id,
        campaignName: newCampaign.name,
        targetCount: newCampaign.targetCount,
        schedules: newCampaign.schedules.length
      }
    );

    toast({
      title: "Campanha criada!",
      description: `${campaign.schedules.length} campanha(s) agendada(s) com sucesso`,
    });
  };

  const handleCancelCampaign = (campaignId: string) => {
    setCampaigns(campaigns.map(c => 
      c.id === campaignId ? { ...c, status: 'cancelled' as const } : c
    ));
    toast({
      title: "Campanha cancelada",
      description: "A campanha foi cancelada com sucesso",
    });
  };

  const handleStartCampaign = async (campaignId: string) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    
    setCampaigns(campaigns.map(c => 
      c.id === campaignId ? { ...c, status: 'sending' as const } : c
    ));

    // Send webhook notification
    if (campaign) {
      await sendWebhookNotification(
        WEBHOOK_ACTIONS.CAMPAIGN_SENT,
        'user-id-placeholder', // Replace with actual user ID
        {
          campaignId: campaign.id,
          campaignName: campaign.name,
          targetCount: campaign.targetCount
        }
      );
    }

    toast({
      title: "Campanha iniciada",
      description: "Os disparos foram iniciados",
    });
  };

  const duplicateCampaign = (campaign: Campaign) => {
    const newCampaign: Campaign = {
      ...campaign,
      id: Date.now().toString(),
      name: `${campaign.name} (Cópia)`,
      status: 'scheduled',
      sentCount: 0,
      createdAt: new Date().toISOString(),
      deliveryRate: 0,
      openRate: 0,
      uncontactedLeads: []
    };

    setCampaigns([...campaigns, newCampaign]);
    toast({
      title: "Campanha duplicada",
      description: "Uma cópia da campanha foi criada",
    });
  };

  const handleEditCampaign = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setShowCampaignEditor(true);
  };

  const handleCampaignUpdate = (updatedCampaign: Campaign) => {
    setCampaigns(campaigns.map(c => 
      c.id === updatedCampaign.id ? updatedCampaign : c
    ));
    toast({
      title: "Campanha atualizada",
      description: "As alterações foram salvas com sucesso",
    });
  };

  const handleViewUncontactedLeads = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setShowUncontactedLeads(true);
  };

  const headerActions = (
    <div className="flex gap-3">
      <Button
        variant="outline"
        onClick={() => setShowCampaignHistory(true)}
        className="border-cyber-border hover:border-cyber-purple"
      >
        <BarChart3 className="h-4 w-4 mr-2" />
        Histórico
      </Button>
      
      <Dialog open={showCreateWizard} onOpenChange={setShowCreateWizard}>
        <DialogTrigger asChild>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-cyber-green/20">
            <Plus className="h-4 w-4 mr-2" />
            Nova Campanha
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-card/90 backdrop-blur-sm border-cyber-border">
          <DialogHeader>
            <DialogTitle className="text-cyber-green">Criar Nova Campanha</DialogTitle>
            <DialogDescription>
              Configure sua campanha seguindo o assistente
            </DialogDescription>
          </DialogHeader>
          
          <CampaignWizard
            onSave={handleCreateCampaign}
            onCancel={() => setShowCreateWizard(false)}
            templates={campaigns.filter(c => c.useTemplate)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );

  return (
    <PageLayout 
      title="Campanhas" 
      headerActions={headerActions}
      titleColors="from-cyber-purple to-cyber-magenta"
    >
      {/* Campaign Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-card/80 backdrop-blur-sm border-cyber-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold text-foreground">{campaigns.length}</p>
              </div>
              <Send className="h-8 w-8 text-cyber-purple" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/80 backdrop-blur-sm border-cyber-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Agendadas</p>
                <p className="text-2xl font-bold text-cyber-blue">
                  {campaigns.filter(c => c.status === 'scheduled').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-cyber-blue" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/80 backdrop-blur-sm border-cyber-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Enviando</p>
                <p className="text-2xl font-bold text-cyber-green">
                  {campaigns.filter(c => c.status === 'sending').length}
                </p>
              </div>
              <Play className="h-8 w-8 text-cyber-green" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/80 backdrop-blur-sm border-cyber-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Concluídas</p>
                <p className="text-2xl font-bold text-cyber-magenta">
                  {campaigns.filter(c => c.status === 'completed').length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-cyber-magenta" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {campaigns.map((campaign) => (
          <Card key={campaign.id} className="bg-card/80 backdrop-blur-sm border-cyber-border hover:border-cyber-green transition-all duration-300 hover:shadow-lg hover:shadow-cyber-green/10">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg text-foreground mb-2">{campaign.name}</CardTitle>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    {campaign.schedules.map((schedule, index) => (
                      <div key={index} className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(schedule.date).toLocaleDateString('pt-BR')}</span>
                        <Clock className="h-4 w-4 ml-2" />
                        <span>{schedule.time}</span>
                      </div>
                    ))}
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

              {campaign.status === 'completed' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Taxa de Entrega</p>
                    <p className="font-medium text-cyber-green">{campaign.deliveryRate}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Taxa de Abertura</p>
                    <p className="font-medium text-cyber-blue">{campaign.openRate}%</p>
                  </div>
                </div>
              )}
              
              <div>
                <p className="text-sm text-muted-foreground mb-2">Configurações:</p>
                <div className="flex flex-wrap gap-1 text-xs">
                  <Badge variant="secondary" className="bg-cyber-surface text-cyber-green border-cyber-border">
                    {campaign.selectedAccounts.length} conta(s)
                  </Badge>
                  <Badge variant="secondary" className="bg-cyber-surface text-cyber-purple border-cyber-border">
                    Delay: {campaign.delayMin}s-{campaign.delayMax}s
                  </Badge>
                  {campaign.randomizeMedia && (
                    <Badge variant="secondary" className="bg-cyber-surface text-cyber-magenta border-cyber-border">
                      Aleatorizar
                    </Badge>
                  )}
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

              <div className="flex flex-wrap gap-2 pt-2">
                {campaign.status === 'scheduled' && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditCampaign(campaign)}
                      className="border-cyber-border hover:border-cyber-green"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleCancelCampaign(campaign.id)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      size="sm"
                      className="bg-primary hover:bg-primary/90"
                      onClick={() => handleStartCampaign(campaign.id)}
                    >
                      <Send className="h-4 w-4 mr-1" />
                      Enviar
                    </Button>
                  </>
                )}
                
                {campaign.status === 'completed' && campaign.uncontactedLeads && campaign.uncontactedLeads.length > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleViewUncontactedLeads(campaign)}
                    className="border-yellow-500/50 text-yellow-600 hover:border-yellow-500"
                  >
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    Não Contatados ({campaign.uncontactedLeads.length})
                  </Button>
                )}
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => duplicateCampaign(campaign)}
                  className="border-cyber-border hover:border-cyber-purple"
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Duplicar
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedCampaign(campaign);
                    setShowCampaignHistory(true);
                  }}
                  className="border-cyber-border hover:border-cyber-green"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Detalhes
                </Button>
              </div>
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
              onClick={() => setShowCreateWizard(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeira Campanha
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Campaign History Dialog */}
      <Dialog open={showCampaignHistory} onOpenChange={setShowCampaignHistory}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card/90 backdrop-blur-sm border-cyber-border">
          <DialogHeader>
            <DialogTitle className="text-cyber-green">
              {selectedCampaign ? `Detalhes: ${selectedCampaign.name}` : 'Histórico de Campanhas'}
            </DialogTitle>
            <DialogDescription>
              Visualize o histórico e estatísticas detalhadas
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedCampaign ? (
              // Campaign Details View
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <Card className="border-cyber-border">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Informações Gerais</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <Badge className={getStatusColor(selectedCampaign.status)}>
                          {getStatusText(selectedCampaign.status)}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Criada em:</span>
                        <span>{new Date(selectedCampaign.createdAt).toLocaleString('pt-BR')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total de leads:</span>
                        <span className="font-medium">{selectedCampaign.targetCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Enviados:</span>
                        <span className="font-medium">{selectedCampaign.sentCount}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-cyber-border">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Estatísticas</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      {selectedCampaign.status === 'completed' ? (
                        <>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Taxa de Entrega:</span>
                            <span className="font-medium text-cyber-green">{selectedCampaign.deliveryRate}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Taxa de Abertura:</span>
                            <span className="font-medium text-cyber-blue">{selectedCampaign.openRate}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Bloqueios:</span>
                            <span className="font-medium text-destructive">2%</span>
                          </div>
                        </>
                      ) : (
                        <p className="text-muted-foreground">Estatísticas disponíveis após conclusão</p>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <Card className="border-cyber-border">
                  <CardHeader>
                    <CardTitle className="text-base">Tags Selecionadas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {selectedCampaign.selectedTags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="bg-cyber-surface text-cyber-green border-cyber-border">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              // General History View
              <div className="space-y-4">
                <p className="text-muted-foreground">Selecione uma campanha para ver detalhes específicos</p>
                {campaigns.map((campaign) => (
                  <Card key={campaign.id} className="border-cyber-border cursor-pointer hover:border-cyber-green transition-colors"
                    onClick={() => setSelectedCampaign(campaign)}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{campaign.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {new Date(campaign.createdAt).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <Badge className={getStatusColor(campaign.status)}>
                          {getStatusText(campaign.status)}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => {
              setShowCampaignHistory(false);
              setSelectedCampaign(null);
            }}>
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Campaign Editor Dialog */}
      {editingCampaign && (
        <CampaignEditor
          campaign={editingCampaign}
          isOpen={showCampaignEditor}
          onClose={() => {
            setShowCampaignEditor(false);
            setEditingCampaign(null);
          }}
          onSave={handleCampaignUpdate}
          templates={campaigns.filter(c => c.useTemplate)}
        />
      )}

      {/* Uncontacted Leads Viewer */}
      {selectedCampaign && (
        <UncontactedLeadsViewer
          campaignName={selectedCampaign.name}
          uncontactedLeads={selectedCampaign.uncontactedLeads || []}
          isOpen={showUncontactedLeads}
          onClose={() => {
            setShowUncontactedLeads(false);
            setSelectedCampaign(null);
          }}
        />
      )}
    </PageLayout>
  );
};

export default CampaignsNew;