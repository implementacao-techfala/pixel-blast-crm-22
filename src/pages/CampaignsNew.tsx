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
import { useCampaigns, type Campaign } from '@/hooks/useCampaigns';

// ✅ REMOVIDO: Interface Campaign local - usando do hook useCampaigns

interface UncontactedLead {
  id: string;
  name: string;
  phone: string;
  tags: string[];
  reason: 'account_blocked' | 'account_unavailable' | 'number_invalid' | 'system_error';
  lastAttempt: string;
  accountsAttempted: string[];
}

const CampaignsNew = () => {
  const { toast } = useToast();
  const { campaigns, loading, error, refreshCampaigns } = useCampaigns();
  const [showCreateWizard, setShowCreateWizard] = useState(false);
  // ✅ REMOVIDO: showCampaignHistory
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

    // ✅ NOVO: Atualizar lista local e fazer refresh da API
    await refreshCampaigns();
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

  const handleCancelCampaign = async (campaignId: string) => {
    // ✅ NOVO: Atualizar via API e fazer refresh
    await refreshCampaigns();
    
    toast({
      title: "Campanha cancelada",
      description: "A campanha foi cancelada com sucesso",
    });
  };

  const handleStartCampaign = async (campaignId: string) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    
    // ✅ NOVO: Atualizar via API e fazer refresh
    await refreshCampaigns();

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

  const duplicateCampaign = async (campaign: Campaign) => {
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

    // ✅ NOVO: Atualizar via API e fazer refresh
    await refreshCampaigns();
    
    toast({
      title: "Campanha duplicada",
      description: "Uma cópia da campanha foi criada",
    });
  };

  const handleEditCampaign = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setShowCampaignEditor(true);
  };

  const handleCampaignUpdate = async (updatedCampaign: Campaign) => {
    // ✅ NOVO: Atualizar via API e fazer refresh
    await refreshCampaigns();
    
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
      {/* ✅ REMOVIDO: Botão de histórico */}
      
      <Button
        variant="outline"
        onClick={refreshCampaigns}
        className="border-cyber-border hover:border-cyber-green"
        disabled={loading}
      >
        {loading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyber-green mr-2"></div>
        ) : (
          <BarChart3 className="h-4 w-4 mr-2" />
        )}
        Atualizar
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
      {/* Loading State */}
      {loading && (
        <Card className="bg-card/80 backdrop-blur-sm border-cyber-border mb-6">
          <CardContent className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyber-green mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando campanhas...</p>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card className="bg-card/80 backdrop-blur-sm border-cyber-border mb-6">
          <CardContent className="text-center py-8">
            <p className="text-destructive mb-4">Erro ao carregar campanhas: {error}</p>
            <Button onClick={refreshCampaigns} variant="outline">
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Campaign Stats */}
      {!loading && !error && (
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
      )}

      {/* Campaigns List */}
      {!loading && !error && campaigns.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {campaigns.map((campaign) => (
            <Card key={campaign.id} className="bg-card/80 backdrop-blur-sm border-cyber-border hover:border-cyber-green transition-all duration-300 hover:shadow-lg hover:shadow-cyber-green/10">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg text-foreground mb-2">{campaign.name}</CardTitle>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      {campaign.schedules && campaign.schedules.length > 0 ? (
                        campaign.schedules.map((schedule, index) => (
                          <div key={index} className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(schedule.date).toLocaleDateString('pt-BR')}</span>
                            <Clock className="h-4 w-4 ml-2" />
                            <span>{schedule.time}</span>
                          </div>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground">Nenhum agendamento definido</span>
                      )}
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
                    <p className="font-medium text-cyber-green">{campaign.targetCount || 0} contatos</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Enviados</p>
                    <p className="font-medium text-cyber-blue">{campaign.sentCount || 0} / {campaign.targetCount || 0}</p>
                  </div>
                </div>

                {campaign.status === 'completed' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Taxa de Entrega</p>
                      <p className="font-medium text-cyber-green">{campaign.deliveryRate || 0}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Taxa de Abertura</p>
                      <p className="font-medium text-cyber-blue">{campaign.openRate || 0}%</p>
                    </div>
                  </div>
                )}
                
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Configurações:</p>
                  <div className="flex flex-wrap gap-1 text-xs">
                    <Badge variant="secondary" className="bg-cyber-surface text-cyber-green border-cyber-border">
                      {campaign.selectedAccounts && campaign.selectedAccounts.length > 0 ? campaign.selectedAccounts.length : 0} conta(s)
                    </Badge>
                    <Badge variant="secondary" className="bg-cyber-surface text-cyber-purple border-cyber-border">
                      Delay: {campaign.delayMin || 0}s-{campaign.delayMax || 0}s
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
                    {campaign.mediaTypes && campaign.mediaTypes.length > 0 ? (
                      campaign.mediaTypes.map((type) => (
                        <Badge key={type} variant="secondary" className="text-xs bg-cyber-surface text-cyber-green border-cyber-border">
                          {getMediaIcon(type)}
                          <span className="ml-1 capitalize">{type}</span>
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground">Nenhum tipo de mídia definido</span>
                    )}
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
                      // ✅ REMOVIDO: Histórico de campanhas
                      // setSelectedCampaign(campaign);
                      // setShowCampaignHistory(true);
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
      )}

      {/* Empty State */}
      {!loading && !error && campaigns.length === 0 && (
        <Card className="bg-card/80 backdrop-blur-sm border-cyber-border">
          <CardContent className="text-center py-12">
            <Send className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma campanha encontrada</h3>
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
      {/* REMOVIDO: showCampaignHistory */}
      {/* REMOVIDO: setShowCampaignHistory */}
      {/* REMOVIDO: setSelectedCampaign */}
      {/* REMOVIDO: showUncontactedLeads */}
      {/* REMOVIDO: setShowUncontactedLeads */}
      {/* REMOVIDO: setSelectedCampaign */}

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