import React, { createContext, useEffect, useState, type JSX } from "react";
import { authService } from "../services/authService";
import { setApiToken } from "../services/api";
import type { User } from "../types/user";

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isReady: boolean;
  login: (user: User, token: string, refreshToken: string) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const REFRESH_TOKEN_KEY = "refresh_token";

export const AuthProvider: React.FC<{
  children: JSX.Element | JSX.Element[];
}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  const login = (userData: User, tokenData: string, refreshToken: string) => {
    setUser(userData);
    setToken(tokenData);
    setApiToken(tokenData);

    // ✅ persistance
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  };

  const logout = () => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (refreshToken) {
      authService.logout(refreshToken).catch(() => {});
    }

    localStorage.removeItem(REFRESH_TOKEN_KEY);
    setUser(null);
    setToken(null);
    setApiToken(null);
  };

  const updateUser = (userData: User) => {
    setUser(userData);
  };

  // 🔁 AU CHARGEMENT (F5)
  useEffect(() => {
    (async () => {
      try {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
        if (!refreshToken) throw new Error("No refresh token");

        const res = await authService.refresh(refreshToken);

        setUser(res.user);
        setToken(res.token);
        setApiToken(res.token);

        // 🔄 rotation
        localStorage.setItem(REFRESH_TOKEN_KEY, res.refreshToken);
      } catch {
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        setUser(null);
        setToken(null);
        setApiToken(null);
      } finally {
        setIsReady(true);
      }
    })();
  }, []);

  if (!isReady) return null;

  return (
    <AuthContext.Provider
      value={{ user, token, isReady, login, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
