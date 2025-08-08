import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Edit, Save, X } from 'lucide-react';
import { CampaignWizard } from './CampaignWizard';

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
}

interface CampaignEditorProps {
  campaign: Campaign;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedCampaign: Campaign) => void;
  templates?: Campaign[];
}

export const CampaignEditor: React.FC<CampaignEditorProps> = ({
  campaign,
  isOpen,
  onClose,
  onSave,
  templates = []
}) => {
  const [isEditing, setIsEditing] = useState(false);

  const canEdit = campaign.status === 'scheduled';

  const handleEditSave = (updatedCampaign: Campaign) => {
    const campaignToSave = {
      ...updatedCampaign,
      id: campaign.id,
      status: campaign.status,
      sentCount: campaign.sentCount,
      createdAt: campaign.createdAt,
      deliveryRate: campaign.deliveryRate,
      openRate: campaign.openRate
    };
    
    onSave(campaignToSave);
    setIsEditing(false);
    onClose();
  };

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-card/90 backdrop-blur-sm border-cyber-border">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-cyber-green flex items-center gap-2">
                {isEditing ? 'Editando Campanha' : 'Detalhes da Campanha'}
                <Badge className={getStatusColor(campaign.status)}>
                  {getStatusText(campaign.status)}
                </Badge>
              </DialogTitle>
              <DialogDescription>
                {campaign.name}
              </DialogDescription>
            </div>
            
            <div className="flex items-center gap-2">
              {canEdit && !isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="border-cyber-border hover:border-cyber-green"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="border-cyber-border hover:border-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-4">
          {isEditing ? (
            <CampaignWizard
              onSave={handleEditSave}
              onCancel={() => setIsEditing(false)}
              templates={templates}
            />
          ) : (
            <div className="space-y-6">
              {/* Campaign Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-cyber-surface/20 p-4 rounded-lg border border-cyber-border">
                  <h4 className="text-sm font-medium text-muted-foreground">Público-alvo</h4>
                  <p className="text-lg font-semibold text-cyber-green">{campaign.targetCount}</p>
                </div>
                
                <div className="bg-cyber-surface/20 p-4 rounded-lg border border-cyber-border">
                  <h4 className="text-sm font-medium text-muted-foreground">Enviados</h4>
                  <p className="text-lg font-semibold text-cyber-blue">{campaign.sentCount}</p>
                </div>
                
                {campaign.status === 'completed' && (
                  <>
                    <div className="bg-cyber-surface/20 p-4 rounded-lg border border-cyber-border">
                      <h4 className="text-sm font-medium text-muted-foreground">Taxa de Entrega</h4>
                      <p className="text-lg font-semibold text-cyber-green">{campaign.deliveryRate}%</p>
                    </div>
                    
                    <div className="bg-cyber-surface/20 p-4 rounded-lg border border-cyber-border">
                      <h4 className="text-sm font-medium text-muted-foreground">Taxa de Abertura</h4>
                      <p className="text-lg font-semibold text-cyber-magenta">{campaign.openRate}%</p>
                    </div>
                  </>
                )}
              </div>

              {/* Schedule Information */}
              <div className="bg-cyber-surface/20 p-4 rounded-lg border border-cyber-border">
                <h4 className="text-base font-semibold mb-3">Agendamentos</h4>
                <div className="space-y-2">
                  {campaign.schedules.map((schedule, index) => (
                    <div key={index} className="flex items-center gap-4 text-sm">
                      <Badge variant="outline" className="bg-cyber-surface">
                        Envio {index + 1}
                      </Badge>
                      <span>{new Date(schedule.date).toLocaleDateString('pt-BR')}</span>
                      <span>{schedule.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tags and Configuration */}
              <div className="bg-cyber-surface/20 p-4 rounded-lg border border-cyber-border">
                <h4 className="text-base font-semibold mb-3">Configurações</h4>
                <div className="space-y-3">
                  <div>
                    <h5 className="text-sm font-medium text-muted-foreground mb-2">Tags Selecionadas</h5>
                    <div className="flex flex-wrap gap-2">
                      {campaign.selectedTags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="bg-cyber-surface text-cyber-green">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="text-sm font-medium text-muted-foreground mb-2">Configurações de Delay</h5>
                    <div className="flex gap-4 text-sm">
                      <span>Min: {campaign.delayMin}s</span>
                      <span>Max: {campaign.delayMax}s</span>
                      {campaign.randomizeMedia && <Badge variant="outline">Aleatorizar mídia</Badge>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Media Types */}
              <div className="bg-cyber-surface/20 p-4 rounded-lg border border-cyber-border">
                <h4 className="text-base font-semibold mb-3">Tipos de Mídia</h4>
                <div className="flex flex-wrap gap-2">
                  {campaign.mediaTypes.map((type) => (
                    <Badge key={type} variant="outline" className="bg-cyber-surface text-cyber-purple">
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};