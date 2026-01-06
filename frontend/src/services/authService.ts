import type { User } from "../types/user";
import { api } from "./api";
import { AxiosError } from "axios";

export interface AuthResponse {
  user: User;
  token: string;
}

export const authService = {
  async signup(
    username: string,
    email: string,
    password: string
  ): Promise<AuthResponse> {
    try {
      const res = await api.post<AuthResponse>("/auth/signup", {
        username,
        email,
        password,
      });
      return res.data;
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        // On récupère le message retourné par le backend
        throw new Error(
          err.response?.data?.message || "Erreur lors de l'inscription"
        );
      }
      throw new Error("Erreur lors de l'inscription");
    }
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const res = await api.post<AuthResponse>("/auth/login", {
        email,
        password,
      });
      return res.data;
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        throw new Error(
          err.response?.data?.message || "Erreur lors de la connexion"
        );
      }
      throw new Error("Erreur lors de la connexion");
    }
  },
};
