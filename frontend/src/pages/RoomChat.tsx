import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Message } from "../types/chat";
import type { User } from "../types/user";
import ChatLayout from "../components/ChatLayout";
import ChatHeader from "../components/ChatHeader";
import RoomSettingsModal from "../components/RoomSettingsModal";
import { roomsService } from "../services/roomsService";

const RoomChat: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<Message[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [members, setMembers] = useState<User[]>([]);
  const [isOwner, setIsOwner] = useState(false);
  const [currentUserId, setCurrentUserId] = useState("");

  useEffect(() => {
    if (!roomId) return;

    // TODO: récupérer les messages depuis le backend
    // setMessages(...);

    // Récupérer les membres et vérifier si je suis owner
    const fetchRoomData = async () => {
      try {
        const roomData = await roomsService.getRoom(roomId); // retourne { members, ownerId }
        setMembers(roomData.members);

        const currentUserId = localStorage.getItem("user")
          ? JSON.parse(localStorage.getItem("user")!).id
          : null;
        setCurrentUserId(currentUserId);
        setIsOwner(roomData.ownerId === currentUserId);
      } catch (err) {
        console.error(err);
      }
    };

    fetchRoomData();
  }, [roomId]);

  // Envoyer un message
  const handleSendMessage = (content: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        roomId: roomId!,
        author: { id: "me", username: "Moi" },
        content,
        type: "text",
        createdAt: new Date().toISOString(),
      },
    ]);
  };

  // Ajouter membre
  // Ajouter membre
  const handleAddMember = async (username: string) => {
    try {
      await roomsService.addMember(roomId!, username);

      // Re-fetch des membres depuis le backend pour être sûr que tout est à jour
      const roomData = await roomsService.getRoom(roomId!);
      setMembers(roomData.members);
    } catch (err) {
      console.error(err);
    }
  };

  // Supprimer membre
  const handleRemoveMember = async (userId: string) => {
    try {
      await roomsService.removeMember(roomId!, userId);
      setMembers((prev) => prev.filter((m) => m.id !== userId));
    } catch (err) {
      console.error(err);
    }
  };

  // Supprimer room
  const handleDeleteRoom = async () => {
    try {
      await roomsService.deleteRoom(roomId!);

      navigate("/my-rooms");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <ChatLayout
        title={`Room: ${roomId}`}
        messages={messages}
        onSendMessage={handleSendMessage}
        header={
          <ChatHeader
            title={`Room: ${roomId}`}
            onOpenSettings={() => setModalOpen(true)}
          />
        }
      />

      <RoomSettingsModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onAddMember={handleAddMember}
        onDeleteRoom={handleDeleteRoom}
        members={members}
        isOwner={isOwner}
        onRemoveMember={handleRemoveMember}
        currentUserId={currentUserId}
      />
    </>
  );
};

export default RoomChat;
