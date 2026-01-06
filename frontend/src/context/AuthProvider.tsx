import React, { createContext, useState, useEffect, type JSX } from "react";

// Définition du type User
export interface User {
  id: string;
  username: string;
  email: string;
}

// Définition du contexte
export interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
}

// Création du contexte
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider
export const AuthProvider: React.FC<{
  children: JSX.Element | JSX.Element[];
}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  // Charger user depuis localStorage au démarrage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
