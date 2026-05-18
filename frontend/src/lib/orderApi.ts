import { API_BASE_URL } from '@/lib/apiBase';
import { getToken } from '@/lib/trustAuth';

export interface CreateOrderData {
  seller_name: string;
  fill_level?: string;
  price: string;
  buyer_id?: string;
  provider_user_id?: string;
  delivery_mode?: 'pickup' | 'delivery';
  quantity_kg?: number;
  consumer_notes?: string;
  delivery_location?: string;
  scheduled_for?: string | null;
  payment_mode?: 'upi' | 'card' | 'netbanking' | 'wallet';
  payment_status?: 'paid_test' | 'failed_test' | 'pending';
  payment_reference?: string;
}

export interface BookingOrder {
  id: string;
  buyer_id: string;
  provider_user_id?: string | null;
  seller_name: string;
  fill_level?: string | null;
  price: string;
  status: 'requested' | 'confirmed' | 'in_transit' | 'delivered' | 'cancelled';
  tracking_id: string;
  delivery_mode?: 'pickup' | 'delivery';
  quantity_kg?: number;
  consumer_notes?: string | null;
  delivery_location?: string | null;
  scheduled_for?: string | null;
  payment_mode?: 'upi' | 'card' | 'netbanking' | 'wallet';
  payment_status?: 'paid_test' | 'failed_test' | 'pending';
  payment_reference?: string | null;
  created_at: string;
}

const withAuthHeaders = () => {
  const token = getToken() || localStorage.getItem('token') || localStorage.getItem('auth_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

export const orderApi = {
  createOrder: async (orderData: CreateOrderData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/create`, {
        method: 'POST',
        headers: withAuthHeaders(),
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to place order');
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  },

  getMyOrders: async (): Promise<BookingOrder[]> => {
    const response = await fetch(`${API_BASE_URL}/api/orders/mine`, {
      headers: withAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch your orders');
    }

    return response.json();
  },

  getProviderOrders: async (): Promise<BookingOrder[]> => {
    const response = await fetch(`${API_BASE_URL}/api/orders/provider/mine`, {
      headers: withAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch provider orders');
    }

    return response.json();
  },

  updateOrderStatus: async (orderId: string, status: BookingOrder['status']) => {
    const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: withAuthHeaders(),
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to update order status');
    }

    return response.json();
  },

  getUserOrders: async (userId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/user/${userId}`, {
        headers: withAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      return await response.json();
    } catch (error) {
      throw new Error('Failed to fetch orders');
    }
  }
};
