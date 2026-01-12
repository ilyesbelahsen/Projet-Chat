import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { authService } from "../services/authService";

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [isSignup, setIsSignup] = useState(false);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const getLoginErrorMessage = (err: unknown) => {
    const anyErr = err as any;
    const status = anyErr?.response?.status;
    const backendMsg = anyErr?.response?.data?.message;

    // on ne révèle pas si l’email existe
    if (status === 401 || status === 404)
      return "Email et/ou mot de passe incorrect.";
    if (typeof backendMsg === "string" && backendMsg.length > 0)
      return backendMsg;

    return "Une erreur est survenue. Réessaie plus tard.";
  };

  const getSignupErrorMessage = (err: unknown) => {
    const anyErr = err as any;
    const status = anyErr?.response?.status;
    const backendMsg = anyErr?.response?.data?.message;

    // ex: email déjà utilisé
    if (status === 400) {
      if (typeof backendMsg === "string" && backendMsg.length > 0)
        return backendMsg;
      return "Impossible de créer le compte. Vérifie les informations saisies.";
    }

    if (typeof backendMsg === "string" && backendMsg.length > 0)
      return backendMsg;
    return "Une erreur est survenue lors de la création du compte.";
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    try {
      const res = isSignup
        ? await authService.signup(username, email, password)
        : await authService.login(email, password);

      login(res.user, res.token, res.refreshToken);

      navigate("/");
    } catch (err) {
      setError(
        isSignup ? getSignupErrorMessage(err) : getLoginErrorMessage(err)
      );
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow-md w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold mb-4">
          {isSignup ? "Créer un compte" : "Connexion"}
        </h2>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        {isSignup && (
          <input
            type="text"
            placeholder="Nom d'utilisateur"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 mb-4 border rounded"
            required
          />
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
          required
        />

        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
          required
        />

        {!isSignup && (
          <p
            className="text-sm text-right mb-4 text-blue-500 cursor-pointer"
            onClick={() => navigate("/forgot-password")}
          >
            Mot de passe oublié ?
          </p>
        )}

        <button
          type="submit"
          className={`w-full p-2 rounded text-white ${
            isSignup
              ? "bg-green-500 hover:bg-green-600"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {isSignup ? "Créer un compte" : "Se connecter"}
        </button>

        <p
          className="text-sm text-center mt-4 text-blue-500 cursor-pointer"
          onClick={() => setIsSignup(!isSignup)}
        >
          {isSignup
            ? "Déjà un compte ? Se connecter"
            : "Pas de compte ? Créer un compte"}
        </p>
      </form>
    </div>
  );
};

export default LoginPage;
