// TODO: replace with Stayweb admin API
import { apiClient } from './client';
import { RoomType } from '../../types/schema';

/** Mirrors the RoomInventory shape from PropertyDataContext (avoids cross-layer import) */
interface RoomInventory {
  id: string;
  name: string;
  type: string;
  status: string;
  beds?: any[];
  [key: string]: any;
}

export interface LockPayload {
  room_id: string;
  start_date: string;
  end_date: string;
  source?: string;
}

export interface LockResponse {
  id: string;
  room_id: string;
  start_date: string;
  end_date: string;
  expires_at: string;
}

export const inventoryApi = {
  getAvailability: async (propertyId: string, startDate: string, endDate: string) => {
    const query = new URLSearchParams({
      propertyId,
      start_date: startDate,
      end_date: endDate
    }).toString();
    return apiClient.fetch<RoomInventory[]>(`/core/availability?${query}`);
  },

  getRooms: async (propertyId: string) => {
    return apiClient.fetch<RoomInventory[]>(`/core/properties/${propertyId}/rooms`);
  },

  getRoomTypes: async (propertyId: string) => {
    return apiClient.fetch<RoomType[]>(`/core/properties/${propertyId}/room-types`);
  },

  // Locks are handled server-side during booking, but if we need to inspect them:
  getLocks: async (propertyId: string, date: string) => {
    return apiClient.fetch<any[]>(`/core/inventory/locks?propertyId=${propertyId}&date=${date}`);
  },

  acquireLock: async (payload: LockPayload) => {
    return apiClient.fetch<LockResponse>('/core/locks', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }
};