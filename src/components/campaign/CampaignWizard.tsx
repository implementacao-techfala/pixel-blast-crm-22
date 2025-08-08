import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronLeft, ChevronRight, Plus, Trash2, Volume2, Play, Square, Shuffle, Clock, AlertTriangle, Info, Users, FileText, Image, Video, File, Mic, Upload, StopCircle, AlertCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TimeValidation } from './TimeValidation';
import { AccountReputationCard } from './AccountReputationCard';
import { MediaSequenceManager, MediaSequence } from './MediaSequenceManager';
import { NumberValidationService, useNumberValidation } from './NumberValidationService';

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
  mediaItems: MediaItem[];
  randomizeMedia: boolean;
  maxLeads: number;
  delayMin: number;
  delayMax: number;
  useTemplate?: boolean;
  templateName?: string;
}

interface MediaItem {
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

interface Contact {
  id: string;
  name: string;
  phone: string;
  [key: string]: any; // Dynamic columns from imported spreadsheet
}

interface VariableWarning {
  variable: string;
  missingContacts: number;
}

interface CampaignWizardProps {
  onSave: (campaign: Campaign) => void;
  onCancel: () => void;
  templates?: Campaign[];
}

const mockTags = ['cliente', 'lead', 'premium', 'interessado', 'vip', 'prospecção', 'ativo', 'cold', 'warm', 'hot'];
const mockAccounts = [
  { id: '1', name: 'Conta Principal', phone: '+55 11 99999-9999', status: 'connected' },
  { id: '2', name: 'Suporte', phone: '+55 11 88888-8888', status: 'connected' },
  { id: '3', name: 'Vendas', phone: '+55 11 77777-7777', status: 'connected' }
];

const LEADS_PER_TAG = {
  'cliente': 45,
  'lead': 120,
  'premium': 15,
  'interessado': 80,
  'vip': 12,
  'prospecção': 200,
  'ativo': 95,
  'cold': 150,
  'warm': 67,
  'hot': 23
};

const DELAY_PRESETS = [
  { label: '60s (Recomendado para teste)', value: 60 },
  { label: '120s (Recomendado - Anti-banimento)', value: 120 },
  { label: '180s (Seguro)', value: 180 },
  { label: '300s (Ultra seguro)', value: 300 }
];

// Mock available columns from imported spreadsheet
const AVAILABLE_COLUMNS = ['nome', 'empresa', 'telefone', 'email', 'cargo', 'cidade', 'produto_interesse'];

export const CampaignWizard = ({ onSave, onCancel, templates = [] }: CampaignWizardProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [tagsPage, setTagsPage] = useState(1);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Form states
  const [campaignName, setCampaignName] = useState('');
  const [schedules, setSchedules] = useState([{ date: '', time: '' }]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [excludedContacts, setExcludedContacts] = useState('');
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [randomizeMedia, setRandomizeMedia] = useState(false);
  const [maxLeads, setMaxLeads] = useState(0);
  const [delayMin, setDelayMin] = useState(60);
  const [delayMax, setDelayMax] = useState(180);
  const [delayAverage, setDelayAverage] = useState(120);
  const [useCustomDelay, setUseCustomDelay] = useState(false);
  const [useTemplate, setUseTemplate] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [variableWarnings, setVariableWarnings] = useState<VariableWarning[]>([]);
  const [mediaSequences, setMediaSequences] = useState<MediaSequence[]>([
    { id: '1', name: 'Sequência Principal', items: [], isDefault: true }
  ]);
  
  // Number validation
  const { validateNumbers, checkNumbersForExclusion, isValidating } = useNumberValidation();

  const tagsPerPage = 6;
  const totalTagPages = Math.ceil(mockTags.length / tagsPerPage);
  const startIndex = (tagsPage - 1) * tagsPerPage;
  const currentTags = mockTags.slice(startIndex, startIndex + tagsPerPage);

  const totalLeads = selectedTags.reduce((sum, tag) => sum + (LEADS_PER_TAG[tag as keyof typeof LEADS_PER_TAG] || 0), 0);
  
  // Calculate average delay when min/max changes and update automatically
  const updateDelayValues = (newMin: number, newMax: number) => {
    setDelayMin(newMin);
    setDelayMax(newMax);
    setDelayAverage(Math.round((newMin + newMax) / 2));
  };

  const getValidationMessage = () => {
    const now = new Date();
    const invalidSchedules = schedules.filter(schedule => {
      if (!schedule.date || !schedule.time) return false;
      const scheduleDateTime = new Date(`${schedule.date}T${schedule.time}`);
      return scheduleDateTime <= now;
    });
    
    if (invalidSchedules.length > 0) {
      return "Algumas datas/horários são do passado. Só é possível agendar para o futuro.";
    }

    // Validate delay min < max
    if (delayMin >= delayMax) {
      return "O delay mínimo deve ser menor que o delay máximo.";
    }
    
    return null;
  };

  const validateFutureTime = (date: string, time: string) => {
    if (!date || !time) return true;
    const scheduleDateTime = new Date(`${date}T${time}`);
    return scheduleDateTime > new Date();
  };

  const addSchedule = () => {
    setSchedules([...schedules, { date: '', time: '' }]);
  };

  const removeSchedule = (index: number) => {
    if (schedules.length > 1) {
      setSchedules(schedules.filter((_, i) => i !== index));
    }
  };

  const updateSchedule = (index: number, field: 'date' | 'time', value: string) => {
    const updated = [...schedules];
    updated[index][field] = value;
    setSchedules(updated);
  };

  const loadTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setCampaignName(template.name);
      setSelectedTags(template.selectedTags);
      setSelectedAccounts(template.selectedAccounts);
      setMediaItems(template.mediaItems);
      setRandomizeMedia(template.randomizeMedia);
      setMaxLeads(template.maxLeads);
      setDelayMin(template.delayMin);
      setDelayMax(template.delayMax);
      setDelayAverage(Math.round((template.delayMin + template.delayMax) / 2));
      setExcludedContacts(template.excludedContacts);
      
      // Update schedules to future dates when cloning
      const now = new Date();
      const futureDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Tomorrow
      const futureTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      setSchedules([{ 
        date: futureDate.toISOString().split('T')[0], 
        time: futureTime 
      }]);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
      setMediaRecorder(recorder);
      mediaRecorderRef.current = recorder;

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => {
          if (prev >= 30) {
            stopRecording();
            return 30;
          }
          return prev + 1;
        });
      }, 1000);

    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setMediaRecorder(null);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const addMediaItem = (type: MediaItem['type'], content: string = '', file?: File, audioBlob?: Blob) => {
    const newItem: MediaItem = {
      id: Date.now().toString(),
      type,
      content,
      order: mediaItems.length + 1,
      file,
      audioBlob,
      alternatives: []
    };
    
    // Add to the old mediaItems for backwards compatibility
    setMediaItems([...mediaItems, newItem]);
    
    // Also add to the current active sequence
    const activeSequenceIndex = 0; // Default to first sequence for now
    const updatedSequences = [...mediaSequences];
    const currentSequence = updatedSequences[activeSequenceIndex];
    
    const sequenceItem = {
      ...newItem,
      order: currentSequence.items.length + 1
    };
    
    currentSequence.items.push(sequenceItem);
    setMediaSequences(updatedSequences);
  };

  const removeMediaItem = (id: string) => {
    setMediaItems(mediaItems.filter(item => item.id !== id));
  };

  const updateMediaItem = (id: string, updates: Partial<MediaItem>) => {
    setMediaItems(mediaItems.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  const checkVariableWarnings = () => {
    const warnings: VariableWarning[] = [];
    const totalContacts = Math.min(totalLeads, maxLeads || totalLeads);
    
    mediaItems.forEach(item => {
      if (item.type === 'text' && item.content) {
        const variables = item.content.match(/\{\{([^}]+)\}\}/g) || [];
        variables.forEach(variable => {
          const varName = variable.replace(/[{}]/g, '');
          if (!AVAILABLE_COLUMNS.includes(varName)) {
            const existing = warnings.find(w => w.variable === varName);
            if (!existing) {
              warnings.push({
                variable: varName,
                missingContacts: Math.floor(totalContacts * 0.2) // Simulate 20% missing
              });
            }
          }
        });
      }
    });
    
    setVariableWarnings(warnings);
  };

  const handleSave = () => {
    const validationMessage = getValidationMessage();
    if (validationMessage) return;

    if (!campaignName || schedules.some(s => !s.date || !s.time) || selectedTags.length === 0 || selectedAccounts.length === 0) {
      return;
    }

    // Create multiple campaigns for multiple schedules
    schedules.forEach((schedule, index) => {
      const campaign: Campaign = {
        id: `${Date.now()}-${index}`,
        name: schedules.length > 1 ? `${campaignName} - ${index + 1}` : campaignName,
        schedules: [schedule],
        status: 'scheduled',
        targetCount: Math.min(totalLeads, maxLeads || totalLeads),
        sentCount: 0,
        mediaTypes: mediaItems.map(item => item.type),
        selectedAccounts,
        selectedTags,
        excludedContacts,
        mediaItems,
        randomizeMedia,
        maxLeads: maxLeads || totalLeads,
        delayMin,
        delayMax,
        useTemplate: saveAsTemplate,
        templateName: saveAsTemplate ? templateName : undefined
      };
      onSave(campaign);
    });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-foreground mb-2">Informações Básicas</h3>
              <p className="text-muted-foreground">Configure os dados principais da campanha</p>
            </div>

            {useTemplate && (
              <Card className="border-cyber-border">
                <CardHeader>
                  <CardTitle className="text-cyber-purple">Carregar Template</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={selectedTemplate} onValueChange={(value) => {
                    setSelectedTemplate(value);
                    loadTemplate(value);
                  }}>
                    <SelectTrigger className="bg-muted/50 border-cyber-border">
                      <SelectValue placeholder="Selecione um template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            )}

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

            <div>
              <div className="flex items-center justify-between mb-4">
                <Label>Datas e Horários de Envio</Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={addSchedule}
                  className="border-cyber-border hover:border-cyber-green"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar Data
                </Button>
              </div>
              
              {schedules.map((schedule, index) => (
                <Card key={index} className="mb-3 border-cyber-border">
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`date-${index}`}>Data {index + 1}</Label>
                        <Input
                          id={`date-${index}`}
                          type="date"
                          value={schedule.date}
                          onChange={(e) => updateSchedule(index, 'date', e.target.value)}
                          className={`bg-muted/50 border-cyber-border focus:border-cyber-green ${
                            schedule.date && schedule.time && !validateFutureTime(schedule.date, schedule.time) 
                              ? 'border-destructive' : ''
                          }`}
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`time-${index}`}>Horário {index + 1}</Label>
                        <div className="flex gap-2">
                          <Input
                            id={`time-${index}`}
                            type="time"
                            value={schedule.time}
                            onChange={(e) => updateSchedule(index, 'time', e.target.value)}
                            className={`bg-muted/50 border-cyber-border focus:border-cyber-green ${
                              schedule.date && schedule.time && !validateFutureTime(schedule.date, schedule.time) 
                                ? 'border-destructive' : ''
                            }`}
                          />
                          {schedules.length > 1 && (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => removeSchedule(index)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {getValidationMessage() && (
                <Alert className="mt-2">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-destructive">
                    {getValidationMessage()}
                  </AlertDescription>
                </Alert>
              )}
              
              {/* Time Validation */}
              <TimeValidation schedules={schedules} />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-foreground mb-2">Público-alvo</h3>
              <p className="text-muted-foreground">Selecione as tags e contas</p>
            </div>

            <Card className="border-cyber-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-cyber-green flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Total de Leads: {totalLeads}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Página {tagsPage} de {totalTagPages}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setTagsPage(Math.max(1, tagsPage - 1))}
                      disabled={tagsPage === 1}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setTagsPage(Math.min(totalTagPages, tagsPage + 1))}
                      disabled={tagsPage === totalTagPages}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {currentTags.map((tag) => (
                    <div key={tag} className="flex items-center justify-between p-2 border border-cyber-border rounded">
                      <div className="flex items-center space-x-2">
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
                        <Label htmlFor={tag} className="text-sm font-medium">{tag}</Label>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {LEADS_PER_TAG[tag as keyof typeof LEADS_PER_TAG]} leads
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div>
              <Label htmlFor="maxLeads">
                Limite de Leads (0 = sem limite)
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 ml-1 inline cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Defina o número máximo de leads que receberão a campanha</p>
                  </TooltipContent>
                </Tooltip>
              </Label>
              <Input
                id="maxLeads"
                type="number"
                value={maxLeads}
                onChange={(e) => setMaxLeads(parseInt(e.target.value) || 0)}
                placeholder="Ex: 100"
                className="bg-muted/50 border-cyber-border focus:border-cyber-green"
              />
            </div>

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
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-foreground mb-2">Contas WhatsApp</h3>
              <p className="text-muted-foreground">Selecione as contas para envio</p>
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Ao selecionar múltiplas contas, os disparos serão distribuídos igualmente entre elas, 
                começando pela primeira conta selecionada.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              {NumberValidationService.getAllAccountReputations().map((reputation) => (
                <AccountReputationCard
                  key={reputation.accountId}
                  reputation={reputation}
                  isSelected={selectedAccounts.includes(reputation.accountId)}
                  onSelect={(accountId) => {
                    if (selectedAccounts.includes(accountId)) {
                      setSelectedAccounts(selectedAccounts.filter(id => id !== accountId));
                    } else {
                      setSelectedAccounts([...selectedAccounts, accountId]);
                    }
                  }}
                />
              ))}
            </div>

            <Card className="border-cyber-border">
              <CardHeader>
                <CardTitle className="text-cyber-purple">Configurações de Envio</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Quick Delay Presets */}
                <div>
                  <Label className="text-sm font-medium">Presets de Delay Recomendados</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {DELAY_PRESETS.map((preset) => (
                      <Button
                        key={preset.value}
                        type="button"
                        variant={delayAverage === preset.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          const newMin = Math.max(1, preset.value - 60);
                          const newMax = preset.value + 60;
                          updateDelayValues(newMin, newMax);
                          setUseCustomDelay(false);
                        }}
                        className={`text-xs h-auto py-2 px-3 ${preset.value === 120 ? 'border-cyber-green' : ''}`}
                      >
                        {preset.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Custom Delay Configuration */}
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <Switch
                      id="customDelay"
                      checked={useCustomDelay}
                      onCheckedChange={setUseCustomDelay}
                    />
                    <Label htmlFor="customDelay" className="text-sm">Configuração personalizada</Label>
                  </div>

                  {useCustomDelay ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="delayMin" className="text-sm">
                            Delay Mínimo (s)
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-4 w-4 ml-1 inline cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Tempo mínimo entre envios para evitar bloqueios</p>
                              </TooltipContent>
                            </Tooltip>
                          </Label>
                          <Input
                            id="delayMin"
                            type="number"
                            min="1"
                            max="300"
                            value={delayMin}
                            onChange={(e) => {
                              const value = parseInt(e.target.value) || 1;
                              updateDelayValues(value, delayMax);
                            }}
                            className="bg-muted/50 border-cyber-border focus:border-cyber-green"
                          />
                        </div>
                        <div>
                          <Label htmlFor="delayMax" className="text-sm">
                            Delay Máximo (s)
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-4 w-4 ml-1 inline cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Tempo máximo entre envios para randomização</p>
                              </TooltipContent>
                            </Tooltip>
                          </Label>
                          <Input
                            id="delayMax"
                            type="number"
                            min={delayMin + 1}
                            max="600"
                            value={delayMax}
                            onChange={(e) => {
                              const value = parseInt(e.target.value) || delayMin + 1;
                              if (value > delayMin) {
                                updateDelayValues(delayMin, value);
                              }
                            }}
                            className={`bg-muted/50 border-cyber-border focus:border-cyber-green ${
                              delayMax <= delayMin ? 'border-destructive' : ''
                            }`}
                          />
                        </div>
                        <div>
                          <Label className="text-sm">Delay Médio</Label>
                          <div className="flex items-center h-10 px-3 bg-muted/50 border border-cyber-border rounded-md">
                            <span className="text-sm font-medium text-cyber-green">{delayAverage}s</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-2">Configuração atual:</p>
                      <p className="text-sm">
                        <span className="font-medium">Delay médio:</span> {delayAverage}s 
                        <span className="text-muted-foreground ml-2">
                          (Variação: {Math.max(1, delayAverage - 60)}s - {delayAverage + 60}s)
                        </span>
                      </p>
                    </div>
                  )}
                  
                  {delayMin >= delayMax && (
                    <Alert className="border-destructive">
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                      <AlertDescription className="text-destructive">
                        O delay mínimo deve ser menor que o delay máximo.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-foreground mb-2">Conteúdo</h3>
              <p className="text-muted-foreground">Configure as sequências de mensagens e mídias</p>
            </div>

            <MediaSequenceManager 
              sequences={mediaSequences}
              onSequencesChange={setMediaSequences}
            />


            {/* Media Selection Tabs */}
            <Tabs defaultValue="text" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="text" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Texto
                </TabsTrigger>
                <TabsTrigger value="image" className="flex items-center gap-2">
                  <Image className="h-4 w-4" />
                  Imagem
                </TabsTrigger>
                <TabsTrigger value="file" className="flex items-center gap-2">
                  <File className="h-4 w-4" />
                  Documento
                </TabsTrigger>
                <TabsTrigger value="audio" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Áudio PC
                </TabsTrigger>
                <TabsTrigger value="record" className="flex items-center gap-2">
                  <Mic className="h-4 w-4" />
                  Gravar
                </TabsTrigger>
              </TabsList>

              <TabsContent value="text" className="space-y-4">
                <Card className="border-cyber-border">
                  <CardHeader>
                    <CardTitle className="text-cyber-green">Mensagem de Texto</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="Digite sua mensagem aqui... Use {{nome}}, {{empresa}}, etc. para personalização"
                      className="bg-muted/50 border-cyber-border focus:border-cyber-green min-h-[100px]"
                      onChange={(e) => {
                        const content = e.target.value;
                        checkVariableWarnings();
                      }}
                    />
                    <Button
                      type="button"
                      className="mt-3"
                      onClick={() => {
                        const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
                        if (textarea?.value) {
                          addMediaItem('text', textarea.value);
                          textarea.value = '';
                        }
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Texto
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="image" className="space-y-4">
                <Card className="border-cyber-border">
                  <CardHeader>
                    <CardTitle className="text-cyber-green">Upload de Imagem</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Input
                      type="file"
                      accept="image/*"
                      className="bg-muted/50 border-cyber-border"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          addMediaItem('image', file.name, file);
                        }
                      }}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="file" className="space-y-4">
                <Card className="border-cyber-border">
                  <CardHeader>
                    <CardTitle className="text-cyber-green">Upload de Documento</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Input
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      className="bg-muted/50 border-cyber-border"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          addMediaItem('file', file.name, file);
                        }
                      }}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="audio" className="space-y-4">
                <Card className="border-cyber-border">
                  <CardHeader>
                    <CardTitle className="text-cyber-green">Upload de Áudio</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Input
                      type="file"
                      accept="audio/*"
                      className="bg-muted/50 border-cyber-border"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          addMediaItem('audio', file.name, file);
                        }
                      }}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="record" className="space-y-4">
                <Card className="border-cyber-border">
                  <CardHeader>
                    <CardTitle className="text-cyber-purple">Gravação de Áudio</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                      {!isRecording ? (
                        <Button
                          type="button"
                          onClick={startRecording}
                          className="bg-primary hover:bg-primary/90"
                        >
                          <Volume2 className="h-4 w-4 mr-2" />
                          Gravar Áudio
                        </Button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="destructive"
                            onClick={stopRecording}
                          >
                            <StopCircle className="h-4 w-4 mr-2" />
                            Parar Gravação
                          </Button>
                          <div className="flex items-center gap-2 bg-destructive/10 px-3 py-2 rounded">
                            <div className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
                            <span className="text-sm font-medium">{recordingDuration}s / 30s</span>
                          </div>
                        </div>
                      )}
                      
                      {audioBlob && (
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">Áudio gravado ({recordingDuration}s)</Badge>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const audio = new Audio(URL.createObjectURL(audioBlob));
                              audio.play();
                            }}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => {
                              addMediaItem('recorded_audio', `Áudio gravado (${recordingDuration}s)`, undefined, audioBlob);
                              setAudioBlob(null);
                              setRecordingDuration(0);
                            }}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Adicionar
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>


            {/* Variable Warnings */}
            {variableWarnings.length > 0 && (
              <Alert className="border-destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-medium">Variáveis não encontradas em alguns contatos:</p>
                    {variableWarnings.map((warning) => (
                      <div key={warning.variable} className="text-sm">
                        • <code>{'{{' + warning.variable + '}}'}</code>: {warning.missingContacts} contatos sem esta informação
                      </div>
                    ))}
                    <p className="text-xs mt-2">
                      Recomendamos criar mensagens alternativas para estes casos.
                    </p>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Variables Guide */}
            <Card className="border-cyber-border">
              <CardHeader>
                <CardTitle className="text-cyber-green">Variáveis Disponíveis</CardTitle>
                <CardDescription>
                  Baseadas nas colunas importadas da planilha de contatos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {AVAILABLE_COLUMNS.map((column) => (
                    <div key={column} className="flex items-center gap-2">
                      <code className="bg-muted p-2 rounded flex-1">{'{{' + column + '}}'}</code>
                      <span className="capitalize text-muted-foreground">{column.replace('_', ' ')}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-foreground mb-2">Resumo</h3>
              <p className="text-muted-foreground">Revise sua campanha antes de criar</p>
            </div>

            <Card className="border-cyber-border">
              <CardHeader>
                <CardTitle className="text-cyber-green">Resumo da Campanha</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Nome:</p>
                    <p className="font-medium">{campaignName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Campanhas a criar:</p>
                    <p className="font-medium">{schedules.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total de leads:</p>
                    <p className="font-medium text-cyber-green">{Math.min(totalLeads, maxLeads || totalLeads)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Contas selecionadas:</p>
                    <p className="font-medium text-cyber-blue">{selectedAccounts.length}</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Agendamentos:</p>
                  <div className="space-y-1">
                    {schedules.map((schedule, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4" />
                        {new Date(`${schedule.date}T${schedule.time}`).toLocaleString('pt-BR')}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Tags selecionadas:</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedTags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Configurações:</p>
                    <ul className="text-sm space-y-1">
                      <li>• Delay médio: {delayAverage}s (variação: {delayMin}s - {delayMax}s)</li>
                      <li>• Aleatorizar mídia: {randomizeMedia ? 'Sim' : 'Não'}</li>
                      <li>• Itens de mídia: {mediaItems.length}</li>
                      {maxLeads > 0 && <li>• Limite de leads: {maxLeads}</li>}
                    </ul>
                  </div>
              </CardContent>
            </Card>

            {/* Template Saving */}
            <Card className="border-cyber-border">
              <CardHeader>
                <CardTitle className="text-cyber-purple">Salvar como Template</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="saveTemplate"
                    checked={saveAsTemplate}
                    onCheckedChange={setSaveAsTemplate}
                  />
                  <Label htmlFor="saveTemplate">Salvar esta configuração como template</Label>
                </div>
                
                {saveAsTemplate && (
                  <div>
                    <Label htmlFor="templateName">Nome do Template</Label>
                    <Input
                      id="templateName"
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                      placeholder="Ex: Template Promoção"
                      className="bg-muted/50 border-cyber-border focus:border-cyber-green"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  const canContinue = () => {
    switch (currentStep) {
      case 1:
        return campaignName && schedules.every(s => s.date && s.time) && !getValidationMessage();
      case 2:
        return selectedTags.length > 0;
      case 3:
        return selectedAccounts.length > 0;
      case 4:
        return mediaItems.length > 0;
      case 5:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {[1, 2, 3, 4, 5].map((step) => (
          <div key={step} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
              step === currentStep 
                ? 'bg-primary text-primary-foreground' 
                : step < currentStep 
                  ? 'bg-cyber-green text-background' 
                  : 'bg-muted text-muted-foreground'
            }`}>
              {step}
            </div>
            {step < 5 && (
              <div className={`h-0.5 w-16 mx-2 ${
                step < currentStep ? 'bg-cyber-green' : 'bg-muted'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card className="border-cyber-border">
        <CardContent className="p-6">
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <Button
          variant="ghost"
          onClick={() => currentStep === 1 ? onCancel() : setCurrentStep(currentStep - 1)}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          {currentStep === 1 ? 'Cancelar' : 'Anterior'}
        </Button>
        
        <Button
          onClick={() => currentStep === 5 ? handleSave() : setCurrentStep(currentStep + 1)}
          disabled={!canContinue()}
          className="bg-primary hover:bg-primary/90"
        >
          {currentStep === 5 ? 'Criar Campanha' : 'Próximo'}
          {currentStep < 5 && <ChevronRight className="h-4 w-4 ml-2" />}
        </Button>
      </div>

    </div>
  );
};