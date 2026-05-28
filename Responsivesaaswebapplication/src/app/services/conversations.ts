import api from './axios';
import type { Conversation, ConversationStatus, SendMessageResponse } from '../types/conversations';

export const conversationsApi = {
  getAll: (): Promise<Conversation[]> =>
    api.get('/conversations').then(r => r.data),

  getById: (id: string): Promise<Conversation> =>
    api.get(`/conversations/${id}`).then(r => r.data),

  create: (phone: string, name?: string): Promise<Conversation> =>
    api.post('/conversations', { phone, name }).then(r => r.data),

  sendMessage: (id: string, message: string): Promise<SendMessageResponse> =>
    api.post(`/conversations/${id}/message`, { message }).then(r => r.data),

  /** Persists AI/human takeover to the backend. */
  toggleStatus: (id: string, status: ConversationStatus): Promise<{ status: ConversationStatus; updatedAt: string }> =>
    api.patch(`/conversations/${id}/status`, { status }).then(r => r.data),
};
