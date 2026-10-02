// TODO: replace with Stayweb admin API
import { apiClient } from './client';

export const authApi = {
  login: async (email: string, password: string) => {
    return apiClient.fetch<{ user: any; session: any; tenant_id: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  logout: async () => {
    return apiClient.fetch('/auth/logout', { method: 'POST' });
  },

  signup: async (payload: { email: string; password: string; name: string }) => {
    return apiClient.fetch('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getSession: async () => {
    return apiClient.fetch<{ user: any; tenant_id: string }>('/core/me');
  }
};
