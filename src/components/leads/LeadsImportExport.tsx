import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ImportExportProps {
  totalLeads: number;
  onImport: (leads: any[]) => void;
  onExport: () => void;
}

export const LeadsImportExport = ({ totalLeads, onImport, onExport }: ImportExportProps) => {
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [exportProgress, setExportProgress] = useState(0);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv') && !file.name.endsWith('.xlsx')) {
      toast({
        title: "Formato inválido",
        description: "Por favor, selecione um arquivo CSV ou Excel (.xlsx)",
        variant: "destructive"
      });
      return;
    }

    setIsImporting(true);
    setImportProgress(0);

    // Simular processamento de arquivo grande
    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      
      try {
        // Simular processamento em lotes para arquivos grandes
        const lines = content.split('\n').filter(line => line.trim());
        const batchSize = 1000;
        const totalBatches = Math.ceil(lines.length / batchSize);
        const processedLeads: any[] = [];

        for (let i = 0; i < totalBatches; i++) {
          const batch = lines.slice(i * batchSize, (i + 1) * batchSize);
          
          // Processar lote
          batch.forEach((line, index) => {
            if (i === 0 && index === 0) return; // Skip header
            
            const [name, phone, tags] = line.split(',');
            if (name && phone) {
              processedLeads.push({
                id: `imported_${Date.now()}_${i}_${index}`,
                name: name.trim(),
                phone: phone.trim(),
                tags: tags ? tags.split(';').map(t => t.trim()) : [],
                whatsappInteractions: [],
                status: 'active'
              });
            }
          });

          // Atualizar progresso
          setImportProgress(((i + 1) / totalBatches) * 100);
          
          // Simular delay para processamento
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        onImport(processedLeads);
        setShowImportDialog(false);
        
        toast({
          title: "Importação concluída!",
          description: `${processedLeads.length} contatos importados com sucesso`,
        });
      } catch (error) {
        toast({
          title: "Erro na importação",
          description: "Falha ao processar o arquivo. Verifique o formato.",
          variant: "destructive"
        });
      } finally {
        setIsImporting(false);
        setImportProgress(0);
      }
    };

    reader.readAsText(file);
  };

  const handleExport = async () => {
    setIsExporting(true);
    setExportProgress(0);

    try {
      // Simular geração de arquivo grande
      const totalSteps = 10;
      
      for (let i = 0; i < totalSteps; i++) {
        // Simular processamento
        await new Promise(resolve => setTimeout(resolve, 300));
        setExportProgress(((i + 1) / totalSteps) * 100);
      }

      // Gerar CSV
      const csvContent = `Nome,Telefone,Tags,Status,Última Interação\n` +
        `João Silva,+55 11 99999-1234,"cliente;premium",active,2024-01-15\n` +
        `Maria Santos,+55 11 98888-5678,"lead;interessado",active,2024-01-14\n` +
        `Carlos Oliveira,+55 11 97777-9012,cliente,inactive,2024-01-13`;

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `leads_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setShowExportDialog(false);
      onExport();
      
      toast({
        title: "Exportação concluída!",
        description: `${totalLeads} contatos exportados com sucesso`,
      });
    } catch (error) {
      toast({
        title: "Erro na exportação",
        description: "Falha ao gerar arquivo de exportação",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  return (
    <div className="flex gap-4">
      {/* Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Importar
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-cyber-green" />
              Importar Contatos
            </DialogTitle>
            <DialogDescription>
              Selecione um arquivo CSV ou Excel com os contatos para importar
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Card className="bg-muted/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-cyber-blue" />
                  Formato Esperado
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs space-y-2">
                <p><strong>CSV:</strong> Nome,Telefone,Tags</p>
                <p><strong>Exemplo:</strong> João Silva,+55 11 99999-1234,cliente;premium</p>
                <p><strong>Tags:</strong> Separe múltiplas tags com ponto e vírgula (;)</p>
              </CardContent>
            </Card>

            {isImporting ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-cyber-green border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm">Processando arquivo...</span>
                </div>
                <Progress value={importProgress} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {importProgress.toFixed(0)}% concluído
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                  variant="outline"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Selecionar Arquivo
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-cyber-blue" />
              Exportar Contatos
            </DialogTitle>
            <DialogDescription>
              Baixar todos os contatos em formato CSV
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Card className="bg-muted/30">
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="h-8 w-8 text-cyber-green" />
                  <div>
                    <p className="font-medium">
                      {new Intl.NumberFormat('pt-BR').format(totalLeads)} contatos
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Formato CSV com todas as informações
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {isExporting ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-cyber-blue border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm">Gerando arquivo...</span>
                </div>
                <Progress value={exportProgress} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {exportProgress.toFixed(0)}% concluído
                </p>
              </div>
            ) : (
              <Button onClick={handleExport} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Exportar CSV
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};