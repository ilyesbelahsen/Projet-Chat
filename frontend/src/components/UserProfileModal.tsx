import React, { useState } from "react";
import { X, Pencil } from "lucide-react";
import type { User } from "../types/user";
import { usersApi } from "../services/usersService";
import { useAuth } from "../context/useAuth";
import { AxiosError } from "axios";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { updateUser } = useAuth();

  const [form, setForm] = useState({
    username: user.username,
    email: user.email,
    currentPassword: "",
    password: "",
    confirmPassword: "",
  });

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(null); // Effacer l'erreur quand l'utilisateur modifie
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError(null);
    // Reset form to original values
    setForm({
      username: user.username,
      email: user.email,
      currentPassword: "",
      password: "",
      confirmPassword: "",
    });
  };

  const handleSave = async () => {
    setError(null);

    // Validation côté client pour le mot de passe
    if (form.password) {
      if (!form.currentPassword) {
        setError("Veuillez entrer votre mot de passe actuel");
        return;
      }
      if (form.password !== form.confirmPassword) {
        setError("Les nouveaux mots de passe ne correspondent pas");
        return;
      }
      if (form.password.length < 6) {
        setError("Le nouveau mot de passe doit contenir au moins 6 caractères");
        return;
      }
    }

    setLoading(true);

    try {
      const payload: {
        username?: string;
        email?: string;
        currentPassword?: string;
        password?: string;
      } = {};

      // N'envoyer que les champs modifiés
      if (form.username !== user.username) {
        payload.username = form.username;
      }
      if (form.email !== user.email) {
        payload.email = form.email;
      }
      if (form.password) {
        payload.currentPassword = form.currentPassword;
        payload.password = form.password;
      }

      // Si rien n'a changé, fermer simplement
      if (Object.keys(payload).length === 0) {
        setIsEditing(false);
        return;
      }

      const updatedUser = await usersApi.updateProfile(user.id, payload);
      updateUser(updatedUser);

      // Reset password fields
      setForm((prev) => ({
        ...prev,
        currentPassword: "",
        password: "",
        confirmPassword: "",
      }));

      setIsEditing(false);
      onClose();
    } catch (err) {
      console.error("Erreur update profil :", err);
      if (err instanceof AxiosError && err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Erreur lors de la mise à jour du profil");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-semibold mb-4">Mon Profil</h2>

        {/* Message d'erreur */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Username */}
          <div>
            <label className="text-sm text-gray-500">Nom d'utilisateur</label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              disabled={!isEditing}
              className={`w-full mt-1 p-2 border rounded ${
                isEditing ? "border-gray-300" : "border-transparent bg-gray-100"
              }`}
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-sm text-gray-500">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              disabled={!isEditing}
              className={`w-full mt-1 p-2 border rounded ${
                isEditing ? "border-gray-300" : "border-transparent bg-gray-100"
              }`}
            />
          </div>

          {/* Section mot de passe (visible uniquement en mode édition) */}
          {isEditing && (
            <>
              <hr className="my-4" />
              <p className="text-sm text-gray-500 mb-2">
                Changer le mot de passe (optionnel)
              </p>

              {/* Current Password */}
              <div>
                <label className="text-sm text-gray-500">
                  Mot de passe actuel
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={form.currentPassword}
                  onChange={handleChange}
                  placeholder="Entrez votre mot de passe actuel"
                  className="w-full mt-1 p-2 border border-gray-300 rounded"
                />
              </div>

              {/* New Password */}
              <div>
                <label className="text-sm text-gray-500">
                  Nouveau mot de passe
                </label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Entrez le nouveau mot de passe"
                  className="w-full mt-1 p-2 border border-gray-300 rounded"
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="text-sm text-gray-500">
                  Confirmer le nouveau mot de passe
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Ressaisissez le nouveau mot de passe"
                  className={`w-full mt-1 p-2 border rounded ${
                    form.confirmPassword &&
                    form.password !== form.confirmPassword
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300"
                  }`}
                />
                {form.confirmPassword &&
                  form.password !== form.confirmPassword && (
                    <p className="text-xs text-red-500 mt-1">
                      Les mots de passe ne correspondent pas
                    </p>
                  )}
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-3">
          {!isEditing ? (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
              >
                Fermer
              </button>

              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition"
              >
                <Pencil className="w-4 h-4" />
                Modifier
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleCancel}
                disabled={loading}
                className="px-4 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition disabled:opacity-50"
              >
                Annuler
              </button>

              <button
                onClick={handleSave}
                disabled={loading}
                className="px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition disabled:opacity-50"
              >
                {loading ? "Enregistrement..." : "Enregistrer"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;
