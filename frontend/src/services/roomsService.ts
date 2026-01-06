import type { Room } from "../types/room";
import type { User } from "../types/user";
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

  // Supprimer une room
  async deleteRoom(roomId: string): Promise<void> {
    await api.delete(`/rooms/${roomId}`);
  },

  // Ajouter un membre à une room par username
  async addMember(roomId: string, username: string): Promise<User> {
    const res = await api.post<User>(`/rooms/${roomId}/add-member`, {
      username,
    });
    return res.data; // retourne le membre ajouté
  },

  // Supprimer un membre d'une room
  async removeMember(roomId: string, userId: string): Promise<void> {
    await api.delete(`/rooms/${roomId}/members/${userId}`);
  },

  // Récupérer les infos d'une room (membres + owner)
  async getRoom(roomId: string): Promise<{ ownerId: string; members: User[] }> {
    const res = await api.get<{ ownerId: string; members: User[] }>(
      `/rooms/${roomId}`
    );
    return res.data;
  },
};
