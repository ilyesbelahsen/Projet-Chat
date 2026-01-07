import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

const ForgotPassword: React.FC = () => {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [done, setDone] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        setDone(false);
        setLoading(true);

        try {
            await api.post("/auth/forgot-password", { email });
            // Toujours afficher un message neutre (anti-enumération)
            setDone(true);
        } catch (err) {
            setError("Une erreur est survenue. Réessaie plus tard.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <form
                onSubmit={handleSubmit}
                className="bg-white p-8 rounded shadow-md w-full max-w-sm"
            >
                <h2 className="text-2xl font-bold mb-4">Mot de passe oublié</h2>

                {done ? (
                    <div className="text-sm">
                        <p className="mb-4">
                            Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.
                        </p>
                        <button
                            type="button"
                            className="w-full p-2 rounded text-white bg-blue-500 hover:bg-blue-600"
                            onClick={() => navigate("/login")}
                        >
                            Retour à la connexion
                        </button>
                    </div>
                ) : (
                    <>
                        {error && <p className="text-red-500 mb-4">{error}</p>}

                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-2 mb-4 border rounded"
                            required
                        />

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full p-2 rounded text-white ${
                                loading ? "bg-blue-300" : "bg-blue-500 hover:bg-blue-600"
                            }`}
                        >
                            {loading ? "Envoi..." : "Envoyer le lien"}
                        </button>

                        <p
                            className="text-sm text-center mt-4 text-blue-500 cursor-pointer"
                            onClick={() => navigate("/login")}
                        >
                            Retour à la connexion
                        </p>
                    </>
                )}
            </form>
        </div>
    );
};

export default ForgotPassword;
