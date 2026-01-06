import type { Message } from "../types/chat";
import { api } from "./api";

export const messagesService = {
  // Récupérer tous les messages d'une room
  async getMessages(roomId: string): Promise<Message[]> {
    const res = await api.get<Message[]>(`/rooms/${roomId}/messages`);
    return res.data.map((msg) => ({
      ...msg,
      created_at: msg.created_at, // adapter à ton type frontend
      author: {
        id: msg.author.id,
        username: msg.author.username,
      },
    }));
  },

  // Envoyer un message
  async sendMessage(roomId: string, content: string): Promise<Message> {
    const res = await api.post<Message>(`/rooms/${roomId}/messages`, {
      content,
    });
    return {
      ...res.data,
      created_at: res.data.created_at,
      author: {
        id: res.data.author.id,
        username: res.data.author.username,
      },
    };
  },
};
