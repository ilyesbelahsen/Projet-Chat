import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Frontend only : on simule l'authentification
    const fakeUser = { id: crypto.randomUUID(), username, email };
    login(fakeUser);
    navigate("/"); // Redirige vers home après login
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">
          {mode === "login" ? "Se connecter" : "S’inscrire"}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <input
              type="text"
              placeholder="Nom d'utilisateur"
              className="w-full p-3 border rounded"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          )}
          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 border rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded"
          >
            {mode === "login" ? "Se connecter" : "S’inscrire"}
          </button>
        </form>
        <p className="mt-4 text-center text-gray-500">
          {mode === "login" ? "Pas de compte ?" : "Déjà un compte ?"}{" "}
          <button
            className="text-blue-500 underline"
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
          >
            {mode === "login" ? "S’inscrire" : "Se connecter"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
