import React, { createContext, useEffect, useState, type JSX } from "react";
import type { User } from "../types/chat"; // garde ton import actuel si c’est celui que tu utilises
import { authService } from "../services/authService";
import { setApiToken } from "../services/api";

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isReady: boolean; // important
  login: (user: User, token: string) => void;
  logout: () => void; // on garde void pour ne pas casser tes composants
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{
  children: JSX.Element | JSX.Element[];
}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  const login = (userData: User, tokenData: string) => {
    setUser(userData);
    setToken(tokenData);
    setApiToken(tokenData);
  };

  const logout = () => {
    // logout côté backend (révoque refresh token) + clear côté front
    authService.logout().catch(() => {});
    setUser(null);
    setToken(null);
    setApiToken(null);
  };

  // Au chargement: on tente un refresh via cookie httpOnly
  useEffect(() => {
    (async () => {
      try {
        const res = await authService.refresh();
        setUser(res.user);
        setToken(res.token);
        setApiToken(res.token);
      } catch {
        setUser(null);
        setToken(null);
        setApiToken(null);
      } finally {
        setIsReady(true);
      }
    })();
  }, []);

  // Tant que refresh pas tenté, on ne rend rien (évite les redirects “faux logout”)
  if (!isReady) return null;

  return (
      <AuthContext.Provider value={{ user, token, isReady, login, logout }}>
        {children}
      </AuthContext.Provider>
  );
};

export default AuthContext;
