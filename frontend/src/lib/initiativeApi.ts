import { API_ROOT } from '@/lib/apiBase';
import { getToken } from '@/lib/trustAuth';

export type InitiativeType = 'ngo' | 'trust' | 'government';

export interface InitiativeItem {
  id: string;
  name: string;
  initiative_type: InitiativeType;
  sponsor_name?: string;
  description?: string;
  eligibility?: string;
  status?: string;
}

export interface InitiativeOffer {
  id: string;
  title: string;
  description?: string;
  location?: string;
  quantity_kg: number;
  unit_price: number;
  subsidy_percent: number;
  available_units: number;
  status: string;
  created_at?: string;
  initiative?: InitiativeItem;
  provider?: {
    id: string;
    name: string;
    role?: string;
    is_verified?: boolean;
  };
}

const parseResponse = async (response: Response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.message || 'Request failed');
  }
  return data;
};

export const initiativeApi = {
  async listInitiatives(type?: InitiativeType) {
    const params = new URLSearchParams();
    if (type) {
      params.set('type', type);
    }

    const query = params.toString();
    const response = await fetch(`${API_ROOT}/initiatives${query ? `?${query}` : ''}`);
    const data = await parseResponse(response);

    return {
      initiatives: (data.initiatives || []) as InitiativeItem[],
      count: Number(data.count || 0),
    };
  },

  async listOffers(filters?: { type?: InitiativeType; initiativeId?: string; status?: string }) {
    const params = new URLSearchParams();
    if (filters?.type) params.set('type', filters.type);
    if (filters?.initiativeId) params.set('initiativeId', filters.initiativeId);
    if (filters?.status) params.set('status', filters.status);

    const query = params.toString();
    const response = await fetch(`${API_ROOT}/initiatives/offers${query ? `?${query}` : ''}`);
    const data = await parseResponse(response);

    return {
      offers: (data.offers || []) as InitiativeOffer[],
      count: Number(data.count || 0),
    };
  },

  async listMyOffers() {
    const token = getToken();
    if (!token) {
      throw new Error('Please login to view your initiative listings');
    }

    const response = await fetch(`${API_ROOT}/initiatives/offers/mine`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await parseResponse(response);
    return {
      offers: (data.offers || []) as InitiativeOffer[],
      count: Number(data.count || 0),
    };
  },

  async createOffer(payload: {
    initiativeId: string;
    title: string;
    description?: string;
    location?: string;
    quantityKg?: number;
    unitPrice?: number;
    subsidyPercent?: number;
    availableUnits?: number;
  }) {
    const token = getToken();
    if (!token) {
      throw new Error('Please login as provider to create initiative listings');
    }

    const response = await fetch(`${API_ROOT}/initiatives/offers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await parseResponse(response);
    return {
      message: String(data.message || 'Initiative LPG offer created'),
      offer: data.offer as InitiativeOffer,
    };
  },
};
