// TODO: replace with Stayweb admin API
import { apiClient } from './client';
import { Booking } from '../../types/schema';

export interface CreateBookingPayload extends Partial<Booking> {
  lock_id?: string;
  room_id?: string;
  bed_id?: string;
  checkin_date?: string;
  checkout_date?: string;
  guest_name?: string;
  guest_email?: string;
  property_id?: string;
}

export const bookingsApi = {
  create: async (payload: CreateBookingPayload) => {
    return apiClient.fetch<Booking>('/core/bookings', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  createBooking: async (payload: CreateBookingPayload) => {
    return apiClient.fetch<Booking>('/core/bookings', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  cancel: async (bookingId: string) => {
    return apiClient.fetch<Booking>(`/core/bookings/${bookingId}/cancel`, {
      method: 'POST',
    });
  },

  list: async (filters?: { propertyId?: string; status?: string }) => {
    const query = new URLSearchParams(filters as Record<string, string>).toString();
    return apiClient.fetch<Booking[]>(`/core/bookings?${query}`);
  },

  get: async (bookingId: string) => {
    return apiClient.fetch<Booking>(`/core/bookings/${bookingId}`);
  }
};