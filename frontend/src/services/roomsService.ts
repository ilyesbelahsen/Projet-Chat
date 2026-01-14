// frontend/src/services/roomsService.ts
import type { Room, RoomDetailsDTO } from "../types/room";
import { api } from "./api";

export const roomsService = {
  async getGeneralRoom(): Promise<Room> {
    const res = await api.get<Room>("/rooms/general");
    return res.data;
  },

  async getUserRooms(): Promise<Room[]> {
    const res = await api.get<Room[]>("/rooms/my-rooms");
    return res.data;
  },

  async createRoom(name: string): Promise<Room> {
    const res = await api.post<Room>("/rooms/create", { name });
    return res.data;
  },

  async deleteRoom(roomId: number | string): Promise<{ ok: true }> {
    const res = await api.delete<{ ok: true }>(`/rooms/${roomId}`);
    return res.data;
  },

  // ✅ Backend: POST /rooms/:id/add-member body { username }
  async addMember(roomId: number | string, username: string): Promise<{ ok: true }> {
    const res = await api.post<{ ok: true }>(`/rooms/${roomId}/add-member`, { username });
    return res.data;
  },

  async removeMember(roomId: number | string, userId: string): Promise<{ ok: true }> {
    const res = await api.delete<{ ok: true }>(`/rooms/${roomId}/members/${userId}`);
    return res.data;
  },

  // ✅ Backend: GET /rooms/:id => { room, members }
  async getRoom(roomId: number | string): Promise<RoomDetailsDTO> {
    const res = await api.get<RoomDetailsDTO>(`/rooms/${roomId}`);
    return res.data;
  },
};
