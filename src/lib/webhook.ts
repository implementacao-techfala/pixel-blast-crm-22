// Webhook service for sending notifications to external endpoint
const WEBHOOK_URL = 'https://automatewebhook.techfala.com.br/webhook/gestor-de-grupos';

interface Lead {
  id: string;
  name: string;
  phone: string;
  tags: string[];
  whatsappAccount: string;
  lastContact: string;
  status: 'active' | 'inactive' | 'blocked';
}

interface Message {
  id: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'document';
  content: string;
  mediaBase64?: string;
  delay?: number;
}

interface WebhookPayload {
  action: string;
  user: string;
  timestamp: string;
  data?: any;
  leads?: Lead[];
  messages?: Message[];
}

interface QRCodeResponse {
  success: boolean;
  qrCode?: string; // base64 QR code
  error?: string;
}

export const sendWebhookNotification = async (
  action: string, 
  user: string, 
  data?: any,
  leads?: Lead[],
  messages?: Message[]
): Promise<void> => {
  try {
    const payload: WebhookPayload = {
      action,
      user,
      timestamp: new Date().toISOString(),
      data,
      leads,
      messages
    };

    // Send POST request with full payload
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      console.warn(`Webhook notification failed: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error('Failed to send webhook notification:', error);
  }
};

export const generateQRCode = async (name: string, phone: string): Promise<QRCodeResponse> => {
  try {
    const payload = {
      name,
      phone
    };

    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`QR generation failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    // Check if response has the QR code in 'd' property
    if (result.d && typeof result.d === 'string' && result.d.startsWith('data:image/')) {
      // Extract only the base64 part (remove "data:image/png;base64," prefix)
      const base64Data = result.d.split(',')[1];
      return { success: true, qrCode: base64Data };
    }
    
    // Fallback for other response formats
    if (result.success && result.qrCode) {
      return result;
    }
    
    return { success: false, error: 'Invalid response format' };
  } catch (error) {
    console.error('Failed to generate QR code:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Common webhook actions
export const WEBHOOK_ACTIONS = {
  CAMPAIGN_CREATED: 'campaign_created',
  CAMPAIGN_SENT: 'campaign_sent',
  WHATSAPP_CONNECTED: 'whatsapp_connected',
  WHATSAPP_DISCONNECTED: 'whatsapp_disconnected',
  GENERATE_QR: 'generate_qr',
} as const;