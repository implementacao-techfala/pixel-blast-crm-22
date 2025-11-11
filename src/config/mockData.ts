// ✅ DADOS MOCKADOS PARA DEMONSTRAÇÃO
// Este arquivo contém dados realistas para modo DEMO

import { WhatsAppAccount } from '@/hooks/useAccounts';
import { Tag } from '@/hooks/useTags';
import { Campaign } from '@/hooks/useCampaigns';

// ====================================
// CONTAS WHATSAPP MOCKADAS
// ====================================
export const mockAccounts: WhatsAppAccount[] = [
  {
    row_number: 1,
    id: 1,
    nome_conta: 'Vendas Principal',
    telefone: '+5511999887766',
    status: 'conectado',
    reputacao: 'alta',
    criado_em: '2024-01-15T10:00:00Z',
    atualizado_em: '2025-01-10T15:30:00Z',
    id_tag: 1
  },
  {
    row_number: 2,
    id: 2,
    nome_conta: 'Suporte Cliente',
    telefone: '+5511988776655',
    status: 'conectado',
    reputacao: 'alta',
    criado_em: '2024-01-20T11:00:00Z',
    atualizado_em: '2025-01-10T14:20:00Z',
    id_tag: 2
  },
  {
    row_number: 3,
    id: 3,
    nome_conta: 'Marketing Digital',
    telefone: '+5511977665544',
    status: 'conectado',
    reputacao: 'media',
    criado_em: '2024-02-01T09:00:00Z',
    atualizado_em: '2025-01-09T16:45:00Z',
    id_tag: 1
  },
  {
    row_number: 4,
    id: 4,
    nome_conta: 'Vendas Secundária',
    telefone: '+5511966554433',
    status: 'desconectado',
    reputacao: 'baixa',
    criado_em: '2024-02-10T13:00:00Z',
    atualizado_em: '2025-01-08T10:00:00Z',
    id_tag: 1
  },
  {
    row_number: 5,
    id: 5,
    nome_conta: 'Promoções',
    telefone: '+5511955443322',
    status: 'conectado',
    reputacao: 'alta',
    criado_em: '2024-02-15T14:00:00Z',
    atualizado_em: '2025-01-10T12:00:00Z',
    id_tag: 3
  },
  {
    row_number: 6,
    id: 6,
    nome_conta: 'Relacionamento',
    telefone: '+5511944332211',
    status: 'conectado',
    reputacao: 'media',
    criado_em: '2024-03-01T08:00:00Z',
    atualizado_em: '2025-01-09T18:30:00Z',
    id_tag: 2
  }
];

// ====================================
// TAGS MOCKADAS
// ====================================
export const mockTags: Tag[] = [
  {
    row_number: 1,
    id: 1,
    nome: 'Clientes VIP',
    tipo: 'cliente',
    criado_em: '2024-01-10T10:00:00Z',
    atualizado_em: '2025-01-05T12:00:00Z'
  },
  {
    row_number: 2,
    id: 2,
    nome: 'Leads Quentes',
    tipo: 'lead',
    criado_em: '2024-01-12T11:00:00Z',
    atualizado_em: '2025-01-06T14:00:00Z'
  },
  {
    row_number: 3,
    id: 3,
    nome: 'Prospects',
    tipo: 'lead',
    criado_em: '2024-01-15T09:00:00Z',
    atualizado_em: '2025-01-07T10:00:00Z'
  },
  {
    row_number: 4,
    id: 4,
    nome: 'Black Friday 2024',
    tipo: 'campanha',
    criado_em: '2024-01-20T13:00:00Z',
    atualizado_em: '2025-01-08T16:00:00Z'
  },
  {
    row_number: 5,
    id: 5,
    nome: 'Inadimplentes',
    tipo: 'financeiro',
    criado_em: '2024-02-01T10:00:00Z',
    atualizado_em: '2025-01-09T11:00:00Z'
  },
  {
    row_number: 6,
    id: 6,
    nome: 'Newsletter Mensal',
    tipo: 'campanha',
    criado_em: '2024-02-10T14:00:00Z',
    atualizado_em: '2025-01-10T09:00:00Z'
  },
  {
    row_number: 7,
    id: 7,
    nome: 'Clientes Inativos',
    tipo: 'cliente',
    criado_em: '2024-02-15T15:00:00Z',
    atualizado_em: '2025-01-10T13:00:00Z'
  },
  {
    row_number: 8,
    id: 8,
    nome: 'Leads Frios',
    tipo: 'lead',
    criado_em: '2024-03-01T08:00:00Z',
    atualizado_em: '2025-01-10T17:00:00Z'
  }
];

// ====================================
// CAMPANHAS MOCKADAS
// ====================================
export const mockCampaigns: Campaign[] = [
  {
    id: '1',
    name: 'Promoção Black Friday 2024',
    schedules: [
      { date: '2024-11-25', time: '09:00' },
      { date: '2024-11-26', time: '14:00' }
    ],
    status: 'completed',
    targetCount: 5420,
    sentCount: 5315,
    mediaTypes: ['text', 'image'],
    selectedAccounts: ['1', '3', '5'],
    selectedTags: ['Clientes VIP', 'Leads Quentes'],
    excludedContacts: '',
    mediaItems: [],
    sequences: [],
    randomizeMedia: true,
    maxLeads: 5420,
    delayMin: 120,
    delayMax: 180,
    useTemplate: false,
    createdAt: '2024-11-20T10:00:00Z',
    deliveryRate: 98,
    openRate: 87
  },
  {
    id: '2',
    name: 'Newsletter Janeiro 2025',
    schedules: [
      { date: '2025-01-15', time: '10:00' }
    ],
    status: 'scheduled',
    targetCount: 3200,
    sentCount: 0,
    mediaTypes: ['text'],
    selectedAccounts: ['2', '6'],
    selectedTags: ['Newsletter Mensal', 'Clientes VIP'],
    excludedContacts: '',
    mediaItems: [],
    sequences: [],
    randomizeMedia: false,
    maxLeads: 3200,
    delayMin: 60,
    delayMax: 120,
    useTemplate: true,
    templateName: 'Newsletter Padrão',
    createdAt: '2025-01-05T14:30:00Z'
  },
  {
    id: '3',
    name: 'Recuperação de Inadimplentes',
    schedules: [
      { date: '2025-01-12', time: '09:00' }
    ],
    status: 'sending',
    targetCount: 850,
    sentCount: 412,
    mediaTypes: ['text'],
    selectedAccounts: ['1'],
    selectedTags: ['Inadimplentes'],
    excludedContacts: '',
    mediaItems: [],
    sequences: [],
    randomizeMedia: false,
    maxLeads: 850,
    delayMin: 180,
    delayMax: 300,
    useTemplate: false,
    createdAt: '2025-01-10T08:00:00Z',
    deliveryRate: 95,
    openRate: 72
  },
  {
    id: '4',
    name: 'Reativação Clientes Inativos',
    schedules: [
      { date: '2025-01-20', time: '15:00' }
    ],
    status: 'scheduled',
    targetCount: 1520,
    sentCount: 0,
    mediaTypes: ['text', 'image', 'video'],
    selectedAccounts: ['1', '3'],
    selectedTags: ['Clientes Inativos'],
    excludedContacts: '',
    mediaItems: [],
    sequences: [],
    randomizeMedia: true,
    maxLeads: 1520,
    delayMin: 120,
    delayMax: 240,
    useTemplate: false,
    createdAt: '2025-01-08T11:00:00Z'
  },
  {
    id: '5',
    name: 'Lançamento Produto Premium',
    schedules: [
      { date: '2024-12-15', time: '10:00' }
    ],
    status: 'completed',
    targetCount: 2850,
    sentCount: 2820,
    mediaTypes: ['text', 'image'],
    selectedAccounts: ['1', '5'],
    selectedTags: ['Clientes VIP', 'Prospects'],
    excludedContacts: '',
    mediaItems: [],
    sequences: [],
    randomizeMedia: false,
    maxLeads: 2850,
    delayMin: 90,
    delayMax: 150,
    useTemplate: false,
    createdAt: '2024-12-10T09:00:00Z',
    deliveryRate: 99,
    openRate: 94,
    uncontactedLeads: [
      {
        id: 'lead1',
        name: 'João Silva',
        phone: '+5511999887744',
        tags: ['Clientes VIP'],
        reason: 'number_invalid',
        lastAttempt: '2024-12-15T10:30:00Z',
        accountsAttempted: ['1']
      },
      {
        id: 'lead2',
        name: 'Maria Santos',
        phone: '+5511988776633',
        tags: ['Prospects'],
        reason: 'account_blocked',
        lastAttempt: '2024-12-15T11:00:00Z',
        accountsAttempted: ['1', '5']
      }
    ]
  }
];

// ====================================
// LEADS MOCKADOS
// ====================================
export interface MockLead {
  id: string;
  name: string;
  phone: string;
  email: string;
  tags: string[];
  status: 'ativo' | 'inativo' | 'bloqueado';
  createdAt: string;
  lastContact?: string;
  notes?: string;
}

export const mockLeads: MockLead[] = Array.from({ length: 50 }, (_, i) => ({
  id: `lead-${i + 1}`,
  name: `Contato ${i + 1}`,
  phone: `+5511${String(900000000 + i).slice(0, 9)}`,
  email: `contato${i + 1}@email.com`,
  tags: [mockTags[i % mockTags.length].nome],
  status: i % 10 === 0 ? 'inativo' : i % 15 === 0 ? 'bloqueado' : 'ativo',
  createdAt: new Date(2024, 0, 1 + i).toISOString(),
  lastContact: i % 3 === 0 ? new Date(2025, 0, 1 + (i % 10)).toISOString() : undefined,
  notes: i % 5 === 0 ? 'Cliente interessado em produtos premium' : undefined
}));
