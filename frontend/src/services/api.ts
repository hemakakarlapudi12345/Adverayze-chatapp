import { Message } from '../types/message';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const api = {
  // Get all messages
  getMessages: async (userId: string): Promise<Message[]> => {
    const response = await fetch(`${API_BASE_URL}/api/messages?userId=${userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch messages');
    }
    return response.json();
  },

  // Send a new message
  sendMessage: async (content: string, senderId: string, senderName: string): Promise<Message> => {
    const response = await fetch(`${API_BASE_URL}/api/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content, senderId, senderName }),
    });
    if (!response.ok) {
      throw new Error('Failed to send message');
    }
    return response.json();
  },

  // Delete message for me
  deleteMessageForMe: async (messageId: string, userId: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/messages/${messageId}/delete-for-me`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });
    if (!response.ok) {
      throw new Error('Failed to delete message for me');
    }
  },

  // Delete message for everyone
  deleteMessageForEveryone: async (messageId: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/messages/${messageId}/delete-for-everyone`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete message for everyone');
    }
  },

  // Pin/unpin message
  togglePinMessage: async (messageId: string): Promise<{ success: boolean; isPinned: boolean }> => {
    const response = await fetch(`${API_BASE_URL}/api/messages/${messageId}/pin`, {
      method: 'PUT',
    });
    if (!response.ok) {
      throw new Error('Failed to pin/unpin message');
    }
    return response.json();
  },

  // Get pinned messages
  getPinnedMessages: async (userId: string): Promise<Message[]> => {
    const response = await fetch(`${API_BASE_URL}/api/messages/pinned?userId=${userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch pinned messages');
    }
    return response.json();
  },
};
