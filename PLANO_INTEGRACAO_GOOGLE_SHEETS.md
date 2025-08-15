# PLANO DE INTEGRAÇÃO COM GOOGLE SHEETS VIA N8N

## 📋 VISÃO GERAL
Este documento define a estratégia para integrar o sistema de disparos WhatsApp com Google Sheets através de workflows n8n, substituindo dados mockados por dados reais das planilhas.

## 🗄️ ESTRUTURA DE TABELAS NECESSÁRIAS

### TABELAS PRINCIPAIS (4)
1. **campanhas** - Configuração das campanhas (com sequências embutidas)
2. **leads** - Contatos/leads
3. **contas_whatsapp** - Contas conectadas
4. **tags** - Tags para leads e contas

## 📊 PLANILHAS GOOGLE SHEETS NECESSÁRIAS

### 1. **Leads** (planilha_leads)
- Colunas: id, nome, telefone, email, ultima_interacao, criado_em, atualizado_em

### 2. **Contas WhatsApp** (planilha_contas_whatsapp)
- Colunas: id, nome_conta, telefone, status, reputacao, criado_em, atualizado_em

### 3. **Tags** (planilha_tags)
- Colunas: id, nome, tipo, criado_em, atualizado_em

### 4. **Campanhas** (planilha_campanhas)
- Colunas: id, nome_da_campanha, data, horario, tags, limite_de_leads, excecoes, contas_selecionadas, delay, configuracao_sequencia, criado_em, atualizado_em

## 🔄 ENDPOINTS N8N NECESSÁRIOS

### LEADS
- **GET** - `[ENDPOINT_LEADS_TODOS]` - Ler todos os leads
- **POST** - `[ENDPOINT_LEADS_CRIAR]` - Criar novo lead

### CONTAS WHATSAPP
- **GET** - `[ENDPOINT_CONTAS_TODAS]` - Ler todas as contas
- **POST** - `[ENDPOINT_CONTAS_CRIAR]` - Criar nova conta

### TAGS
- **GET** - `https://automatewebhook.techfala.com.br/webhook/ler_todas_as_tags_contas_whatsapp` - Ler todas as tags
- **POST** - `https://automatewebhook.techfala.com.br/webhook/cadastrar_tags_contas_whatsapp` - Cadastrar nova tag

### CAMPANHAS
- **GET** - `[ENDPOINT_CAMPANHAS_TODAS]` - Ler todas as campanhas
- **POST** - `[ENDPOINT_CAMPANHAS_CRIAR]` - Criar nova campanha

## 📝 ORDEM DE IMPLEMENTAÇÃO

### FASE 1: ESTRUTURA BASE (Semana 1)
1. **Criar planilhas Google Sheets** para leads, contas e tags
2. **Configurar workflows n8n** para endpoints básicos (GET)
3. **Implementar endpoints de leitura** para leads, contas e tags
4. **Testar integração** com dados de exemplo

### FASE 2: CAMPANHAS (Semana 2)
1. **Criar planilha de campanhas** com estrutura JSON
2. **Implementar endpoints de campanhas** (GET e POST)
3. **Testar criação e leitura** de campanhas
4. **Validar estrutura JSON** das sequências

## 🔧 CONFIGURAÇÃO N8N

### Workflow Base para Cada Entidade
1. **Trigger HTTP** - Recebe requisições
2. **Google Sheets** - Lê/escreve dados
3. **Transformação** - Formata dados (se necessário)
4. **Resposta HTTP** - Retorna resultado

### Variáveis de Ambiente Necessárias
- `GOOGLE_SHEETS_API_KEY`
- `GOOGLE_SHEETS_SPREADSHEET_ID`
- `N8N_WEBHOOK_URL`
- `N8N_SECRET_KEY`

### Estrutura de Resposta Padrão
```json
{
  "success": true,
  "data": [...],
  "message": "Operação realizada com sucesso",
  "timestamp": "2024-01-01T00:00:00Z",
  "total": 0
}
```

## 📊 MÉTRICAS E MONITORAMENTO

### KPIs a Acompanhar
- **Tempo de resposta** dos endpoints
- **Taxa de sucesso** das operações
- **Volume de dados** processados
- **Erros e falhas** de integração

### Logs Necessários
- Todas as requisições recebidas
- Operações realizadas no Google Sheets
- Erros e exceções
- Performance e tempo de resposta

## 🚀 PRÓXIMOS PASSOS

1. **Revisar este documento** e validar com a equipe
2. **Criar planilhas Google Sheets** com estrutura definida
3. **Configurar n8n** com workflows básicos
4. **Implementar endpoints** seguindo a ordem definida
5. **Testar integração** com dados reais
6. **Substituir dados mockados** pelos endpoints reais

---

**Documento criado em:** [DATA]
**Versão:** 1.0
**Status:** Aguardando implementação
**Responsável:** [NOME]
