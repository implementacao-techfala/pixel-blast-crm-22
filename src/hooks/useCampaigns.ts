import { useState, useEffect } from 'react';

export interface Campaign {
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
  mediaItems: any[];
  randomizeMedia: boolean;
  maxLeads: number;
  delayMin: number;
  delayMax: number;
  useTemplate?: boolean;
  templateName?: string;
  createdAt: string;
  deliveryRate?: number;
  openRate?: number;
  uncontactedLeads?: any[];
}

export const useCampaigns = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Buscando campanhas da API...');
      
      const response = await fetch('https://automatewebhook.techfala.com.br/webhook/ler_todas_campanhas', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📥 Resposta da API de campanhas:', data);
      
      // Processar resposta da API
      if (data && Array.isArray(data)) {
        setCampaigns(data);
      } else if (data && Array.isArray(data.data)) {
        setCampaigns(data.data);
      } else {
        console.warn('⚠️ Formato de resposta inesperado:', data);
        setCampaigns([]);
      }
      
    } catch (error) {
      console.error('❌ Erro ao buscar campanhas:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshCampaigns = () => {
    fetchCampaigns();
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  return {
    campaigns,
    loading,
    error,
    refreshCampaigns
  };
};
