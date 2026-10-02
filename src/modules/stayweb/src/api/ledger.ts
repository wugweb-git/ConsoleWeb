// TODO: replace with Stayweb admin API
import { apiClient } from './client';

/** Inline LedgerEntry type — no /src/types/ directory exists */
export interface LedgerEntry {
  id: string;
  propertyId: string;
  bookingId?: string;
  type: 'credit' | 'debit';
  category: string;
  description: string;
  amount: number;
  currency: string;
  referenceId?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt?: string;
}

export const ledgerApi = {
  list: async (propertyId?: string) => {
    const query = propertyId ? `?propertyId=${propertyId}` : '';
    return apiClient.fetch<LedgerEntry[]>(`/core/ledger${query}`);
  },

  create: async (entry: Partial<LedgerEntry>) => {
    return apiClient.fetch<LedgerEntry>('/core/ledger', {
      method: 'POST',
      body: JSON.stringify(entry),
    });
  },

  getBalance: async (propertyId: string) => {
    return apiClient.fetch<{ balance: number; currency: string }>(`/core/ledger/balance?propertyId=${propertyId}`);
  }
};