import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../services/api";

const ResetPassword: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const token = useMemo(() => {
        const params = new URLSearchParams(location.search);
        return params.get("token") ?? "";
    }, [location.search]);

    const [newPassword, setNewPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [error, setError] = useState("");
    const [done, setDone] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");

        if (!token) {
            setError("Lien invalide : token manquant.");
            return;
        }
        if (newPassword.length < 8) {
            setError("Le mot de passe doit faire au moins 8 caractères.");
            return;
        }
        if (newPassword !== confirm) {
            setError("Les mots de passe ne correspondent pas.");
            return;
        }

        setLoading(true);
        try {
            await api.post("/auth/reset-password", {
                token,
                newPassword,
            });
            setDone(true);
        } catch {
            setError("Lien invalide ou expiré. Refais une demande de réinitialisation.");
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
                <h2 className="text-2xl font-bold mb-4">Nouveau mot de passe</h2>

                {done ? (
                    <>
                        <p className="mb-4 text-sm">
                            Ton mot de passe a été mis à jour. Tu peux maintenant te connecter.
                        </p>
                        <button
                            type="button"
                            className="w-full p-2 rounded text-white bg-blue-500 hover:bg-blue-600"
                            onClick={() => navigate("/login")}
                        >
                            Aller à la connexion
                        </button>
                    </>
                ) : (
                    <>
                        {error && <p className="text-red-500 mb-4">{error}</p>}

                        <input
                            type="password"
                            placeholder="Nouveau mot de passe"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full p-2 mb-4 border rounded"
                            required
                        />

                        <input
                            type="password"
                            placeholder="Confirmer le mot de passe"
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                            className="w-full p-2 mb-4 border rounded"
                            required
                        />

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full p-2 rounded text-white ${
                                loading ? "bg-green-300" : "bg-green-500 hover:bg-green-600"
                            }`}
                        >
                            {loading ? "Validation..." : "Valider"}
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

export default ResetPassword;
