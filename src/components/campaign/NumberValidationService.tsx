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
  responseRate: number;
  blockRate: number;
  deliveryRate: number;
  totalMessagesSent: number;
  totalMessagesDelivered: number;
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
    responseRate: 85.2,
    blockRate: 2.1,
    deliveryRate: 97.5,
    totalMessagesSent: 1250,
    totalMessagesDelivered: 1219,
    reputation: 'excellent',
    lastUpdated: new Date()
  },
  {
    accountId: '2',
    accountName: 'Suporte',
    responseRate: 72.3,
    blockRate: 8.5,
    deliveryRate: 89.2,
    totalMessagesSent: 800,
    totalMessagesDelivered: 714,
    reputation: 'fair',
    lastUpdated: new Date()
  },
  {
    accountId: '3',
    accountName: 'Vendas',
    responseRate: 45.1,
    blockRate: 15.2,
    deliveryRate: 78.3,
    totalMessagesSent: 500,
    totalMessagesDelivered: 392,
    reputation: 'poor',
    lastUpdated: new Date()
  }
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