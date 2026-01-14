import type { User } from "../types/user";
import { api } from "./api";

export interface UpdateUserPayload {
  username?: string;
  email?: string;
  currentPassword?: string;  // Ancien mot de passe (requis si on change le password)
  password?: string;         // Nouveau mot de passe
}

export const usersApi = {
  updateProfile: async (
    userId: string,
    payload: UpdateUserPayload
  ): Promise<User> => {
    const { data } = await api.patch<User>(`/users/${userId}`, payload);
    return data;
  },

  getById: async (userId: string): Promise<User> => {
    const { data } = await api.get<User>(`/users/${userId}`);
    return data;
  },
};
