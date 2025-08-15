import { useState, useEffect } from 'react';

export interface ContactValidation {
  phone: string;
  isValid: boolean;
  hasWhatsApp: boolean;
  lastFailure?: Date;
  failureCount: number;
  lastCampaignSent?: Date;
  blockStatus: 'none' | 'soft' | 'hard';
  deliveryStatus: 'unknown' | 'delivered' | 'failed' | 'blocked';
}

export interface AccountReputation {
  accountId: string;
  accountName: string;
  phone: string;
  tags: string[];
  status: 'connected' | 'disconnected' | 'blocked';
  reputation: 'excellent' | 'good' | 'fair' | 'poor';
  lastUpdated: Date;
}

// Mock database for demonstration
const mockContactValidations: ContactValidation[] = [
  {
    phone: '+5511999999999',
    isValid: false,
    hasWhatsApp: false,
    lastFailure: new Date(Date.now() - 24 * 60 * 60 * 1000),
    failureCount: 3,
    blockStatus: 'hard',
    deliveryStatus: 'failed'
  },
  {
    phone: '+5511888888888',
    isValid: true,
    hasWhatsApp: true,
    failureCount: 0,
    lastCampaignSent: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    blockStatus: 'none',
    deliveryStatus: 'delivered'
  }
];

const mockAccountReputations: AccountReputation[] = [
  {
    accountId: '1',
    accountName: 'Conta Principal',
    phone: '+55 11 99999-9999',
    tags: ['vendas', 'premium', 'principal'],
    status: 'connected',
    reputation: 'excellent',
    lastUpdated: new Date()
  },
  {
    accountId: '2',
    accountName: 'Suporte',
    phone: '+55 11 88888-8888',
    tags: ['suporte', 'atendimento'],
    status: 'connected',
    reputation: 'good',
    lastUpdated: new Date()
  },
  {
    accountId: '3',
    accountName: 'Vendas',
    phone: '+55 11 77777-7777',
    tags: ['vendas', 'comercial'],
    status: 'connected',
    reputation: 'fair',
    lastUpdated: new Date()
  },
  {
    accountId: '4',
    accountName: 'Marketing',
    phone: '+55 11 66666-6666',
    tags: ['marketing', 'promocional'],
    status: 'connected',
    reputation: 'excellent',
    lastUpdated: new Date()
  },
  {
    accountId: '5',
    accountName: 'Atendimento',
    phone: '+55 11 55555-5555',
    tags: ['atendimento', 'cliente'],
    status: 'connected',
    reputation: 'good',
    lastUpdated: new Date()
  },
  {
    accountId: '6',
    accountName: 'Comercial',
    phone: '+55 11 44444-4444',
    tags: ['vendas', 'comercial'],
    status: 'connected',
    reputation: 'excellent',
    lastUpdated: new Date()
  },
  {
    accountId: '7',
    accountName: 'Suporte Técnico',
    phone: '+55 11 33333-3333',
    tags: ['suporte', 'tecnico'],
    status: 'connected',
    reputation: 'good',
    lastUpdated: new Date()
  },
  {
    accountId: '8',
    accountName: 'Vendas Premium',
    phone: '+55 11 22222-2222',
    tags: ['vendas', 'premium', 'vip'],
    status: 'connected',
    reputation: 'excellent',
    lastUpdated: new Date()
  },
  {
    accountId: '9',
    accountName: 'Atendimento VIP',
    phone: '+55 11 11111-1111',
    tags: ['atendimento', 'vip', 'premium'],
    status: 'connected',
    reputation: 'excellent',
    lastUpdated: new Date()
  },
  {
    accountId: '10',
    accountName: 'Marketing Digital',
    phone: '+55 11 00000-0000',
    tags: ['marketing', 'digital', 'online'],
    status: 'connected',
    reputation: 'good',
    lastUpdated: new Date()
  }
];

// Mock account tags for filtering
export const ACCOUNT_TAGS = [
  'vendas',
  'suporte', 
  'atendimento',
  'marketing',
  'comercial',
  'tecnico',
  'premium',
  'vip',
  'digital',
  'online',
  'cliente',
  'promocional'
];

export class NumberValidationService {
  static async validateNumber(phone: string): Promise<ContactValidation> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const existing = mockContactValidations.find(c => c.phone === phone);
    if (existing) {
      return existing;
    }

    // Simulate validation logic
    const isValid = !phone.includes('000') && phone.length >= 10;
    const hasWhatsApp = isValid && Math.random() > 0.1; // 90% have WhatsApp if valid
    
    return {
      phone,
      isValid,
      hasWhatsApp,
      failureCount: 0,
      blockStatus: 'none',
      deliveryStatus: 'unknown'
    };
  }

  static checkRecentCampaign(phone: string, hoursThreshold: number = 48): boolean {
    const contact = mockContactValidations.find(c => c.phone === phone);
    if (!contact?.lastCampaignSent) return false;
    
    const hoursSince = (Date.now() - contact.lastCampaignSent.getTime()) / (1000 * 60 * 60);
    return hoursSince < hoursThreshold;
  }

  static shouldExcludeNumber(phone: string): { exclude: boolean; reason?: string } {
    const contact = mockContactValidations.find(c => c.phone === phone);
    
    if (!contact) return { exclude: false };
    
    if (!contact.isValid) {
      return { exclude: true, reason: 'Número inválido' };
    }
    
    if (!contact.hasWhatsApp) {
      return { exclude: true, reason: 'Não possui WhatsApp' };
    }
    
    if (contact.blockStatus === 'hard') {
      return { exclude: true, reason: 'Número bloqueado' };
    }
    
    if (contact.failureCount >= 3) {
      return { exclude: true, reason: 'Muitas falhas de entrega' };
    }
    
    if (this.checkRecentCampaign(contact.phone)) {
      return { exclude: true, reason: 'Recebeu campanha recentemente' };
    }
    
    return { exclude: false };
  }

  static getAccountReputation(accountId: string): AccountReputation | null {
    return mockAccountReputations.find(acc => acc.accountId === accountId) || null;
  }

  static getAllAccountReputations(): AccountReputation[] {
    return mockAccountReputations;
  }

  static getAccountReputationsByTag(tag: string): AccountReputation[] {
    return mockAccountReputations.filter(acc => acc.tags.includes(tag));
  }

  static getAccountTags(): string[] {
    return ACCOUNT_TAGS;
  }

  static updateContactStatus(phone: string, status: 'delivered' | 'failed' | 'blocked'): void {
    const index = mockContactValidations.findIndex(c => c.phone === phone);
    if (index >= 0) {
      mockContactValidations[index].deliveryStatus = status;
      if (status === 'failed') {
        mockContactValidations[index].failureCount++;
        mockContactValidations[index].lastFailure = new Date();
      } else if (status === 'blocked') {
        mockContactValidations[index].blockStatus = 'hard';
      }
    } else if (status !== 'delivered') {
      // Add new failed contact
      mockContactValidations.push({
        phone,
        isValid: true,
        hasWhatsApp: true,
        failureCount: status === 'failed' ? 1 : 0,
        lastFailure: status === 'failed' ? new Date() : undefined,
        blockStatus: status === 'blocked' ? 'hard' : 'none',
        deliveryStatus: status
      });
    }
  }
}

export const useNumberValidation = () => {
  const [validatingNumbers, setValidatingNumbers] = useState<string[]>([]);
  const [validationResults, setValidationResults] = useState<ContactValidation[]>([]);

  const validateNumbers = async (numbers: string[]) => {
    setValidatingNumbers(numbers);
    
    const results = await Promise.all(
      numbers.map(num => NumberValidationService.validateNumber(num))
    );
    
    setValidationResults(results);
    setValidatingNumbers([]);
    
    return results;
  };

  const checkNumbersForExclusion = (numbers: string[]) => {
    return numbers.map(phone => ({
      phone,
      ...NumberValidationService.shouldExcludeNumber(phone)
    }));
  };

  return {
    validatingNumbers,
    validationResults,
    validateNumbers,
    checkNumbersForExclusion,
    isValidating: validatingNumbers.length > 0
  };
};