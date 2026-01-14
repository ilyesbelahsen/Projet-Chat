// frontend/src/services/messagesService.ts
import type { ChatMessageDTO } from "../types/chat";
import { api } from "./api";

export const messagesService = {
  async getMessages(roomId: number | string): Promise<ChatMessageDTO[]> {
    const res = await api.get<ChatMessageDTO[]>(`/messages/${roomId}`);
    return res.data;
  },

  // Optionnel : utile tant que ton WS ne broadcast pas encore
  async sendMessage(roomId: number | string, content: string): Promise<ChatMessageDTO> {
    const res = await api.post<ChatMessageDTO>(`/messages/${roomId}`, { content });
    return res.data;
  },
};
