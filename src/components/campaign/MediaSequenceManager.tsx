import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ChevronUp, 
  ChevronDown, 
  Plus, 
  Trash2, 
  Edit, 
  Copy, 
  FileText, 
  Image, 
  Video, 
  File, 
  Mic, 
  Shuffle,
  Eye,
  Info,
  AlertTriangle
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export interface MediaItem {
  id: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'file' | 'recorded_audio';
  content: string;
  order: number;
  delay?: number;
  variables?: string[];
  file?: File;
  audioBlob?: Blob;
  alternatives?: MediaItem[];
}

export interface MediaSequence {
  id: string;
  name: string;
  items: MediaItem[];
}

interface MediaSequenceManagerProps {
  sequences: MediaSequence[];
  onSequencesChange: (sequences: MediaSequence[]) => void;
}

export const MediaSequenceManager: React.FC<MediaSequenceManagerProps> = ({
  sequences,
  onSequencesChange
}) => {
  const [activeSequence, setActiveSequence] = useState(0);
  const [showAlternatives, setShowAlternatives] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'text': return 'bg-blue-500/20 text-blue-700 border-blue-500/50';
      case 'image': return 'bg-green-500/20 text-green-700 border-green-500/50';
      case 'video': return 'bg-purple-500/20 text-purple-700 border-purple-500/50';
      case 'audio': return 'bg-orange-500/20 text-orange-700 border-orange-500/50';
      case 'file': return 'bg-gray-500/20 text-gray-700 border-gray-500/50';
      default: return 'bg-gray-500/20 text-gray-700 border-gray-500/50';
    }
  };

  const addSequence = () => {
    const newSequence: MediaSequence = {
      id: Date.now().toString(),
      name: `Sequência ${sequences.length + 1}`,
      items: [],
    };
    
    onSequencesChange([...sequences, newSequence]);
    setActiveSequence(sequences.length);
  };

  const validateSequenceForSave = () => {
    return sequences.every(sequence => sequence.items.length > 0);
  };

  const removeSequence = (index: number) => {
    if (sequences.length <= 1) return;
    
    const newSequences = sequences.filter((_, i) => i !== index);
    if (newSequences.length > 0 && !newSequences.some(s => s.isDefault)) {
      newSequences[0].isDefault = true;
    }
    
    onSequencesChange(newSequences);
    setActiveSequence(Math.max(0, Math.min(activeSequence, newSequences.length - 1)));
  };

  const updateSequence = (index: number, updates: Partial<MediaSequence>) => {
    const newSequences = [...sequences];
    newSequences[index] = { ...newSequences[index], ...updates };
    onSequencesChange(newSequences);
  };

  const moveItem = (sequenceIndex: number, itemIndex: number, direction: 'up' | 'down') => {
    const sequence = sequences[sequenceIndex];
    const newItems = [...sequence.items];
    
    const targetIndex = direction === 'up' ? itemIndex - 1 : itemIndex + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;
    
    [newItems[itemIndex], newItems[targetIndex]] = [newItems[targetIndex], newItems[itemIndex]];
    
    // Update order numbers
    newItems.forEach((item, index) => {
      item.order = index + 1;
    });
    
    updateSequence(sequenceIndex, { items: newItems });
  };

  const addItemToSequence = (sequenceIndex: number, item: MediaItem) => {
    const sequence = sequences[sequenceIndex];
    const newItem = {
      ...item,
      id: Date.now().toString(),
      order: sequence.items.length + 1
    };
    
    updateSequence(sequenceIndex, {
      items: [...sequence.items, newItem]
    });
  };


  const removeItemFromSequence = (sequenceIndex: number, itemId: string) => {
    const sequence = sequences[sequenceIndex];
    const newItems = sequence.items
      .filter(item => item.id !== itemId)
      .map((item, index) => ({ ...item, order: index + 1 }));
    
    updateSequence(sequenceIndex, { items: newItems });
  };

  const addAlternativeToItem = (sequenceIndex: number, itemId: string, alternative: MediaItem) => {
    const sequence = sequences[sequenceIndex];
    const newItems = sequence.items.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          alternatives: [...(item.alternatives || []), { ...alternative, id: Date.now().toString() }]
        };
      }
      return item;
    });
    
    updateSequence(sequenceIndex, { items: newItems });
  };

  const currentSequence = sequences[activeSequence];

  return (
    <div className="space-y-6">
      {/* Sequence Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Sequências de Envio</h3>
          <Badge variant="secondary" className="bg-cyber-surface text-cyber-green border-cyber-border">
            {sequences.length} sequência(s)
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={addSequence}
            size="sm"
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Sequência
          </Button>
        </div>
      </div>
      
      <Alert className="border-cyber-border bg-cyber-surface/30">
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Como funciona:</strong> Cada sequência é uma alternativa de envio. O sistema escolherá automaticamente uma sequência aleatória para cada contato, garantindo variedade nos disparos.
        </AlertDescription>
      </Alert>

      {/* Sequence Management */}
      <Tabs value={activeSequence.toString()} onValueChange={(value) => setActiveSequence(parseInt(value))}>
        <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${sequences.length}, 1fr)` }}>
          {sequences.map((sequence, index) => (
            <TabsTrigger key={sequence.id} value={index.toString()} className="relative">
              <div className="flex items-center gap-2">
                <span>{sequence.name}</span>
                {sequence.isDefault && <Badge className="h-4 px-1 text-xs">Padrão</Badge>}
              </div>
            </TabsTrigger>
          ))}
        </TabsList>

        {sequences.map((sequence, sequenceIndex) => (
          <TabsContent key={sequence.id} value={sequenceIndex.toString()} className="space-y-4">
            {/* Sequence Settings */}
            <Card className="border-cyber-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Configurações da Sequência</CardTitle>
                  {sequences.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeSequence(sequenceIndex)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remover
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Nome da Sequência</label>
                    <Input
                      value={sequence.name}
                      onChange={(e) => updateSequence(sequenceIndex, { name: e.target.value })}
                      className="bg-muted/50 border-cyber-border"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Total de itens: {sequence.items.length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Media Items */}
            <Card className="border-cyber-border">
              <CardHeader>
                <CardTitle className="text-base">Itens da Sequência</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {sequence.items.length === 0 ? (
                  <div className="text-center py-8">
                    <Alert className="border-yellow-500/20 bg-yellow-500/10">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Sequência vazia!</strong> Adicione pelo menos um item antes de salvar a campanha.
                      </AlertDescription>
                    </Alert>
                  </div>
                ) : (
                  sequence.items.map((item, itemIndex) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 border border-cyber-border rounded-lg">
                      <span className="text-sm font-medium text-muted-foreground min-w-[20px]">
                        {item.order}.
                      </span>
                      
                      <Badge className={getTypeColor(item.type)}>
                        {getMediaIcon(item.type)}
                        <span className="ml-1 capitalize">{item.type}</span>
                      </Badge>
                      
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {item.content || item.file?.name || 'Mídia anexada'}
                        </p>
                        {item.alternatives && item.alternatives.length > 0 && (
                          <p className="text-xs text-muted-foreground">
                            {item.alternatives.length} alternativa(s) disponível(eis)
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => moveItem(sequenceIndex, itemIndex, 'up')}
                          disabled={itemIndex === 0}
                          className="h-8 w-8 p-0"
                        >
                          <ChevronUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => moveItem(sequenceIndex, itemIndex, 'down')}
                          disabled={itemIndex === sequence.items.length - 1}
                          className="h-8 w-8 p-0"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowAlternatives(item.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeItemFromSequence(sequenceIndex, item.id)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Alternative Messages Dialog */}
      {showAlternatives && (
        <Dialog open={!!showAlternatives} onOpenChange={() => setShowAlternatives(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Gerenciar Alternativas</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Adicione mensagens alternativas para este item. O sistema escolherá aleatoriamente entre elas durante o envio.
              </p>
              
              {/* Current alternatives would be displayed here */}
              <div className="space-y-2">
                <Button variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Alternativa
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

// Export validation function for use in parent component
export const validateSequences = (sequences: MediaSequence[]) => {
  return sequences.every(sequence => sequence.items.length > 0);
};