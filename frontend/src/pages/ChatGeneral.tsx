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
import { toMessage } from "../types/chat";
import { roomsService } from "../services/roomsService";
import { messagesService } from "../services/messagesService";

const ChatGeneral: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [generalRoomId, setGeneralRoomId] = useState<number | null>(null);
  const { token, isReady } = useAuth();

  useEffect(() => {
    if (!isReady || !token) return;

    let unsubscribe: (() => void) | undefined;
    let currentRoomId: number | undefined;

    // 1️⃣ Récupérer room générale
    roomsService.getGeneralRoom().then((room) => {
      currentRoomId = room.id;
      setGeneralRoomId(room.id);

      // 2️⃣ Récupérer messages existants
      messagesService.getMessages(room.id).then((msgs) => setMessages(msgs.map(toMessage)));

      // 3️⃣ Connexion WS
      connectSocket(token, String(room.id));

      // 4️⃣ S'abonner aux nouveaux messages
      unsubscribe = onNewMessage((msg) => {
        if (msg.roomId === currentRoomId) {
          const newMsg: Message = {
            id: msg.id,
            roomId: msg.roomId,
            userId: msg.userId,
            content: msg.content,
            createdAt: msg.createdAt,
            author: { id: msg.userId, username: msg.username ?? "Unknown" },
          };
          setMessages((prev) => [...prev, newMsg]);
        }
      });
    });

    return () => {
      unsubscribe?.();
      disconnectSocket();
    };
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
