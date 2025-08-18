import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  Edit, 
  FileText, 
  Image, 
  Video, 
  File, 
  Mic, 
  Upload,
  Volume2,
  Play,
  StopCircle,
  AlertTriangle
} from 'lucide-react';
import { MediaSequence, MediaItem } from './MediaSequenceManager';

interface SequenceManagerProps {
  sequences: MediaSequence[];
  onSequencesChange: (sequences: MediaSequence[]) => void;
  activeSequenceIndex: number;
  onActiveSequenceChange: (index: number) => void;
}

export const SequenceManager: React.FC<SequenceManagerProps> = ({
  sequences,
  onSequencesChange,
  activeSequenceIndex,
  onActiveSequenceChange
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordingTimer, setRecordingTimer] = useState<NodeJS.Timeout | null>(null);

  // ✅ NOVO: Função para converter arquivo para Base64 - ROBUSTA
  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      console.log('🔄 Iniciando conversão Base64 para arquivo:', file.name);
      
      // ✅ NOVO: Validar tamanho do arquivo (máximo 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        reject(new Error(`Arquivo muito grande: ${(file.size / 1024 / 1024).toFixed(2)}MB. Máximo: 10MB`));
        return;
      }
      
      const reader = new FileReader();
      
      reader.onload = () => {
        try {
          const result = reader.result as string;
          console.log('📄 Resultado do FileReader:', {
            tipo: typeof result,
            tamanho: result.length,
            inicio: result.substring(0, 100)
          });
          
          // ✅ NOVO: Extrair apenas a parte Base64 (remover data:image/...;base64,)
          if (result.includes('base64,')) {
            const base64 = result.split('base64,')[1];
            console.log('✅ Base64 extraído com sucesso:', {
              tamanho: base64.length,
              preview: base64.substring(0, 50) + '...'
            });
            resolve(base64);
          } else {
            reject(new Error('Formato de resultado não contém Base64 válido'));
          }
        } catch (error) {
          reject(new Error(`Erro ao processar resultado: ${error}`));
        }
      };
      
      reader.onerror = (error) => {
        console.error('❌ Erro no FileReader:', error);
        reject(new Error(`Erro na leitura do arquivo: ${error}`));
      };
      
      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100;
          console.log(`📊 Progresso da conversão: ${progress.toFixed(1)}%`);
        }
      };
      
      // ✅ NOVO: Usar readAsDataURL para melhor compatibilidade
      console.log('🔄 Lendo arquivo como Data URL...');
      reader.readAsDataURL(file);
    });
  };

  // ✅ NOVO: Função para adicionar item na sequência ativa com Base64
  const addMediaItem = async (type: MediaItem['type'], content: string, file?: File, audioBlob?: Blob) => {
    if (activeSequenceIndex < 0 || activeSequenceIndex >= sequences.length) return;

    let base64Content: string | undefined;
    let fileName: string | undefined;
    let fileSize: number | undefined;

    // ✅ NOVO: Converter arquivo para Base64 se for mídia
    if (file && ['image', 'video', 'audio', 'file'].includes(type)) {
      try {
        console.log('🔄 Convertendo arquivo para Base64:', {
          nome: file.name,
          tipo: file.type,
          tamanho: file.size,
          ultimaModificacao: file.lastModified
        });
        
        base64Content = await convertFileToBase64(file);
        fileName = file.name;
        fileSize = file.size;
        
        console.log('✅ Arquivo convertido para Base64 com sucesso:', {
          nome: fileName,
          tipo: file.type,
          tamanho: fileSize,
          base64Length: base64Content.length,
          base64Preview: base64Content.substring(0, 50) + '...'
        });
        
        // ✅ NOVO: Validar se o Base64 é válido
        if (!base64Content || base64Content.length < 100) {
          throw new Error('Base64 gerado é muito pequeno ou inválido');
        }
        
      } catch (error) {
        console.error('❌ Erro ao converter arquivo para Base64:', error);
        console.error('📁 Detalhes do arquivo:', {
          nome: file.name,
          tipo: file.type,
          tamanho: file.size
        });
        
        // Fallback: usar nome do arquivo se falhar a conversão
        base64Content = undefined;
        fileName = file.name;
        fileSize = file.size;
      }
    }

    // ✅ NOVO: Para áudio gravado, converter Blob para Base64
    if (audioBlob && type === 'recorded_audio') {
      try {
        console.log('🔄 Convertendo áudio gravado para Base64');
        const arrayBuffer = await audioBlob.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        const base64String = btoa(String.fromCharCode(...uint8Array));
        base64Content = base64String;
        fileName = `Áudio gravado (${recordingDuration}s)`;
        fileSize = audioBlob.size;
        console.log('✅ Áudio gravado convertido para Base64');
      } catch (error) {
        console.error('❌ Erro ao converter áudio gravado para Base64:', error);
      }
    }

    const newItem: MediaItem = {
      id: Date.now().toString(),
      type,
      content,
      order: sequences[activeSequenceIndex].items.length + 1,
      file,
      audioBlob,
      base64: base64Content, // ✅ NOVO: Conteúdo Base64
      fileName, // ✅ NOVO: Nome do arquivo
      fileSize, // ✅ NOVO: Tamanho do arquivo
      variables: [] // ✅ REMOVIDO: Variáveis desabilitadas por enquanto
    };

    const updatedSequences = [...sequences];
    updatedSequences[activeSequenceIndex].items.push(newItem);
    onSequencesChange(updatedSequences);

    // Limpar campos específicos
    if (type === 'text') {
      const textarea = document.querySelector(`#sequence-${activeSequenceIndex}-text`) as HTMLTextAreaElement;
      if (textarea) textarea.value = '';
    }
    if (type === 'recorded_audio') {
      setAudioBlob(null);
      setRecordingDuration(0);
    }

    // Limpar inputs de arquivo
    const fileInputs = document.querySelectorAll(`input[type="file"]`);
    fileInputs.forEach(input => {
      if (input instanceof HTMLInputElement) input.value = '';
    });
  };

  // Função para remover item da sequência ativa
  const removeMediaItem = (itemId: string) => {
    if (activeSequenceIndex < 0 || activeSequenceIndex >= sequences.length) return;

    const updatedSequences = [...sequences];
    updatedSequences[activeSequenceIndex].items = updatedSequences[activeSequenceIndex].items.filter(
      item => item.id !== itemId
    );
    
    // Reordenar itens
    updatedSequences[activeSequenceIndex].items.forEach((item, index) => {
      item.order = index + 1;
    });
    
    onSequencesChange(updatedSequences);
  };

  // Função para mover item na sequência
  const moveMediaItem = (itemId: string, direction: 'up' | 'down') => {
    if (activeSequenceIndex < 0 || activeSequenceIndex >= sequences.length) return;

    const updatedSequences = [...sequences];
    const currentSequence = updatedSequences[activeSequenceIndex];
    const itemIndex = currentSequence.items.findIndex(item => item.id === itemId);
    
    if (itemIndex === -1) return;
    
    if (direction === 'up' && itemIndex > 0) {
      [currentSequence.items[itemIndex], currentSequence.items[itemIndex - 1]] = 
      [currentSequence.items[itemIndex - 1], currentSequence.items[itemIndex]];
    } else if (direction === 'down' && itemIndex < currentSequence.items.length - 1) {
      [currentSequence.items[itemIndex], currentSequence.items[itemIndex + 1]] = 
      [currentSequence.items[itemIndex + 1], currentSequence.items[itemIndex]];
    }
    
    // Reordenar
    currentSequence.items.forEach((item, index) => {
      item.order = index + 1;
    });
    
    onSequencesChange(updatedSequences);
  };

  // Função para editar item
  const editMediaItem = (itemId: string) => {
    // Implementar edição inline ou modal
    console.log('Editar item:', itemId);
  };

  // Função para adicionar nova sequência
  const addSequence = () => {
    const newSequence: MediaSequence = {
      id: Date.now().toString(),
      name: `Sequência ${sequences.length + 1}`,
      items: []
    };
    onSequencesChange([...sequences, newSequence]);
    onActiveSequenceChange(sequences.length); // Ativar nova sequência
  };

  // Função para remover sequência
  const removeSequence = (index: number) => {
    if (sequences.length <= 1) return;
    
    const updatedSequences = sequences.filter((_, i) => i !== index);
    onSequencesChange(updatedSequences);
    
    // Ajustar índice ativo se necessário
    if (activeSequenceIndex >= updatedSequences.length) {
      onActiveSequenceChange(updatedSequences.length - 1);
    } else if (activeSequenceIndex > index) {
      onActiveSequenceChange(activeSequenceIndex - 1);
    }
  };

  // Função para gravar áudio
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setAudioBlob(event.data);
        }
      };
      
      recorder.start();
      setIsRecording(true);
      setMediaRecorder(recorder);
      
      // Timer para duração
      let duration = 0;
      const timer = setInterval(() => {
        duration++;
        setRecordingDuration(duration);
        if (duration >= 30) { // Limite de 30 segundos
          stopRecording();
        }
      }, 1000);
      setRecordingTimer(timer);
      
    } catch (error) {
      console.error('Erro ao iniciar gravação:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
    
    if (recordingTimer) {
      clearInterval(recordingTimer);
      setRecordingTimer(null);
    }
  };

  // Limpar gravação ao desmontar
  useEffect(() => {
    return () => {
      if (recordingTimer) {
        clearInterval(recordingTimer);
      }
    };
  }, [recordingTimer]);

  if (sequences.length === 0) {
    return (
      <Card className="border-cyber-border">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground mb-4">Nenhuma sequência criada</p>
          <Button onClick={addSequence} className="bg-cyber-green hover:bg-cyber-green/90">
            <Plus className="h-4 w-4 mr-2" />
            Criar Primeira Sequência
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tabs das Sequências - Movido para o lado direito e separado do formulário */}
      <div className="flex justify-end mb-6">
        <Tabs value={activeSequenceIndex.toString()} onValueChange={(value) => onActiveSequenceChange(parseInt(value))}>
          <TabsList className="grid w-auto grid-cols-auto">
            {sequences.map((sequence, index) => (
              <TabsTrigger 
                key={sequence.id} 
                value={index.toString()}
                className="flex items-center gap-2"
              >
                {sequence.name}
                <Badge variant="secondary" className="text-xs">
                  {sequence.items.length}
                </Badge>
              </TabsTrigger>
            ))}
            <Button
              onClick={addSequence}
              variant="outline"
              size="sm"
              className="ml-2"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </TabsList>
        </Tabs>
      </div>

      {/* Conteúdo das Sequências */}
      <Tabs value={activeSequenceIndex.toString()} onValueChange={(value) => onActiveSequenceChange(parseInt(value))}>
        {sequences.map((sequence, index) => (
          <TabsContent key={sequence.id} value={index.toString()} className="space-y-4">
            {/* Configurações da Sequência */}
            <Card className="border-cyber-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-cyber-green">Configurações da Sequência</CardTitle>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">
                    Total de itens: {sequence.items.length}
                  </span>
                  {sequences.length > 1 && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeSequence(index)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remover
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Nome da Sequência</label>
                    <Input
                      value={sequence.name}
                      onChange={(e) => {
                        const updatedSequences = [...sequences];
                        updatedSequences[index].name = e.target.value;
                        onSequencesChange(updatedSequences);
                      }}
                      className="mt-1 bg-muted/50 border-cyber-border focus:border-cyber-green"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Itens da Sequência */}
            <Card className="border-cyber-border">
              <CardHeader>
                <CardTitle className="text-cyber-green">Itens da Sequência</CardTitle>
              </CardHeader>
              <CardContent>
                {sequence.items.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertTriangle className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
                    <p className="text-yellow-600">Sequência vazia! Adicione pelo menos um item antes de salvar a campanha.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sequence.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 border border-cyber-border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="text-xs">
                            {item.order}
                          </Badge>
                          <Badge className={`text-xs ${getTypeColor(item.type)}`}>
                            {getTypeIcon(item.type)}
                            {item.type === 'text' ? 'Texto' : 
                             item.type === 'image' ? 'Imagem' : 
                             item.type === 'file' ? 'Documento' : 
                             item.type === 'audio' ? 'Áudio' : 
                             item.type === 'recorded_audio' ? 'Áudio Gravado' : item.type}
                          </Badge>
                          <span className="text-sm text-muted-foreground max-w-xs truncate">
                            {item.content}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveMediaItem(item.id, 'up')}
                            disabled={item.order === 1}
                          >
                            <ChevronUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveMediaItem(item.id, 'down')}
                            disabled={item.order === sequence.items.length}
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => editMediaItem(item.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeMediaItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Adicionar Itens - SÓ APARECE NA SEQUÊNCIA ATIVA */}
            {index === activeSequenceIndex && (
              <Card className="border-cyber-border">
                <CardHeader>
                  <CardTitle className="text-cyber-green">Adicionar Item</CardTitle>
                </CardHeader>
                <CardContent>
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
                      <div>
                        <label className="text-sm font-medium">Mensagem de Texto</label>
                        <Textarea
                          id={`sequence-${index}-text`}
                          placeholder="Digite sua mensagem aqui..."
                          className="mt-1 bg-muted/50 border-cyber-border focus:border-cyber-green min-h-[100px]"
                        />
                        <Button
                          type="button"
                          className="mt-3"
                          onClick={async () => {
                            const textarea = document.querySelector(`#sequence-${index}-text`) as HTMLTextAreaElement;
                            if (textarea?.value) {
                              await addMediaItem('text', textarea.value);
                            }
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Adicionar Texto
                        </Button>
                      </div>
                    </TabsContent>

                    <TabsContent value="image" className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Upload de Imagem</label>
                        <Input
                          type="file"
                          accept="image/*"
                          className="mt-1 bg-muted/50 border-cyber-border"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              console.log('🖼️ Arquivo de imagem selecionado:', {
                                nome: file.name,
                                tipo: file.type,
                                tamanho: file.size
                              });
                              await addMediaItem('image', file.name, file);
                            }
                          }}
                        />
                        {/* ✅ NOVO: Botão de teste para verificar Base64 */}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => {
                            console.log('🧪 Testando conversão Base64...');
                            console.log('📊 Estado atual das sequências:', sequences);
                            sequences.forEach((sequence, seqIndex) => {
                              console.log(`📋 Sequência ${seqIndex + 1}: ${sequence.name}`);
                              sequence.items.forEach((item, itemIndex) => {
                                console.log(`  Item ${itemIndex + 1}:`, {
                                  tipo: item.type,
                                  content: item.content,
                                  base64: item.base64 ? `✅ ${item.base64.length} chars` : '❌ Não convertido',
                                  fileName: item.fileName,
                                  fileSize: item.fileSize,
                                  // ✅ NOVO: Verificação detalhada do Base64
                                  base64Valido: item.base64 ? (item.base64.length > 100 ? '✅ Válido' : '⚠️ Muito pequeno') : '❌ Ausente',
                                  base64Preview: item.base64 ? item.base64.substring(0, 50) + '...' : 'N/A'
                                });
                              });
                            });
                            
                            // ✅ NOVO: Estatísticas de conversão
                            const totalItems = sequences.reduce((total, seq) => total + seq.items.length, 0);
                            const itemsComBase64 = sequences.reduce((total, seq) => 
                              total + seq.items.filter(item => item.base64 && item.base64.length > 100).length, 0
                            );
                            const itemsSemBase64 = totalItems - itemsComBase64;
                            
                            console.log('📊 Estatísticas de conversão Base64:', {
                              total: totalItems,
                              comBase64: itemsComBase64,
                              semBase64: itemsSemBase64,
                              percentual: totalItems > 0 ? `${((itemsComBase64 / totalItems) * 100).toFixed(1)}%` : '0%'
                            });
                          }}
                        >
                          🧪 Verificar Base64
                        </Button>
                      </div>
                    </TabsContent>

                    <TabsContent value="file" className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Upload de Documento</label>
                        <Input
                          type="file"
                          accept=".pdf,.doc,.docx,.txt"
                          className="mt-1 bg-muted/50 border-cyber-border"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              await addMediaItem('file', file.name, file);
                            }
                          }}
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="audio" className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Upload de Áudio</label>
                        <Input
                          type="file"
                          accept="audio/*"
                          className="mt-1 bg-muted/50 border-cyber-border"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              await addMediaItem('audio', file.name, file);
                            }
                          }}
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="record" className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Gravação de Áudio</label>
                        <div className="space-y-4">
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
                          </div>
                          
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
                                onClick={async () => {
                                  await addMediaItem('recorded_audio', `Áudio gravado (${recordingDuration}s)`, undefined, audioBlob);
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
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

// Funções auxiliares
const getTypeIcon = (type: string) => {
  switch (type) {
    case 'text': return <FileText className="h-4 w-4" />;
    case 'image': return <Image className="h-4 w-4" />;
    case 'video': return <Video className="h-4 w-4" />;
    case 'audio': return <Mic className="h-4 w-4" />;
    case 'file': return <File className="h-4 w-4" />;
    case 'recorded_audio': return <Volume2 className="h-4 w-4" />;
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
    case 'recorded_audio': return 'bg-red-500/20 text-red-700 border-red-500/50';
    default: return 'bg-gray-500/20 text-gray-700 border-gray-500/50';
  }
};
