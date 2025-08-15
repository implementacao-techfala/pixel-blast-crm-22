# EXEMPLOS DE WORKFLOWS N8N PARA INTEGRAÇÃO

## 🔄 WORKFLOW BASE PARA TODOS OS ENDPOINTS

### Estrutura Padrão
```
HTTP Trigger → Google Sheets → Transformação → HTTP Response
```

## 📊 EXEMPLO 1: ENDPOINT PARA LER TODAS AS TAGS DE CONTAS

### Configuração do HTTP Trigger
- **Método:** GET
- **Path:** `https://automatewebhook.techfala.com.br/webhook/ler_todas_as_tags_contas_whatsapp`
- **Authentication:** Basic Auth (se necessário)

### Configuração da Transformação
```javascript
// Filtrar apenas tags de contas
const tagsContas = $input.all().filter(item => 
  item.json.tipo === 'conta'
);

// Formatar resposta
return {
  success: true,
  data: tagsContas,
  message: "Tags de contas WhatsApp carregadas com sucesso",
  timestamp: new Date().toISOString(),
  total: tagsContas.length
};
```

### Configuração da Transformação
```javascript
// Filtrar apenas tags de contas ativas
const tagsContas = $input.all().filter(item => 
  item.json.tipo === 'conta' && item.json.ativo === true
);

// Formatar resposta
return {
  success: true,
  data: tagsContas,
  message: "Tags de contas WhatsApp carregadas com sucesso",
  timestamp: new Date().toISOString(),
  total: tagsContas.length
};
```

### Configuração da HTTP Response
- **Response Code:** 200
- **Response Body:** `{{ $json }}`

## 📊 EXEMPLO 2: ENDPOINT PARA LER TODOS OS LEADS

### Configuração do HTTP Trigger
- **Método:** GET
- **Path:** `https://automatewebhook.techfala.com.br/webhook/ler_todos_leads`
- **Query Parameters:** 
  - `status` (opcional)
  - `cidade` (opcional)
  - `empresa` (opcional)

### Configuração da Transformação
```javascript
// Obter parâmetros de filtro
const status = $('query').status;
const cidade = $('query').cidade;
const empresa = $('query').empresa;

// Filtrar leads baseado nos parâmetros
let leads = $input.all();

if (status) {
  leads = leads.filter(lead => lead.json.status === status);
}

if (cidade) {
  leads = leads.filter(lead => 
    lead.json.cidade.toLowerCase().includes(cidade.toLowerCase())
  );
}

if (empresa) {
  leads = leads.filter(lead => 
    lead.json.empresa.toLowerCase().includes(empresa.toLowerCase())
  );
}

// Formatar resposta
return {
  success: true,
  data: leads,
  message: "Leads carregados com sucesso",
  timestamp: new Date().toISOString(),
  total: leads.length,
  filters: { status, cidade, empresa }
};
```

## 📊 EXEMPLO 3: ENDPOINT PARA CRIAR NOVA TAG

### Configuração do HTTP Trigger
- **Método:** POST
- **Path:** `https://automatewebhook.techfala.com.br/webhook/cadastrar_tags_contas_whatsapp`
- **Body:** JSON com dados da tag

### Configuração da Transformação (Validação)
```javascript
// Validar dados recebidos
const { nome, descricao, tipo, cor } = $input.first().json;

if (!nome || !tipo) {
  throw new Error('Nome e tipo são obrigatórios');
}

if (!['lead', 'conta', 'campanha'].includes(tipo)) {
  throw new Error('Tipo deve ser: lead, conta ou campanha');
}

// Gerar ID único
const id = Date.now().toString();

// Formatar dados para inserção
return {
  id,
  nome,
  descricao: descricao || '',
  tipo,
  cor: cor || '#3B82F6',
  ativo: true,
  criado_em: new Date().toISOString(),
  atualizado_em: new Date().toISOString()
};
```

### Configuração da HTTP Response
- **Response Code:** 201
- **Response Body:** `{{ $json }}`

### Configuração da HTTP Response
```javascript
// Resposta de sucesso
return {
  success: true,
  data: $input.first().json,
  message: "Tag criada com sucesso",
  timestamp: new Date().toISOString()
};
```

## 📊 EXEMPLO 4: ENDPOINT PARA ATUALIZAR CONTA WHATSAPP

### Configuração do HTTP Trigger
- **Método:** PUT
- **Path:** `https://automatewebhook.techfala.com.br/webhook/atualizar_conta_whatsapp/:id`
- **Body:** JSON com dados para atualizar

### Configuração da Transformação
```javascript
// Obter ID da URL
const id = $('params').id;

// Obter dados para atualizar
const dadosAtualizacao = $input.first().json;

// Formatar dados para atualização
return {
  id,
  ...dadosAtualizacao,
  atualizado_em: new Date().toISOString()
};
```

## 📊 EXEMPLO 5: ENDPOINT PARA LER DISPAROS POR CAMPANHA

### Configuração do HTTP Trigger
- **Método:** GET
- **Path:** `https://automatewebhook.techfala.com.br/webhook/ler_disparos_por_campanha/:campanha_id`
- **Query Parameters:**
  - `status` (opcional)
  - `data_inicio` (opcional)
  - `data_fim` (opcional)

### Configuração da Transformação
```javascript
// Obter parâmetros
const campanhaId = $('params').campanha_id;
const status = $('query').status;
const dataInicio = $('query').data_inicio;
const dataFim = $('query').data_fim;

// Filtrar disparos da campanha
let disparos = $input.all().filter(disparo => 
  disparo.json.campanha_id === campanhaId
);

// Filtros adicionais
if (status) {
  disparos = disparos.filter(disparo => disparo.json.status === status);
}

if (dataInicio) {
  disparos = disparos.filter(disparo => 
    disparo.json.data_envio >= dataInicio
  );
}

if (dataFim) {
  disparos = disparos.filter(disparo => 
    disparo.json.data_envio <= dataFim
  );
}

// Calcular estatísticas
const total = disparos.length;
const enviados = disparos.filter(d => d.json.status === 'sent').length;
const entregues = disparos.filter(d => d.json.status === 'delivered').length;
const lidos = disparos.filter(d => d.json.status === 'read').length;
const falharam = disparos.filter(d => d.json.status === 'failed').length;

return {
  success: true,
  data: disparos,
  message: "Disparos da campanha carregados com sucesso",
  timestamp: new Date().toISOString(),
  total,
  estatisticas: {
    enviados,
    entregues,
    lidos,
    falharam,
    taxa_entrega: total > 0 ? (entregues / total * 100).toFixed(2) : 0,
    taxa_leitura: total > 0 ? (lidos / total * 100).toFixed(2) : 0
  }
};
```

## 🔧 CONFIGURAÇÕES GLOBAIS N8N

### Variáveis de Ambiente
```bash
# Google Sheets
GOOGLE_SHEETS_API_KEY=sua_api_key_aqui
GOOGLE_SHEETS_SPREADSHEET_ID=id_da_planilha_principal

# N8N
N8N_WEBHOOK_URL=https://seu-dominio.com/webhook
N8N_SECRET_KEY=chave_secreta_para_autenticacao

# URLs dos Endpoints
ENDPOINT_LEADS_TODOS=https://automatewebhook.techfala.com.br/webhook/ler_todos_leads
ENDPOINT_CONTAS_TODAS=https://automatewebhook.techfala.com.br/webhook/ler_todas_contas
ENDPOINT_TAGS_TODAS=https://automatewebhook.techfala.com.br/webhook/ler_todas_as_tags_contas_whatsapp
ENDPOINT_TAGS_CRIAR=https://automatewebhook.techfala.com.br/webhook/cadastrar_tags_contas_whatsapp
```

### Estrutura de Planilhas Google Sheets

#### Planilha: `planilha_tags`
| id | nome | tipo | criado_em | atualizado_em |
|----|------|------|-----------|---------------|
| 1 | tag_exemplo1 | lead | 2025-08-1509:41:000-03:00 | 2025-08-1509:41:000-03:05 |
| 2 | tag_exemplo2 | conta | 2025-08-1509:41:000-03:01 | 2025-08-1509:41:000-03:06 |
| 3 | tag_exemplo3 | campanha | 2025-08-1509:41:000-03:02 | 2025-08-1509:41:000-03:07 |
| 4 | tag_exemplo4 | lead | 2025-08-1509:41:000-03:03 | 2025-08-1509:41:000-03:08 |
| 5 | tag_exemplo5 | conta | 2025-08-1509:41:000-03:04 | 2025-08-1509:41:000-03:09 |
| 6 | tag_exemplo6 | campanha | 2025-08-1509:41:000-03:05 | 2025-08-1509:41:000-03:10 |

#### Planilha: `planilha_leads`
| id | nome | telefone | email | ultima_interacao | criado_em | atualizado_em |
|----|------|----------|-------|------------------|-----------|---------------|
| 1 | João Silva | +5511666666666 | joao@empresa.com | 2024-01-01 | 2024-01-01 | 2024-01-01 |
| 2 | Maria Santos | +5511555555555 | maria@empresa.com | 2024-01-01 | 2024-01-01 | 2024-01-01 |

#### Planilha: `planilha_contas_whatsapp`
| id | nome_conta | telefone | status | reputacao | criado_em | atualizado_em |
|----|------------|----------|--------|-----------|-----------|---------------|
| 1 | Conta Principal | +5511999999999 | connected | excellent | 2024-01-01 | 2024-01-01 |
| 2 | Suporte | +5511888888888 | connected | good | 2024-01-01 | 2024-01-01 |

#### Planilha: `planilha_campanhas`
| id | nome_da_campanha | data | horario | tags | limite_de_leads | excecoes | contas_selecionadas | delay | configuracao_sequencia | criado_em | atualizado_em |
|----|------------------|------|---------|------|-----------------|----------|---------------------|-------|------------------------|-----------|---------------|
| 1 | Campanha Vendas | 2025-08-15 | 09:00 | ["tag_exemplo1", "tag_exemplo4"] | 100 | ["+5511999999999"] | ["id_conta1", "id_conta2"] | 120 | {"sequencia_opcao1": {"text": "Olá {{nome}}", "image": "produto.jpg"}} | 2025-08-15 | 2025-08-15 |

## 📝 CHECKLIST DE IMPLEMENTAÇÃO

### Fase 1: Configuração Base
- [ ] Criar planilhas Google Sheets para leads, contas e tags
- [ ] Configurar autenticação Google Sheets no n8n
- [ ] Criar workflows básicos para endpoints GET
- [ ] Testar leitura de dados das planilhas

### Fase 2: Campanhas
- [ ] Criar planilha de campanhas com estrutura JSON
- [ ] Implementar endpoints de campanhas (GET e POST)
- [ ] Testar criação e leitura de campanhas
- [ ] Validar estrutura JSON das sequências

## 🚨 TRATAMENTO DE ERROS

### Estrutura de Erro Padrão
```javascript
// Capturar erros e retornar resposta padronizada
try {
  // Lógica do endpoint
} catch (error) {
  return {
    success: false,
    error: error.message,
    timestamp: new Date().toISOString(),
    details: process.env.NODE_ENV === 'development' ? error.stack : undefined
  };
}
```

### Códigos de Status HTTP
- **200:** Sucesso
- **201:** Criado com sucesso
- **400:** Erro de validação
- **404:** Recurso não encontrado
- **500:** Erro interno do servidor

---

**Documento criado em:** [DATA]
**Versão:** 1.0
**Status:** Aguardando implementação
**Responsável:** [NOME]
