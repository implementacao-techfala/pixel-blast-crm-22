import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronLeft, ChevronRight, Plus, Trash2, Volume2, Play, Square, Shuffle, Clock, AlertTriangle, Info, Users, FileText, Image, Video, File, Mic, Upload, StopCircle, AlertCircle, CheckCircle, Loader2, Tag, Search } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TimeValidation } from './TimeValidation';
import { AccountReputationCard } from './AccountReputationCard';
import { MediaSequenceManager, MediaSequence, MediaItem } from './MediaSequenceManager';
import { useTags } from '@/hooks/useTags';
import { useAccounts } from '@/hooks/useAccounts';
import { SequenceManager } from './SequenceManager';
import { useToast } from '@/hooks/use-toast';
import { Campaign } from '@/hooks/useCampaigns';

// ✅ REMOVIDO: Interface MediaItem duplicada - agora importada do MediaSequenceManager

interface Contact {
  id: string;
  name: string;
  phone: string;
  [key: string]: any; // Dynamic columns from imported spreadsheet
}

// ✅ REMOVIDO: Interface de variáveis - funcionalidade desabilitada

interface CampaignWizardProps {
  onSave: (campaign: Campaign) => void;
  onCancel: () => void;
  templates?: Campaign[];
}

// Dados mockados temporários até implementar contagem real de leads por tag
const mockAccounts = [
  { id: '1', name: 'Conta Principal', phone: '+55 11 99999-9999', status: 'connected' },
  { id: '2', name: 'Suporte', phone: '+55 11 88888-8888', status: 'connected' },
  { id: '3', name: 'Vendas', phone: '+55 11 77777-7777', status: 'connected' }
];

const DELAY_PRESETS = [
  { label: '60s (Recomendado para teste)', value: 60 },
  { label: '120s (Recomendado - Anti-banimento)', value: 120 },
  { label: '180s (Seguro)', value: 180 },
  { label: '300s (Ultra seguro)', value: 300 }
];

// ✅ REMOVIDO: Variáveis de personalização desabilitadas por enquanto

export const CampaignWizard = ({ onSave, onCancel, templates = [] }: CampaignWizardProps) => {
  const { toast } = useToast();
  
  const { 
    tags, 
    loading: tagsLoading, 
    error: tagsError, 
    retryCount,
    refreshTags,
    getStats 
  } = useTags();
  
  const {
    accounts,
    loading: accountsLoading,
    error: accountsError,
    refreshAccounts,

    getStats: getAccountsStats
  } = useAccounts();
  
  // Debug logs com estatísticas
  console.log('🔍 CampaignWizard - tags:', tags);
  console.log('🔍 CampaignWizard - tagsLoading:', tagsLoading);
  console.log('🔍 CampaignWizard - tagsError:', tagsError);
  console.log('🔍 CampaignWizard - retryCount:', retryCount);
  console.log('📊 Estatísticas das tags:', getStats());
  console.log('🔍 CampaignWizard - accounts:', accounts);
  console.log('🔍 CampaignWizard - accountsLoading:', accountsLoading);
  console.log('🔍 CampaignWizard - accountsError:', accountsError);
  console.log('📊 Estatísticas das contas:', getAccountsStats());
  
  // Refresh automático das tags quando o componente é montado
  useEffect(() => {
    console.log('🚀 CampaignWizard montado - Fazendo refresh automático das tags');
    refreshTags();
  }, []);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [tagsPage, setTagsPage] = useState(1);
  // Estados para seleção de contas
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [accountPage, setAccountPage] = useState(1);
  const [accountSearchQuery, setAccountSearchQuery] = useState('');
  const [selectedAccountTags, setSelectedAccountTags] = useState<string[]>([]);
  const accountsPerPage = 10;
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
  // ✅ REMOVIDO: Estados de exceções - funcionalidade desabilitada
  const [sequences, setSequences] = useState<MediaSequence[]>([
    {
      id: '1',
      name: 'Sequência Principal',
      items: []
    }
  ]);
  const [activeSequenceIndex, setActiveSequenceIndex] = useState(0);
  const [delayMin, setDelayMin] = useState(60);
  const [delayMax, setDelayMax] = useState(180);
  const [delayAverage, setDelayAverage] = useState(120);
  const [useCustomDelay, setUseCustomDelay] = useState(false);
  const [useTemplate, setUseTemplate] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [templateName, setTemplateName] = useState('');
  // ✅ REMOVIDO: Estado de variáveis - funcionalidade desabilitada
  
  // Configurações de paginação
  // const accountsPerPage = 10; // This line is now redundant as it's defined above
  
  // Filtrar contas baseado na busca e tags selecionadas
  const filteredAccounts = Array.isArray(accounts) 
    ? accounts.filter(account => {
        // ✅ CORRIGIDO: Filtro por busca - lidando com campos que podem ser strings ou números
        const matchesSearch = 
          String(account.nome_conta).toLowerCase().includes(accountSearchQuery.toLowerCase()) ||
          String(account.telefone).includes(accountSearchQuery) ||
          String(account.status).toLowerCase().includes(accountSearchQuery.toLowerCase());
        
        // Filtro por tags (se alguma tag estiver selecionada)
        const matchesTags = selectedAccountTags.length === 0 || 
          selectedAccountTags.some(tagName => {
            const tag = Array.isArray(tags) ? tags.find(t => t.nome === tagName && t.tipo === 'conta') : null;
            return tag && tag.id === account.id_tag;
          });
        
        return matchesSearch && matchesTags;
      })
    : [];
  
  // ✅ CORRIGIDO: Verificar se todas as contas estão selecionadas
  const areAllAccountsSelected = filteredAccounts.length > 0 && 
    filteredAccounts.every(account => selectedAccounts.includes(String(account.nome_conta)));
  
  // ✅ CORRIGIDO: Função para selecionar/desselecionar todas as contas
  const toggleAllAccounts = () => {
    if (areAllAccountsSelected) {
      setSelectedAccounts([]);
    } else {
      const allAccountNames = filteredAccounts.map(account => String(account.nome_conta));
      setSelectedAccounts(allAccountNames);
    }
  };

  // Refresh de contas somente se necessário ao entrar na etapa 3 (evita resetar progresso)
  useEffect(() => {
    if (currentStep === 3) {
      const noAccountsLoaded = !Array.isArray(accounts) || accounts.length === 0;
      if (noAccountsLoaded) {
        console.log('🚀 Etapa 3 (Contas) - carregando contas pois não há dados em memória');
      refreshAccounts();
      } else {
        console.log('✅ Etapa 3 (Contas) - contas já carregadas, não será feito refresh automático');
      }
    }
  }, [currentStep]);
  
  // Reset da página quando a busca ou tags mudarem
  useEffect(() => {
    setAccountPage(1);
  }, [accountSearchQuery, selectedAccountTags]);

  const tagsPerPage = 6;
  const totalTagPages = Math.ceil(Array.isArray(tags) ? tags.length / tagsPerPage : 0);
  const startIndex = (tagsPage - 1) * tagsPerPage;
  const currentTags = Array.isArray(tags) ? tags.slice(startIndex, startIndex + tagsPerPage) : [];
  
  // Filtrar apenas tags do tipo 'lead' para a etapa 2 (filtro de leads)
  const leadTags = Array.isArray(tags) ? tags.filter(tag => tag.tipo === 'lead') : [];
  const totalLeadTagPages = Math.ceil(leadTags.length / tagsPerPage);
  const startLeadIndex = (tagsPage - 1) * tagsPerPage;
  const currentLeadTags = leadTags.slice(startLeadIndex, startLeadIndex + tagsPerPage);
  
  // Debug logs para paginação
  console.log('📄 Paginação de tags:');
  console.log('   - Total de tags:', Array.isArray(tags) ? tags.length : 'N/A');
  console.log('   - Tags de lead:', leadTags.length);
  console.log('   - Página atual:', tagsPage);
  console.log('   - Total de páginas:', totalLeadTagPages);
  console.log('   - Tags da página atual:', currentLeadTags);
  
  // Calculate average delay when min/max changes and update automatically
  const updateDelayValues = (newMin: number, newMax: number) => {
    setDelayMin(newMin);
    setDelayMax(newMax);
    setDelayAverage(Math.round((newMin + newMax) / 2));
  };

  const getValidationMessage = () => {
    // Only validate what's relevant for the current step
    switch (currentStep) {
      case 1:
        if (!campaignName) return 'Nome da campanha é obrigatório';
        if (schedules.some(s => !s.date || !s.time)) return 'Todas as datas e horários devem ser preenchidos';
        return null;
      case 2:
        if (selectedTags.length === 0) return 'Selecione pelo menos uma tag de lead para filtrar o público';
        
        // ✅ REMOVIDO: Validações de exceções - funcionalidade desabilitada
        
        return null;
      case 3:
        if (selectedAccounts.length === 0) return 'Selecione pelo menos uma conta';
        return null;
      case 4:
        if (sequences.length === 0 || sequences.every(s => s.items.length === 0)) {
          return 'Adicione pelo menos uma sequência com itens de mídia';
        }
        return null;
      case 5:
        // Final validation before save
        if (!campaignName) return 'Nome da campanha é obrigatório';
        if (schedules.some(s => !s.date || !s.time)) return 'Todas as datas e horários devem ser preenchidos';
        if (selectedTags.length === 0) return 'Selecione pelo menos uma tag de lead para filtrar o público';
        if (selectedAccounts.length === 0) return 'Selecione pelo menos uma conta';
        if (sequences.length === 0 || sequences.every(s => s.items.length === 0)) {
          return 'Adicione pelo menos uma sequência com itens de mídia';
        }
        if (delayMin > delayMax) return 'Delay mínimo não pode ser maior que o máximo';
        
        // ✅ REMOVIDO: Validações finais de exceções - funcionalidade desabilitada
        
    return null;
      default:
        return null;
    }
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

  // ✅ NOVO: Validação de formato de telefone para exceções
  const validatePhoneFormat = (phone: string): boolean => {
    // Padrão: +55 (11) 99999-9999 ou +5511999999999
    const phoneRegex = /^\+55\s?\(?[1-9]{2}\)?\s?[9]?[0-9]{4}-?[0-9]{4}$/;
    return phoneRegex.test(phone.trim());
  };

  // ✅ NOVO: Formatar telefone automaticamente
  const formatPhoneNumber = (phone: string): string => {
    // Remove tudo exceto números
    const numbers = phone.replace(/\D/g, '');
    
    // Se não tem DDI, adiciona +55
    if (numbers.length === 11 && !phone.startsWith('+')) {
      return `+55${numbers}`;
    }
    
    // Se tem DDI mas não tem +
    if (numbers.length === 13 && !phone.startsWith('+')) {
      return `+${numbers}`;
    }
    
    return phone;
  };

  // ✅ NOVO: Limites de tamanho para mídias (em MB)
  const MEDIA_LIMITS = {
    image: 5,      // 5MB para imagens
    file: 10,      // 10MB para documentos
    audio: 15,     // 15MB para áudios
    video: 20      // 20MB para vídeos
  };

  // ✅ NOVO: Converter arquivo para Base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result as string;
        // Remove o prefixo "data:image/jpeg;base64," para obter apenas o Base64
        const base64Data = base64.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  // ✅ NOVO: Validar tamanho e tipo de arquivo
  const validateMediaFile = (file: File, type: 'image' | 'file' | 'audio' | 'video'): { valid: boolean; error?: string } => {
    const maxSizeMB = MEDIA_LIMITS[type];
    const fileSizeMB = file.size / (1024 * 1024);
    
    if (fileSizeMB > maxSizeMB) {
      return {
        valid: false,
        error: `Arquivo muito grande: ${fileSizeMB.toFixed(1)}MB. Limite: ${maxSizeMB}MB`
      };
    }
    
    // ✅ NOVO: Validação de tipo MIME
    const allowedTypes = {
      image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      file: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
      audio: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4'],
      video: ['video/mp4', 'video/avi', 'video/mov', 'video/wmv']
    };
    
    if (!allowedTypes[type].includes(file.type)) {
      return {
        valid: false,
        error: `Tipo de arquivo não suportado: ${file.type}. Tipos aceitos: ${allowedTypes[type].join(', ')}`
      };
    }
    
    return { valid: true };
  };

  // ✅ NOVO: Comprimir imagem se necessário (para reduzir tamanho)
  const compressImage = async (file: File, maxWidth: number = 1920, quality: number = 0.8): Promise<Blob> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = document.createElement('img') as HTMLImageElement;
      
      img.onload = () => {
        // Calcular novas dimensões mantendo proporção
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Desenhar imagem redimensionada
        ctx.drawImage(img, 0, 0, width, height);
        
        // Converter para Blob com qualidade reduzida
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            // Fallback: converter arquivo original para Blob
            resolve(file);
          }
        }, file.type, quality);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  // ✅ NOVO: Processar arquivo de mídia e converter para Base64
  const processMediaFile = async (file: File, type: 'image' | 'file' | 'audio' | 'video'): Promise<{
    base64: string;
    fileName: string;
    fileSize: number;
    compressedFile?: Blob;
  }> => {
    // Validar arquivo
    const validation = validateMediaFile(file, type);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Converter para Base64
    const base64 = await fileToBase64(file);
    
    // Comprimir se for imagem e estiver muito grande
    let compressedFile: Blob | undefined;
    if (type === 'image' && file.size > 2 * 1024 * 1024) { // > 2MB
      try {
        compressedFile = await compressImage(file);
        console.log(`🖼️ Imagem comprimida: ${(file.size / 1024 / 1024).toFixed(1)}MB → ${(compressedFile.size / 1024 / 1024).toFixed(1)}MB`);
      } catch (error) {
        console.warn('⚠️ Falha na compressão, usando arquivo original');
      }
    }

    return {
      base64,
      fileName: file.name,
      fileSize: file.size,
      compressedFile
    };
  };

  const loadTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setCampaignName(template.name);
      setSchedules(template.schedules);
      setSelectedTags(template.selectedTags);
      setSelectedAccounts(template.selectedAccounts);
      setSequences(template.sequences);
      // setMaxLeads(template.maxLeads); // This state was removed
      setDelayMin(template.delayMin);
      setDelayMax(template.delayMax);
      // ✅ REMOVIDO: Carregamento de exceções - funcionalidade desabilitada
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

  // ✅ REMOVIDO: Funções antigas de gerenciamento de mídia
  // Agora gerenciado pelo SequenceManager

  // ✅ REMOVIDO: Verificação de variáveis - funcionalidade desabilitada

  const formatCampaignForRequest = (campaign: Campaign) => {
    // ✅ CORRIGIDO: Usar dados reais das contas em vez de mock
    const selectedAccountIds = campaign.selectedAccounts.map(accountName => {
      const account = accounts.find(acc => acc.nome_conta === accountName);
      return account?.id.toString() || '0';
    });

    return {
      nome_da_campanha: campaign.name,
      data: campaign.schedules[0].date,
      horario: campaign.schedules[0].time,
      tags: campaign.selectedTags,
      excecoes: [], // ✅ REMOVIDO: Exceções desabilitadas
      excecoes_agrupadas_em_tags: [], // ✅ REMOVIDO: Exceções por tags desabilitadas
      contas_selecionadas: selectedAccountIds, // ✅ CORRIGIDO: Array de IDs
      delay: Math.round((campaign.delayMin + campaign.delayMax) / 2).toString(), // ✅ CORRIGIDO: String simples
      configuracao_sequencia: campaign.sequences.map(sequence => ({
        nome_sequencia: sequence.name,
        itens: sequence.items.map(item => {
          const mediaItem: any = {
            tipo_de_mensagem: item.type,
            tipo: item.type // ✅ NOVO: Campo 'tipo' para identificação
          };
          
          // ✅ NOVO: Para mídias (imagem, vídeo, áudio, arquivo), usar Base64
          if (['image', 'video', 'audio', 'file', 'recorded_audio'].includes(item.type)) {
            if (item.base64) {
              mediaItem.conteudo = item.base64; // ✅ CORRIGIDO: Usar Base64 em vez do nome
              mediaItem.nome_arquivo = item.fileName || 'Arquivo sem nome';
              mediaItem.tamanho_arquivo = item.fileSize || 0;
              console.log(`✅ Mídia ${item.type} convertida para Base64:`, {
                nome: item.fileName,
          tipo: item.type,
                tamanho: item.fileSize,
                base64Length: item.base64.length,
                base64Preview: item.base64.substring(0, 50) + '...'
              });
            } else {
              // ✅ FALLBACK: Se não há Base64, usar nome do arquivo
              console.warn(`⚠️ Mídia ${item.type} sem Base64, usando nome do arquivo:`, {
                nome: item.fileName,
                tipo: item.type,
                content: item.content
              });
              mediaItem.conteudo = item.content || item.fileName || 'Arquivo sem nome';
              mediaItem.nome_arquivo = item.fileName || 'Arquivo sem nome';
              mediaItem.tamanho_arquivo = item.fileSize || 0;
            }
          } else {
            // ✅ Para texto, usar o conteúdo normal
            mediaItem.conteudo = item.content;
            console.log(`✅ Item de texto adicionado:`, {
              tipo: item.type,
              content: item.content
            });
          }
          
          return mediaItem;
        })
      }))
    };
  };

  const handleSave = async () => {
    // ✅ NOVO: Validação de datas no passado
    const now = new Date();
    const invalidSchedules = schedules.filter(schedule => {
      if (!schedule.date || !schedule.time) return false;
      const scheduleDateTime = new Date(`${schedule.date}T${schedule.time}`);
      return scheduleDateTime <= now;
    });

    if (invalidSchedules.length > 0) {
      toast({
        title: "Datas inválidas",
        description: "Não é possível agendar campanhas no passado. Verifique as datas e horários.",
        variant: "destructive"
      });
      return;
    }

    const totalContacts = selectedTags.length * 100;

    // Create multiple campaigns for multiple schedules
    const campaignsToSave: Campaign[] = [];
    
    schedules.forEach((schedule, index) => {
      const campaign: Campaign = {
        id: `${Date.now()}-${index}`,
        name: schedules.length > 1 ? `${campaignName} - ${index + 1}` : campaignName,
        schedules: [schedule],
        status: 'scheduled',
        targetCount: totalContacts,
        sentCount: 0,
        selectedAccounts,
        selectedTags,
        sequences,
        mediaTypes: sequences.map(s => s.items.map(i => i.type)).flat(),
        excludedContacts: '',
        mediaItems: sequences.map(s => s.items).flat(),
        randomizeMedia: false,
        maxLeads: totalContacts,
        delayMin,
        delayMax,
        useTemplate: saveAsTemplate,
        templateName: saveAsTemplate ? templateName : undefined,
        createdAt: new Date().toISOString()
      };
      
      campaignsToSave.push(campaign);
    });

    // Format campaigns for API request
    const formattedCampaigns = campaignsToSave.map(formatCampaignForRequest);
    
    // ✅ NOVO: Estrutura JSON para API
    const jsonPayload = {
      campanhas: formattedCampaigns
    };
    
    // ✅ NOVO: Log detalhado das campanhas formatadas
    console.log('📤 Campanhas formatadas para API:', jsonPayload);
    
    // ✅ NOVO: Verificar se há Base64 nas mídias
    jsonPayload.campanhas.forEach((campaign, campaignIndex) => {
      console.log(`🔍 Verificando campanha ${campaignIndex + 1}:`, campaign.nome_da_campanha);
      
      campaign.configuracao_sequencia.forEach((sequence, sequenceIndex) => {
        console.log(`📋 Sequência ${sequenceIndex + 1}: ${sequence.nome_sequencia}`);
        
        if (sequence.itens && Array.isArray(sequence.itens)) {
          sequence.itens.forEach((item, itemIndex) => {
            if (['image', 'video', 'audio', 'file', 'recorded_audio'].includes(item.tipo_de_mensagem)) {
              if (item.conteudo && item.conteudo.length > 100) {
                console.log(`✅ Item ${itemIndex + 1} (${item.tipo_de_mensagem}): Base64 válido`, {
                  nome: item.nome_arquivo,
                  tamanho: item.tamanho_arquivo,
                  base64Length: item.conteudo.length,
                  base64Preview: item.conteudo.substring(0, 50) + '...'
                });
              } else {
                console.warn(`⚠️ Item ${itemIndex + 1} (${item.tipo_de_mensagem}): SEM Base64 válido`, {
                  nome: item.nome_arquivo,
                  conteudo: item.conteudo,
                  tamanho: item.conteudo?.length || 0
                });
              }
            } else {
              console.log(`📝 Item ${itemIndex + 1} (${item.tipo_de_mensagem}): Texto`, {
                conteudo: item.conteudo,
                tamanho: item.conteudo?.length || 0
              });
            }
          });
        } else {
          console.warn(`⚠️ Sequência ${sequence.nome_sequencia} sem itens válidos:`, sequence);
        }
      });
    });
    
    // ✅ NOVO: Validação da estrutura JSON
    console.log('🔍 Validando estrutura JSON...');
    console.log('📊 Estrutura esperada:', {
      campanhas: 'Array de campanhas',
      cada_campanha: {
        nome_da_campanha: 'string',
        data: 'string (YYYY-MM-DD)',
        horario: 'string (HH:MM)',
        tags: 'Array de strings',
        excecoes: 'Array de strings',
        excecoes_agrupadas_em_tags: 'Array de strings (tags de leads para excluir)',
        contas_selecionadas: 'Array de IDs (strings)',
        delay: 'string (número em segundos)',
        configuracao_sequencia: 'Array de objetos com nome da sequência e Base64 das mídias'
      }
    });
    
    // ✅ NOVO: Validação dos dados
    formattedCampaigns.forEach((campaign, index) => {
      console.log(`🔍 Validação da campanha ${index + 1}:`, {
        nome: typeof campaign.nome_da_campanha === 'string' ? '✅' : '❌',
        data: typeof campaign.data === 'string' ? '✅' : '❌',
        horario: typeof campaign.horario === 'string' ? '✅' : '❌',
        tags: Array.isArray(campaign.tags) ? '✅' : '❌',
        excecoes: Array.isArray(campaign.excecoes) ? '✅' : '❌',
        excecoes_tags: Array.isArray(campaign.excecoes_agrupadas_em_tags) ? '✅' : '❌',
        contas: Array.isArray(campaign.contas_selecionadas) ? '✅' : '❌',
        delay: typeof campaign.delay === 'string' ? '✅' : '❌',
        sequencias: Array.isArray(campaign.configuracao_sequencia) ? '✅' : '❌',
        base64: (campaign.configuracao_sequencia as any[]).some(seq => 
          seq.itens && Array.isArray(seq.itens) && seq.itens.some((item: any) => item.base64)
        ) ? '✅' : '❌',
        tamanho_total: `${((campaign.configuracao_sequencia as any[]).reduce((total, seq) => 
          total + (seq.itens && Array.isArray(seq.itens) ? seq.itens.reduce((seqTotal: number, item: any) => 
            seqTotal + (item.base64 ? Math.ceil(item.base64.length * 0.75 / 1024 / 1024) : 0), 0
          ) : 0), 0
        )).toFixed(1)}MB`
      });
    });
    
    try {
      // ✅ NOVO: Integração com API
      console.log('🔄 Enviando campanha para API...');
      const response = await fetch('https://automatewebhook.techfala.com.br/webhook/cadastrar_campanha_disparo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(jsonPayload)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Campanha criada com sucesso na API:', result);
        
        // ✅ MANTIDO: Callback local para compatibilidade
    campaignsToSave.forEach(campaign => {
      onSave(campaign);
    });
      } else {
        const errorText = await response.text();
        console.error('❌ Erro na API:', response.status, errorText);
        throw new Error(`Erro na API: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('❌ Erro ao criar campanha:', error);
      
      // ✅ FALLBACK: Se API falhar, ainda salva localmente
      console.log('🔄 Fallback: Salvando campanha localmente...');
      campaignsToSave.forEach(campaign => {
        onSave(campaign);
      });
    }
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
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor={`date-${index}`}>Data {index + 1}</Label>
                        <div className="space-y-3">
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
                          
                          {/* Presets de Datas Rápidas */}
                          <div>
                            <p className="text-xs text-muted-foreground mb-2">Datas Rápidas:</p>
                            <div className="grid grid-cols-3 gap-2">
                              {(() => {
                                const today = new Date();
                                const tomorrow = new Date(today);
                                tomorrow.setDate(tomorrow.getDate() + 1);
                                const nextWeek = new Date(today);
                                nextWeek.setDate(nextWeek.getDate() + 7);
                                
                                return [
                                  { label: 'Hoje', date: today.toISOString().split('T')[0] },
                                  { label: 'Amanhã', date: tomorrow.toISOString().split('T')[0] },
                                  { label: 'Próxima Semana', date: nextWeek.toISOString().split('T')[0] }
                                ];
                              })().map(({ label, date }) => (
                                <Button
                                  key={date}
                                  type="button"
                                  size="sm"
                                  variant={schedule.date === date ? "default" : "outline"}
                                  onClick={() => updateSchedule(index, 'date', date)}
                                  className="text-xs h-8"
                                >
                                  {label}
                                </Button>
                              ))}
                      </div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor={`time-${index}`}>Horário {index + 1}</Label>
                        <div className="space-y-3">
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
                          
                          {/* Presets de Horários */}
                          <div>
                            <p className="text-xs text-muted-foreground mb-2">Horários Recomendados:</p>
                            <div className="grid grid-cols-4 gap-2">
                              {['09:00', '12:00', '15:00', '18:00'].map((time) => (
                                <Button
                                  key={time}
                                  type="button"
                                  size="sm"
                                  variant={schedule.time === time ? "default" : "outline"}
                                  onClick={() => updateSchedule(index, 'time', time)}
                                  className="text-xs h-8"
                                >
                                  {time}
                                </Button>
                              ))}
                            </div>
                          </div>
                          
                          {/* Presets de Horários de Negócio */}
                          <div>
                            <p className="text-xs text-muted-foreground mb-2">Horários de Negócio:</p>
                            <div className="grid grid-cols-3 gap-2">
                              {['08:30', '14:00', '17:30'].map((time) => (
                                <Button
                                  key={time}
                                  type="button"
                                  size="sm"
                                  variant={schedule.time === time ? "default" : "outline"}
                                  onClick={() => updateSchedule(index, 'time', time)}
                                  className="text-xs h-8"
                                >
                                  {time}
                                </Button>
                              ))}
                            </div>
                          </div>
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
              <p className="text-muted-foreground">Selecione as tags de lead para filtrar o público</p>
            </div>

            {/* Seleção de Tags de Lead */}
            <Card className="border-cyber-border">
              <CardHeader>
                  <CardTitle className="text-cyber-green flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                  Tags de Lead: {selectedTags.length}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={refreshTags}
                    disabled={tagsLoading}
                    className="border-cyber-border hover:border-cyber-green text-xs"
                  >
                    {tagsLoading ? '⏳' : '🔄'} Refresh Tags
                  </Button>

                  <span className="text-sm text-muted-foreground">Página {tagsPage} de {totalLeadTagPages}</span>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setTagsPage(Math.max(1, tagsPage - 1))}
                      disabled={tagsPage === 1}
                      className="h-7 w-7 p-0"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setTagsPage(Math.min(totalLeadTagPages, tagsPage + 1))}
                      disabled={tagsPage >= totalLeadTagPages}
                      className="h-7 w-7 p-0"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                                 {tagsLoading ? (
                   <div className="flex items-center justify-center py-8">
                     <Loader2 className="h-6 w-6 animate-spin text-cyber-purple" />
                     <span className="ml-2 text-muted-foreground">
                      Carregando tags de lead...
                       {retryCount > 0 && ` (Tentativa ${retryCount + 1})`}
                     </span>
                   </div>
                                 ) : tagsError ? (
                   <div className="text-center py-8">
                     <AlertCircle className="h-6 w-6 text-red-500 mx-auto mb-2" />
                    <p className="text-red-500 mb-2">Erro ao carregar tags de lead</p>
                     <p className="text-sm text-muted-foreground mb-4">{tagsError}</p>
                     {retryCount > 0 && (
                       <p className="text-xs text-orange-500 mb-2">
                         Tentativas: {retryCount + 1}
                       </p>
                     )}
                     <Button 
                       variant="outline" 
                       size="sm" 
                       onClick={refreshTags}
                       className="mr-2"
                     >
                       🔄 Tentar novamente
                     </Button>
                     <Button 
                       variant="ghost" 
                       size="sm" 
                       onClick={() => window.location.reload()}
                     >
                       🔄 Recarregar página
                     </Button>
                   </div>
                ) : !Array.isArray(tags) || tags.filter(tag => tag.tipo === 'lead').length === 0 ? (
                  <div className="text-center py-8">
                    <Tag className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Nenhuma tag de lead encontrada</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {currentLeadTags.map((tag) => (
                      <div key={tag.id} className="flex items-center justify-between p-2 border border-cyber-border rounded">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={tag.nome}
                            checked={selectedTags.includes(tag.nome)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedTags([...selectedTags, tag.nome]);
                              } else {
                                setSelectedTags(selectedTags.filter(t => t !== tag.nome));
                              }
                            }}
                          />
                          <Label htmlFor={tag.nome} className="text-sm font-medium">{tag.nome}</Label>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {tag.tipo}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* ✅ NOVO: Campo de exceções individuais com validação OBRIGATÓRIA */}
            <Card className="border-cyber-border opacity-50">
              <CardHeader>
                <CardTitle className="text-cyber-purple flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Exceções Individuais
                </CardTitle>
                <CardDescription>
                  <span className="text-orange-500 font-medium">🚧 DESABILITADO:</span> Funcionalidade estará disponível em breve
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-orange-800 text-sm font-medium mb-2">🚧 Funcionalidade em Desenvolvimento</p>
                    <p className="text-orange-700 text-sm">
                      A funcionalidade de exclusão de contatos individuais estará disponível em breve.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ✅ NOVO: Campo de exceções por tags com PREVENÇÃO DE CONFLITOS */}
            <Card className="border-cyber-border opacity-50">
              <CardHeader>
                <CardTitle className="text-cyber-purple flex items-center">
                  <Tag className="h-5 w-5 mr-2" />
                  Exceções por Tags de Lead
                </CardTitle>
                <CardDescription>
                  <span className="text-orange-500 font-medium">🚧 DESABILITADO:</span> Funcionalidade estará disponível em breve
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-orange-800 text-sm font-medium mb-2">🚧 Funcionalidade em Desenvolvimento</p>
                    <p className="text-orange-700 text-sm">
                      A funcionalidade de exclusão de leads por tags estará disponível em breve.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Exibir mensagem de validação da step 2 */}
            {getValidationMessage() && (
              <Alert className="mt-2">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-destructive">
                  {getValidationMessage()}
                </AlertDescription>
              </Alert>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-foreground mb-2">Contas WhatsApp</h3>
              <p className="text-muted-foreground">Selecione as tags de conta para envio</p>
            </div>

            {/* Seleção de Contas usando Contas Reais + Tags de Conta */}
            <Card className="border-cyber-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-cyber-green flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Contas Selecionadas: {selectedAccounts.length}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={refreshAccounts}
                      disabled={accountsLoading}
                      className="border-cyber-border hover:border-cyber-green text-xs"
                    >
                      {accountsLoading ? '⏳' : '🔄'} Refresh Contas
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={refreshTags}
                      disabled={tagsLoading}
                      className="border-cyber-border hover:border-cyber-green text-xs"
                    >
                      {tagsLoading ? '⏳' : '🔄'} Refresh Tags
                    </Button>

                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Filtros por Tags de Conta */}
                <div className="mb-6 p-4 border border-cyber-border rounded-lg bg-muted/20">
                  <h4 className="text-sm font-medium mb-3 text-cyber-green">Filtros por Tags de Conta:</h4>
                  {tagsLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-4 w-4 animate-spin text-cyber-purple" />
                      <span className="ml-2 text-xs text-muted-foreground">Carregando tags...</span>
                    </div>
                  ) : tagsError ? (
                    <div className="text-center py-4">
                      <p className="text-xs text-red-500 mb-2">Erro ao carregar tags</p>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={refreshTags}
                        className="text-xs h-6"
                      >
                        🔄 Tentar novamente
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(tags) && tags
                        .filter(tag => tag.tipo === 'conta')
                        .map((tag) => (
                          <Badge
                            key={tag.id}
                            variant={selectedAccountTags.includes(tag.nome) ? "default" : "outline"}
                            className={`cursor-pointer text-xs ${
                              selectedAccountTags.includes(tag.nome)
                                ? 'bg-cyber-green text-white'
                                : 'hover:bg-cyber-green/20'
                            }`}
                            onClick={() => {
                              if (selectedAccountTags.includes(tag.nome)) {
                                setSelectedAccountTags(selectedAccountTags.filter(t => t !== tag.nome));
                              } else {
                                setSelectedAccountTags([...selectedAccountTags, tag.nome]);
                              }
                            }}
                          >
                            {tag.nome}
                          </Badge>
                        ))}
                      {Array.isArray(tags) && tags.filter(tag => tag.tipo === 'conta').length === 0 && (
                        <p className="text-xs text-muted-foreground">Nenhuma tag de conta encontrada</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Barra de Busca */}
                <div className="mb-4">
                  <div className="relative">
                    <Input
                      placeholder="Buscar contas por nome, telefone ou status..."
                      className="pl-10 bg-muted/50 border-cyber-border focus:border-cyber-green"
                      value={accountSearchQuery}
                      onChange={(e) => setAccountSearchQuery(e.target.value)}
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                {accountsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-cyber-purple" />
                    <span className="ml-2 text-muted-foreground">
                      Carregando contas...
                    </span>
                  </div>
                ) : accountsError ? (
                  <div className="text-center py-8">
                    <AlertCircle className="h-6 w-6 text-red-500 mx-auto mb-2" />
                    <p className="text-red-500 mb-2">Erro ao carregar contas</p>
                    <p className="text-sm text-muted-foreground mb-4">{accountsError}</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={refreshAccounts}
                      className="mr-2"
                    >
                      🔄 Tentar novamente
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => window.location.reload()}
                    >
                      🔄 Recarregar página
                    </Button>
                  </div>
                ) : !Array.isArray(accounts) || accounts.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Nenhuma conta encontrada</p>
                  </div>
                ) : (
                  <>
                    {/* Tabela de Contas */}
                    <div className="border border-cyber-border rounded-lg overflow-x-auto">
                      <table className="w-full min-w-[1000px]">
                        <thead className="bg-muted/50">
                          <tr>
                            <th className="px-2 py-3 text-left w-12">
                              <Checkbox
                                checked={areAllAccountsSelected}
                                onCheckedChange={toggleAllAccounts}
                                className="data-[state=checked]:bg-cyber-green"
                              />
                            </th>
                            <th className="px-3 py-3 text-left text-sm font-medium w-48">Conta</th>
                            <th className="px-3 py-3 text-left text-sm font-medium w-48">Telefone</th>
                            <th className="px-3 py-3 text-left text-sm font-medium w-32">Status</th>
                            <th className="px-3 py-3 text-left text-sm font-medium w-24">Reputação</th>
                            <th className="px-3 py-3 text-left text-sm font-medium w-32">Tags</th>
                            <th className="px-3 py-3 text-left text-sm font-medium w-24">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-cyber-border">
                          {filteredAccounts
                            .slice((accountPage - 1) * accountsPerPage, accountPage * accountsPerPage)
                            .map((account) => (
                            <tr key={account.id} className="hover:bg-muted/30">
                              <td className="px-2 py-3">
                                <Checkbox
                                  checked={selectedAccounts.includes(String(account.nome_conta))}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setSelectedAccounts([...selectedAccounts, String(account.nome_conta)]);
                                    } else {
                                      setSelectedAccounts(selectedAccounts.filter(t => t !== String(account.nome_conta)));
                                    }
                                  }}
                                  className="data-[state=checked]:bg-cyber-green"
                                />
                              </td>
                              <td className="px-3 py-3">
                                <div className="flex items-center space-x-2">
                                  <div className="w-8 h-8 bg-cyber-green/20 rounded-full flex items-center justify-center">
                                    <span className="text-cyber-green text-sm font-medium">
                                      {String(account.nome_conta).charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium truncate">{String(account.nome_conta)}</p>
                                    <p className="text-xs text-muted-foreground">ID: {account.id}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-3 py-3">
                                <p className="text-sm font-mono truncate max-w-[180px]" title={String(account.telefone)}>
                                  {String(account.telefone)}
                                </p>
                              </td>
                              <td className="px-3 py-3">
                                <Badge 
                                  variant={String(account.status) === 'conectado' ? 'default' : 'destructive'} 
                                  className={`text-xs ${
                                    String(account.status) === 'conectado' 
                                      ? 'bg-cyber-green/20 text-cyber-green border-cyber-green/50'
                                      : 'bg-red-500/20 text-red-500 border-red-500/50'
                                  }`}
                                >
                                  {String(account.status) === 'conectado' ? 'Conectado' : 'Desconectado'}
                                </Badge>
                              </td>
                              <td className="px-3 py-3">
                                <Badge 
                                  variant="secondary" 
                                  className={`text-xs ${
                                    String(account.reputacao) === 'boa' 
                                      ? 'bg-green-500/20 text-green-500 border-green-500/50'
                                      : String(account.reputacao) === 'ruim'
                                      ? 'bg-red-500/20 text-red-500 border-red-500/50'
                                      : 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50'
                                  }`}
                                >
                                  {String(account.reputacao) === 'boa' ? 'Boa' : String(account.reputacao) === 'ruim' ? 'Ruim' : 'Neutra'}
                                </Badge>
                              </td>
                              <td className="px-3 py-3">
                                <div className="flex flex-wrap gap-1 max-w-[120px]">
                                  {Array.isArray(tags) && tags
                                    .filter(tag => tag.tipo === 'conta' && tag.id === account.id_tag)
                                    .map((tag) => (
                                      <Badge key={tag.id} variant="outline" className="text-xs truncate">
                                        {tag.nome}
                                      </Badge>
                                    ))}
                                </div>
                              </td>
                              <td className="px-3 py-3">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    if (selectedAccounts.includes(String(account.nome_conta))) {
                                      setSelectedAccounts(selectedAccounts.filter(t => t !== String(account.nome_conta)));
                                    } else {
                                      setSelectedAccounts([...selectedAccounts, String(account.nome_conta)]);
                                    }
                                  }}
                                  className="text-xs h-7 w-full"
                                >
                                  {selectedAccounts.includes(String(account.nome_conta)) ? 'Remover' : 'Adicionar'}
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Paginação */}
                    <div className="flex items-center justify-between mt-4">
                      <div className="text-sm text-muted-foreground">
                        Mostrando {Math.min((accountPage - 1) * accountsPerPage + 1, filteredAccounts.length)} a {Math.min(accountPage * accountsPerPage, filteredAccounts.length)} de {filteredAccounts.length} contas
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setAccountPage(Math.max(1, accountPage - 1))}
                          disabled={accountPage === 1}
                          className="h-8 w-8 p-0"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm text-muted-foreground">
                          Página {accountPage} de {Math.ceil(filteredAccounts.length / accountsPerPage)}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setAccountPage(Math.min(Math.ceil(filteredAccounts.length / accountsPerPage), accountPage + 1))}
                          disabled={accountPage >= Math.ceil(filteredAccounts.length / accountsPerPage)}
                          className="h-8 w-8 p-0"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Configurações de Envio */}
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

            <SequenceManager 
              sequences={sequences}
              onSequencesChange={setSequences}
              activeSequenceIndex={activeSequenceIndex}
              onActiveSequenceChange={setActiveSequenceIndex}
            />


            {/* ✅ REMOVIDO: Código antigo de sequências duplicado */}
            {/* Agora gerenciado exclusivamente pelo SequenceManager */}


            {/* ✅ REMOVIDO: Avisos de variáveis - funcionalidade desabilitada */}

            {/* Variables Guide */}
            <Card className="border-cyber-border opacity-50">
              <CardHeader>
                <CardTitle className="text-cyber-green">Variáveis de Personalização</CardTitle>
                <CardDescription>
                  <span className="text-orange-500 font-medium">🚧 DESABILITADO:</span> Funcionalidade estará disponível em breve
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-orange-800 text-sm font-medium mb-2">🚧 Funcionalidade em Desenvolvimento</p>
                  <p className="text-orange-700 text-sm">
                    As variáveis de personalização estarão disponíveis em breve.
                  </p>
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

                {/* ✅ REMOVIDO: Exceções individuais - funcionalidade desabilitada */}
                {/* ✅ REMOVIDO: Exceções por tags - funcionalidade desabilitada */}

                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Configurações:</p>
                    <ul className="text-sm space-y-1">
                      <li>• Delay médio: {delayAverage}s (variação: {delayMin}s - {delayMax}s)</li>
                      <li>• Sequências: {sequences.length} ({sequences.map(s => s.name).join(', ')})</li>
                      <li>• Total de itens: {sequences.reduce((total, s) => total + s.items.length, 0)}</li>
                      {/* maxLeads > 0 && <li>• Limite de leads: {maxLeads}</li> */}
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
        return campaignName && schedules.every(s => s.date && s.time);
      case 2:
        return selectedTags.length > 0;
      case 3:
        return selectedAccounts.length > 0;
      case 4:
        return sequences.some(s => s.items.length > 0);
      case 5:
        return true; // Always allow going to save
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