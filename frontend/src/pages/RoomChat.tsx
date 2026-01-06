import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { Message } from "../types/chat";
import ChatLayout from "../components/ChatLayout";

const RoomChat: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    // TODO: récupérer les messages de cette room depuis le backend
  }, [roomId]);

  const handleSendMessage = (content: string) => {
    // TODO: envoyer le message via WebSocket ou API
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

  return (
    <ChatLayout
      title={`Room: ${roomId}`}
      messages={messages}
      onSendMessage={handleSendMessage}
    />
  );
};

export default RoomChat;
