import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Message } from "../types/chat";
import type { User } from "../types/user";
import ChatLayout from "../components/ChatLayout";
import ChatHeader from "../components/ChatHeader";
import RoomSettingsModal from "../components/RoomSettingsModal";
import { roomsService } from "../services/roomsService";
import { messagesService } from "../services/messagesService";

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

    // Charger les messages + membres
    const fetchRoomData = async () => {
      try {
        // 1️⃣ Charger les messages
        const msgs = await messagesService.getMessages(roomId);
        setMessages(msgs);

        // 2️⃣ Charger les membres et owner
        const roomData = await roomsService.getRoom(roomId); // doit retourner { members, ownerId }
        setMembers(roomData.members);

        const userId = localStorage.getItem("user")
          ? JSON.parse(localStorage.getItem("user")!).id
          : "";
        setCurrentUserId(userId);
        setIsOwner(roomData.ownerId === userId);
      } catch (err) {
        console.error(err);
        alert("Erreur lors du chargement de la room");
      }
    };

    fetchRoomData();
  }, [roomId]);

  // Envoyer un message
  const handleSendMessage = async (content: string) => {
    try {
      const newMessage = await messagesService.sendMessage(roomId!, content);
      setMessages((prev) => [...prev, newMessage]);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'envoi du message");
    }
  };

  // Ajouter membre
  const handleAddMember = async (username: string) => {
    try {
      const newMember = await roomsService.addMember(roomId!, username);
      setMembers((prev) => [...prev, newMember]);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'ajout du membre");
    }
  };

  // Supprimer membre
  const handleRemoveMember = async (userId: string) => {
    try {
      await roomsService.removeMember(roomId!, userId);
      setMembers((prev) => prev.filter((m) => m.id !== userId));
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la suppression du membre");
    }
  };

  // Supprimer room
  const handleDeleteRoom = async () => {
    try {
      await roomsService.deleteRoom(roomId!);
      navigate("/my-rooms");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la suppression de la room");
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
