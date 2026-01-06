import type { User } from "../types/user";

const API_URL = "http://localhost:3000";

interface AuthResponse {
  user: User;
  token: string;
}

export const authService = {
  async signup(
    username: string,
    email: string,
    password: string
  ): Promise<AuthResponse> {
    const res = await fetch(`${API_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Erreur lors de l'inscription");
    }
    return res.json();
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Erreur lors de la connexion");
    }
    return res.json();
  },
};
