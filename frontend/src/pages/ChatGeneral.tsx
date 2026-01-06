import React, { useEffect, useState } from "react";
import ChatLayout from "../components/ChatLayout";
import type { Message } from "../types/chat";
import { messagesService } from "../services/messagesService";
import { roomsService } from "../services/roomsService";
import {
  connectSocket,
  disconnectSocket,
  joinRoom,
  leaveRoom,
  sendMessage,
  onNewMessage,
} from "../services/socketService";

const ChatGeneral: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [generalRoomId, setGeneralRoomId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState("");

  useEffect(() => {
    const fetchGeneralRoom = async () => {
      try {
        const room = await roomsService.getGeneralRoom();
        setGeneralRoomId(room.id);

        const msgs = await messagesService.getMessages(room.id);
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

        const userId = localStorage.getItem("user")
          ? JSON.parse(localStorage.getItem("user")!).id
          : "";
        setCurrentUserId(userId);

        const socketInstance = connectSocket(userId);
        socketInstance.on("connect", () => {
          joinRoom(room.id);
          onNewMessage((msg: Message) => {
            setMessages((prev) =>
              prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]
            );
          });
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchGeneralRoom();

    return () => {
      if (generalRoomId) leaveRoom(generalRoomId);
      disconnectSocket();
    };
  }, []);

  const handleSendMessage = (content: string) => {
    if (!generalRoomId) return;
    sendMessage({ roomId: generalRoomId, content, userId: currentUserId });
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
