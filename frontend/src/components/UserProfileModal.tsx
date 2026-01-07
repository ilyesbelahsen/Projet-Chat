import React, { useState } from "react";
import { X, Pencil } from "lucide-react";
import type { User } from "../types/user";
import { usersApi } from "../services/usersService";
import { useAuth } from "../context/useAuth";

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
  const { updateUser } = useAuth();

  const [form, setForm] = useState({
    username: user.username,
    email: user.email,
    password: user.password || "",
  });

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const updatedUser = await usersApi.updateProfile(user.id, {
        username: form.username,
        email: form.email,
        password: form.password || undefined,
      });

      updateUser(updatedUser);

      setIsEditing(false);
      onClose();
    } catch (error) {
      console.error("Erreur update profil :", error);
      alert("Erreur lors de la mise à jour du profil");
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

        <div className="space-y-4">
          {/* Username */}
          <div>
            <label className="text-sm text-gray-500">Nom d’utilisateur</label>
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

          {/* Password */}
          <div>
            <label className="text-sm text-gray-500">
              Mot de passe (nouveau)
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder={isEditing ? "Nouveau mot de passe" : "••••••••"}
              className={`w-full mt-1 p-2 border rounded ${
                isEditing ? "border-gray-300" : "border-transparent bg-gray-100"
              }`}
            />
          </div>
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
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
              >
                Annuler
              </button>

              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition"
              >
                Enregistrer
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;
