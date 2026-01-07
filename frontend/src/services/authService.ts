import { api } from "./api";
import type { User } from "../types/user"; // ou ton type user actuel

export type AuthResponse = { user: User; token: string };

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>("/auth/login", { email, password });
    return res.data;
  },

  async signup(username: string, email: string, password: string): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>("/auth/signup", { username, email, password });
    return res.data;
  },

  async refresh(): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>("/auth/refresh");
    return res.data;
  },

  async logout(): Promise<void> {
    await api.post("/auth/logout");
  },
};
