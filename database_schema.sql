-- =====================================================
-- SCHEMA COMPLETO DO SISTEMA DE DISPAROS WHATSAPP
-- =====================================================
-- Baseado na análise crítica do código e entidades
-- Total: 12 tabelas (8 principais + 4 relacionamento)
-- =====================================================

-- =====================================================
-- 1. TABELA PRINCIPAL: CAMPANHAS
-- =====================================================
CREATE TABLE campanhas (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    status ENUM('draft', 'scheduled', 'active', 'paused', 'completed', 'cancelled') DEFAULT 'draft',
    limite_leads INT DEFAULT 0, -- 0 = sem limite
    excecoes TEXT, -- Telefones separados por vírgula
    delay_minimo INT NOT NULL DEFAULT 60, -- segundos
    delay_maximo INT NOT NULL DEFAULT 180, -- segundos
    delay_medio INT NOT NULL DEFAULT 120, -- segundos
    template_salvo BOOLEAN DEFAULT FALSE,
    nome_template VARCHAR(255),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    criado_por BIGINT, -- ID do usuário que criou
    INDEX idx_status (status),
    INDEX idx_criado_em (criado_em),
    INDEX idx_criado_por (criado_por)
);

-- =====================================================
-- 2. TABELA PRINCIPAL: AGENDAMENTOS
-- =====================================================
CREATE TABLE agendamentos (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    campanha_id BIGINT NOT NULL,
    data_agendamento DATE NOT NULL,
    horario_agendamento TIME NOT NULL,
    status ENUM('pending', 'processing', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
    iniciado_em TIMESTAMP NULL,
    finalizado_em TIMESTAMP NULL,
    total_leads INT DEFAULT 0,
    leads_processados INT DEFAULT 0,
    leads_enviados INT DEFAULT 0,
    leads_falharam INT DEFAULT 0,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (campanha_id) REFERENCES campanhas(id) ON DELETE CASCADE,
    INDEX idx_campanha_id (campanha_id),
    INDEX idx_data_hora (data_agendamento, horario_agendamento),
    INDEX idx_status (status),
    UNIQUE KEY uk_campanha_data_hora (campanha_id, data_agendamento, horario_agendamento)
);

-- =====================================================
-- 3. TABELA PRINCIPAL: SEQUENCIAS
-- =====================================================
CREATE TABLE sequencias (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    campanha_id BIGINT NOT NULL,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    ordem INT NOT NULL DEFAULT 1, -- Ordem de execução
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (campanha_id) REFERENCES campanhas(id) ON DELETE CASCADE,
    INDEX idx_campanha_id (campanha_id),
    INDEX idx_ordem (ordem),
    INDEX idx_ativo (ativo)
);

-- =====================================================
-- 4. TABELA PRINCIPAL: ITENS_MIDIA
-- =====================================================
CREATE TABLE itens_midia (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    sequencia_id BIGINT NOT NULL,
    tipo ENUM('text', 'image', 'audio', 'document', 'video', 'template', 'recorded_audio') NOT NULL,
    conteudo TEXT NOT NULL, -- Texto da mensagem ou parâmetros do template
    ordem INT NOT NULL DEFAULT 1, -- Ordem dentro da sequência
    delay_antes INT DEFAULT 0, -- Delay antes de enviar este item (segundos)
    arquivo_path VARCHAR(500), -- Caminho para arquivos de mídia
    arquivo_nome VARCHAR(255), -- Nome original do arquivo
    arquivo_tamanho BIGINT, -- Tamanho em bytes
    arquivo_tipo VARCHAR(100), -- MIME type
    template_id VARCHAR(100), -- ID do template WhatsApp (se aplicável)
    variaveis JSON, -- Variáveis personalizáveis {{nome}}, {{empresa}}, etc.
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (sequencia_id) REFERENCES sequencias(id) ON DELETE CASCADE,
    INDEX idx_sequencia_id (sequencia_id),
    INDEX idx_tipo (tipo),
    INDEX idx_ordem (ordem),
    INDEX idx_ativo (ativo)
);

-- =====================================================
-- 5. TABELA PRINCIPAL: DISPAROS (SUA TABELA PRINCIPAL)
-- =====================================================
CREATE TABLE disparos (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    campanha_id BIGINT NOT NULL,
    agendamento_id BIGINT NOT NULL,
    sequencia_id BIGINT NOT NULL,
    item_midia_id BIGINT NOT NULL,
    conta_whatsapp_id BIGINT NOT NULL,
    lead_id BIGINT NOT NULL,
    instancia_origem VARCHAR(100) NOT NULL, -- ID da instância WhatsApp
    destinatario VARCHAR(20) NOT NULL, -- Formato E.164: +556799...
    tipo_de_midia_mensagem ENUM('text', 'image', 'audio', 'document', 'video', 'template') NOT NULL,
    data_envio DATE NOT NULL,
    horario_envio TIME NOT NULL,
    conteudo TEXT NOT NULL, -- Texto ou parâmetros do template
    status ENUM('pending', 'processing', 'sent', 'failed', 'delivered', 'read', 'blocked') DEFAULT 'pending',
    status_whatsapp VARCHAR(100), -- Status retornado pela API WhatsApp
    mensagem_id VARCHAR(100), -- ID da mensagem retornado pelo WhatsApp
    erro_descricao TEXT, -- Descrição do erro se falhou
    tentativas INT DEFAULT 0, -- Número de tentativas de envio
    proxima_tentativa TIMESTAMP NULL, -- Quando tentar novamente
    enviado_em TIMESTAMP NULL, -- Timestamp real do envio
    entregue_em TIMESTAMP NULL, -- Timestamp da entrega
    lido_em TIMESTAMP NULL, -- Timestamp da leitura
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (campanha_id) REFERENCES campanhas(id) ON DELETE CASCADE,
    FOREIGN KEY (agendamento_id) REFERENCES agendamentos(id) ON DELETE CASCADE,
    FOREIGN KEY (sequencia_id) REFERENCES sequencias(id) ON DELETE CASCADE,
    FOREIGN KEY (item_midia_id) REFERENCES itens_midia(id) ON DELETE CASCADE,
    FOREIGN KEY (conta_whatsapp_id) REFERENCES contas_whatsapp(id) ON DELETE CASCADE,
    FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
    INDEX idx_campanha_id (campanha_id),
    INDEX idx_agendamento_id (agendamento_id),
    INDEX idx_conta_whatsapp_id (conta_whatsapp_id),
    INDEX idx_lead_id (lead_id),
    INDEX idx_status (status),
    INDEX idx_data_hora (data_envio, horario_envio),
    INDEX idx_destinatario (destinatario),
    INDEX idx_instancia_origem (instancia_origem),
    INDEX idx_mensagem_id (mensagem_id),
    INDEX idx_enviado_em (enviado_em)
);

-- =====================================================
-- 6. TABELA PRINCIPAL: LEADS
-- =====================================================
CREATE TABLE leads (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(255) NOT NULL,
    telefone VARCHAR(20) NOT NULL, -- Formato E.164: +556799...
    email VARCHAR(255),
    empresa VARCHAR(255),
    cargo VARCHAR(255),
    cidade VARCHAR(255),
    estado VARCHAR(100),
    pais VARCHAR(100) DEFAULT 'BR',
    produto_interesse VARCHAR(255),
    fonte VARCHAR(100), -- Como o lead foi obtido
    status ENUM('active', 'inactive', 'blocked', 'unsubscribed') DEFAULT 'active',
    score_qualificacao INT DEFAULT 0, -- Score de 0-100
    ultima_interacao TIMESTAMP NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_telefone (telefone),
    INDEX idx_email (email),
    INDEX idx_status (status),
    INDEX idx_score (score_qualificacao),
    INDEX idx_criado_em (criado_em),
    UNIQUE KEY uk_telefone (telefone)
);

-- =====================================================
-- 7. TABELA PRINCIPAL: CONTAS_WHATSAPP
-- =====================================================
CREATE TABLE contas_whatsapp (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    nome_conta VARCHAR(255) NOT NULL,
    telefone VARCHAR(20) NOT NULL, -- Formato E.164: +556799...
    instancia_id VARCHAR(100) UNIQUE, -- ID da instância WhatsApp
    status ENUM('connected', 'disconnected', 'blocked', 'suspended') DEFAULT 'disconnected',
    reputacao ENUM('excellent', 'good', 'fair', 'poor') DEFAULT 'fair',
    taxa_resposta DECIMAL(5,2) DEFAULT 0.00, -- Percentual
    taxa_entrega DECIMAL(5,2) DEFAULT 0.00, -- Percentual
    taxa_bloqueio DECIMAL(5,2) DEFAULT 0.00, -- Percentual
    mensagens_enviadas BIGINT DEFAULT 0,
    mensagens_entregues BIGINT DEFAULT 0,
    limite_diario INT DEFAULT 1000, -- Limite de mensagens por dia
    mensagens_hoje INT DEFAULT 0, -- Contador de mensagens hoje
    ultima_atividade TIMESTAMP NULL,
    conectado_em TIMESTAMP NULL,
    desconectado_em TIMESTAMP NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_telefone (telefone),
    INDEX idx_status (status),
    INDEX idx_reputacao (reputacao),
    INDEX idx_instancia_id (instancia_id),
    INDEX idx_ultima_atividade (ultima_atividade),
    UNIQUE KEY uk_telefone (telefone)
);

-- =====================================================
-- 8. TABELA PRINCIPAL: TAGS
-- =====================================================
CREATE TABLE tags (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    tipo ENUM('lead', 'conta', 'campanha') NOT NULL, -- Para que tipo de entidade
    cor VARCHAR(7) DEFAULT '#3B82F6', -- Cor em hex (#RRGGBB)
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_nome (nome),
    INDEX idx_tipo (tipo),
    INDEX idx_ativo (ativo),
    UNIQUE KEY uk_nome_tipo (nome, tipo)
);

-- =====================================================
-- 9. TABELA DE RELACIONAMENTO: LEAD_TAGS
-- =====================================================
CREATE TABLE lead_tags (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    lead_id BIGINT NOT NULL,
    tag_id BIGINT NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
    INDEX idx_lead_id (lead_id),
    INDEX idx_tag_id (tag_id),
    UNIQUE KEY uk_lead_tag (lead_id, tag_id)
);

-- =====================================================
-- 10. TABELA DE RELACIONAMENTO: CONTA_TAGS
-- =====================================================
CREATE TABLE conta_tags (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    conta_whatsapp_id BIGINT NOT NULL,
    tag_id BIGINT NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conta_whatsapp_id) REFERENCES contas_whatsapp(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
    INDEX idx_conta_id (conta_whatsapp_id),
    INDEX idx_tag_id (tag_id),
    UNIQUE KEY uk_conta_tag (conta_whatsapp_id, tag_id)
);

-- =====================================================
-- 11. TABELA DE RELACIONAMENTO: CAMPANHA_LEADS
-- =====================================================
CREATE TABLE campanha_leads (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    campanha_id BIGINT NOT NULL,
    lead_id BIGINT NOT NULL,
    status ENUM('included', 'excluded', 'processed', 'sent', 'failed') DEFAULT 'included',
    processado_em TIMESTAMP NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (campanha_id) REFERENCES campanhas(id) ON DELETE CASCADE,
    FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
    INDEX idx_campanha_id (campanha_id),
    INDEX idx_lead_id (lead_id),
    INDEX idx_status (status),
    UNIQUE KEY uk_campanha_lead (campanha_id, lead_id)
);

-- =====================================================
-- 12. TABELA DE RELACIONAMENTO: CAMPANHA_CONTAS
-- =====================================================
CREATE TABLE campanha_contas (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    campanha_id BIGINT NOT NULL,
    conta_whatsapp_id BIGINT NOT NULL,
    ordem INT DEFAULT 1, -- Ordem de uso das contas
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (campanha_id) REFERENCES campanhas(id) ON DELETE CASCADE,
    FOREIGN KEY (conta_whatsapp_id) REFERENCES contas_whatsapp(id) ON DELETE CASCADE,
    INDEX idx_campanha_id (campanha_id),
    INDEX idx_conta_id (conta_whatsapp_id),
    INDEX idx_ordem (ordem),
    INDEX idx_ativo (ativo),
    UNIQUE KEY uk_campanha_conta (campanha_id, conta_whatsapp_id)
);

-- =====================================================
-- ÍNDICES ADICIONAIS PARA PERFORMANCE
-- =====================================================

-- Índices compostos para consultas frequentes
CREATE INDEX idx_disparos_campanha_status ON disparos(campanha_id, status);
CREATE INDEX idx_disparos_conta_status ON disparos(conta_whatsapp_id, status);
CREATE INDEX idx_disparos_lead_status ON disparos(lead_id, status);
CREATE INDEX idx_disparos_data_status ON disparos(data_envio, status);
CREATE INDEX idx_disparos_agendamento_status ON disparos(agendamento_id, status);

-- Índices para estatísticas e relatórios
CREATE INDEX idx_disparos_enviado_status ON disparos(enviado_em, status);
CREATE INDEX idx_disparos_entregue_status ON disparos(entregue_em, status);
CREATE INDEX idx_disparos_lido_status ON disparos(lido_em, status);

-- Índices para leads
CREATE INDEX idx_leads_cidade_status ON leads(cidade, status);
CREATE INDEX idx_leads_empresa_status ON leads(empresa, status);
CREATE INDEX idx_leads_score_status ON leads(score_qualificacao, status);

-- Índices para contas WhatsApp
CREATE INDEX idx_contas_reputacao_status ON contas_whatsapp(reputacao, status);
CREATE INDEX idx_contas_mensagens_hoje ON contas_whatsapp(mensagens_hoje);

-- =====================================================
-- COMENTÁRIOS SOBRE A ESTRUTURA
-- =====================================================

/*
ESTRUTURA FINAL: 12 TABELAS

TABELAS PRINCIPAIS (8):
1. campanhas - Configuração da campanha
2. agendamentos - Datas/horários específicos
3. sequencias - Sequências de mídia
4. itens_midia - Itens individuais (texto, imagem, etc.)
5. disparos - Cada envio individual (TABELA PRINCIPAL)
6. leads - Contatos
7. contas_whatsapp - Contas conectadas
8. tags - Tags para leads e contas

TABELAS DE RELACIONAMENTO (4):
9. lead_tags - Many-to-Many leads ↔ tags
10. conta_tags - Many-to-Many contas ↔ tags
11. campanha_leads - Many-to-Many campanhas ↔ leads
12. campanha_contas - Many-to-Many campanhas ↔ contas

CARACTERÍSTICAS:
- Normalização correta (3NF)
- Suporte a auditoria completa
- Rastreamento de sequências
- Histórico de agendamentos
- Performance otimizada com índices
- Suporte a múltiplas campanhas simultâneas
- Rastreamento de status em tempo real
- Suporte a templates e variáveis
- Controle de rate limiting por conta
- Métricas de reputação e entrega
*/

-- =====================================================
-- EXEMPLO DE INSERÇÃO DE DADOS DE TESTE
-- =====================================================

-- Inserir tags de exemplo
INSERT INTO tags (nome, descricao, tipo, cor) VALUES
('cliente', 'Clientes ativos', 'lead', '#10B981'),
('lead', 'Leads em prospecção', 'lead', '#3B82F6'),
('premium', 'Clientes premium', 'lead', '#F59E0B'),
('vendas', 'Contas de vendas', 'conta', '#8B5CF6'),
('suporte', 'Contas de suporte', 'conta', '#06B6D4'),
('excelente', 'Contas com reputação excelente', 'conta', '#10B981');

-- Inserir conta WhatsApp de exemplo
INSERT INTO contas_whatsapp (nome_conta, telefone, status, reputacao) VALUES
('Conta Principal', '+5511999999999', 'connected', 'excellent'),
('Suporte', '+5511888888888', 'connected', 'good'),
('Vendas', '+5511777777777', 'connected', 'fair');

-- Inserir lead de exemplo
INSERT INTO leads (nome, telefone, email, empresa, cidade) VALUES
('João Silva', '+5511666666666', 'joao@empresa.com', 'Empresa ABC', 'São Paulo'),
('Maria Santos', '+5511555555555', 'maria@empresa.com', 'Empresa XYZ', 'Rio de Janeiro');

-- Aplicar tags aos leads
INSERT INTO lead_tags (lead_id, tag_id) 
SELECT l.id, t.id FROM leads l, tags t 
WHERE l.nome = 'João Silva' AND t.nome = 'cliente';

INSERT INTO lead_tags (lead_id, tag_id) 
SELECT l.id, t.id FROM leads l, tags t 
WHERE l.nome = 'Maria Santos' AND t.nome = 'lead';

-- Aplicar tags às contas
INSERT INTO conta_tags (conta_whatsapp_id, tag_id) 
SELECT c.id, t.id FROM contas_whatsapp c, tags t 
WHERE c.nome_conta = 'Conta Principal' AND t.nome = 'vendas';

INSERT INTO conta_tags (conta_whatsapp_id, tag_id) 
SELECT c.id, t.id FROM contas_whatsapp c, tags t 
WHERE c.nome_conta = 'Suporte' AND t.nome = 'suporte';
