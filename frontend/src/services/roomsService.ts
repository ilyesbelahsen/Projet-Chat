import type { Room } from "../types/room";
import { api } from "./api";

export const roomsService = {
  // Récupérer toutes les rooms de l'utilisateur
  async getUserRooms(): Promise<Room[]> {
    const res = await api.get<Room[]>("/rooms/my-rooms");
    return res.data;
  },

  // Créer une nouvelle room
  async createRoom(name: string): Promise<Room> {
    const res = await api.post<Room>("/rooms/create", { name });
    return res.data;
  },
};
