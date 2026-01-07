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
import { useAuth } from "../context/useAuth";

const ChatGeneral: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [generalRoomId, setGeneralRoomId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { token, isReady, user } = useAuth();

  useEffect(() => {
    if (!isReady || !token || !user?.id) return;

    let roomIdLocal: string | null = null;

    const fetchGeneralRoom = async () => {
      try {
        const room = await roomsService.getGeneralRoom();
        roomIdLocal = room.id;
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

        const socketInstance = connectSocket(token);
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
      if (roomIdLocal) leaveRoom(roomIdLocal);
      disconnectSocket();
    };
  }, [isReady, user?.id, token]);

  const handleSendMessage = (content: string) => {
    if (!generalRoomId || !user?.id) return;
    sendMessage({ roomId: generalRoomId, content });
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
