import { api } from "./api";
import type { User } from "../types/user";

export type AuthResponse = {
  user: User;
  token: string;
  refreshToken: string;
};

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>("/auth/login", {
      email,
      password,
    });
    return res.data;
  },

  async signup(
    username: string,
    email: string,
    password: string
  ): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>("/auth/signup", {
      username,
      email,
      password,
    });
    return res.data;
  },

  async refresh(refreshToken: string): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>("/auth/refresh", {
      refreshToken,
    });
    return res.data;
  },

  async logout(refreshToken: string): Promise<void> {
    await api.post("/auth/logout", { refreshToken });
  },
};
