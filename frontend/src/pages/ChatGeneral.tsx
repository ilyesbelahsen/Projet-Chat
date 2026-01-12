import React, { useEffect, useState } from "react";
import ChatLayout from "../components/ChatLayout";
import { useAuth } from "../context/useAuth";
import {
  connectSocket,
  disconnectSocket,
  sendMessage,
  onNewMessage,
} from "../services/websocketService";

import type { Message } from "../types/chat";
import { roomsService } from "../services/roomsService";
import { messagesService } from "../services/messagesService";

const ChatGeneral: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [generalRoomId, setGeneralRoomId] = useState<string | null>(null);
  const { token, isReady } = useAuth();

  useEffect(() => {
    if (!isReady || !token) return;

    // 1️⃣ Récupérer room générale
    roomsService.getGeneralRoom().then((room) => {
      setGeneralRoomId(room.id);

      // 2️⃣ Récupérer messages existants
      messagesService.getMessages(room.id).then((msgs) => setMessages(msgs));

      // 3️⃣ Connexion WS
      connectSocket(token, room.id);
      onNewMessage((msg) => {
        if (msg.room.id === room.id) setMessages((prev) => [...prev, msg]);
      });
    });

    return () => disconnectSocket();
  }, [isReady, token]);

  const handleSendMessage = (content: string) => {
    if (!generalRoomId) return;
    sendMessage({ roomId: generalRoomId, content });
  };

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
