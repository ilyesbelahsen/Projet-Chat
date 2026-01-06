import React, { useState } from "react";
import { UserMinus } from "lucide-react"; // icône pour supprimer un membre

interface User {
  id: string;
  username: string;
}

interface RoomSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMember: (username: string) => void;
  onDeleteRoom: () => void;
  members: User[]; // liste des membres de la room
  isOwner: boolean; // si l'utilisateur actuel est le propriétaire
  onRemoveMember?: (userId: string) => void; // optionnel, utilisé si isOwner
  currentUserId: string; // <-- ton id actuel
}

const RoomSettingsModal: React.FC<RoomSettingsModalProps> = ({
  isOpen,
  onClose,
  onAddMember,
  onDeleteRoom,
  members,
  isOwner,
  onRemoveMember,
  currentUserId,
}) => {
  const [username, setUsername] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-96 max-h-[80vh] overflow-y-auto">
        <h3 className="text-lg font-bold mb-4">Paramètres de la room</h3>

        {/* Ajouter membre */}
        {isOwner && (
          <div className="mb-4">
            <label className="block text-gray-700 mb-1">
              Ajouter un membre
            </label>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border rounded px-3 py-2 mb-2 focus:outline-none focus:ring focus:ring-blue-300"
            />
            <button
              onClick={() => {
                if (username.trim()) {
                  onAddMember(username.trim());
                  setUsername("");
                }
              }}
              className="w-full bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition"
            >
              Ajouter
            </button>
          </div>
        )}

        {/* Liste des membres */}
        <div className="mb-4">
          <h4 className="font-semibold mb-2">Membres</h4>
          <ul className="space-y-1">
            {members.map((member) => (
              <li
                key={member.id}
                className="flex justify-between items-center border-b py-1"
              >
                <span>{member.username}</span>
                {isOwner && member.id !== currentUserId && onRemoveMember && (
                  <button
                    onClick={() => onRemoveMember(member.id)}
                    className="text-red-500 hover:text-red-700"
                    title="Supprimer le membre"
                  >
                    <UserMinus size={18} />
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Supprimer room */}
        {isOwner && (
          <button
            onClick={onDeleteRoom}
            className="w-full bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 transition mb-2"
          >
            Supprimer la room
          </button>
        )}

        {/* Fermer */}
        <button
          onClick={onClose}
          className="w-full bg-gray-200 text-gray-800 px-3 py-2 rounded hover:bg-gray-300 transition"
        >
          Fermer
        </button>
      </div>
    </div>
  );
};

export default RoomSettingsModal;
