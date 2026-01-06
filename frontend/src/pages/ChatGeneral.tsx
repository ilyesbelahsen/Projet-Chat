import React, { useEffect, useState } from "react";
import ChatLayout from "../components/ChatLayout";
import type { Message } from "../types/chat";
import { messagesService } from "../services/messagesService";
import { roomsService } from "../services/roomsService";

const ChatGeneral: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [generalRoomId, setGeneralRoomId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGeneralRoom = async () => {
      try {
        // 1️⃣ Récupérer la room générale
        const room = await roomsService.getGeneralRoom();
        setGeneralRoomId(room.id);

        // 2️⃣ Récupérer les messages depuis la BDD
        const msgs = await messagesService.getMessages(room.id);

        // 3️⃣ Ajouter le message système uniquement s'il n'existe pas
        const messagesWithSystem = msgs.some((msg) => msg.id === "system-1")
          ? msgs
          : [
              {
                id: "system-1",
                content: "Bienvenue sur le chat général 👋",
                author: { id: "system", username: "System" },
                created_at: new Date().toISOString(),
              },
              ...msgs,
            ];

        setMessages(messagesWithSystem);
      } catch (err) {
        console.error("Erreur lors du chargement de la room générale :", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGeneralRoom();
  }, []);

  // Envoyer un message
  const handleSendMessage = async (content: string) => {
    if (!generalRoomId) return;

    try {
      const newMessage = await messagesService.sendMessage(
        generalRoomId,
        content
      );

      // Ajouter le message seulement s'il n'existe pas déjà
      setMessages((prev) =>
        prev.some((msg) => msg.id === newMessage.id)
          ? prev
          : [...prev, newMessage]
      );
    } catch (err) {
      console.error("Erreur lors de l'envoi du message :", err);
      alert("Impossible d'envoyer le message");
    }
  };

  if (loading) return <div>Chargement du chat général...</div>;

  return (
    <ChatLayout
      settings={false}
      title="Chat Général"
      messages={messages}
      onSendMessage={handleSendMessage}
    />
  );
};

export default ChatGeneral;
