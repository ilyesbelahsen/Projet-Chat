import type { User } from "../types/user";
import { api } from "./api";

export interface UpdateUserPayload {
  username?: string;
  email?: string;
  password?: string;
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
