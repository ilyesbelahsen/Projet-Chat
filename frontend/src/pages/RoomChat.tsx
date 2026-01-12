import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ChatLayout from "../components/ChatLayout";
import ChatHeader from "../components/ChatHeader";
import RoomSettingsModal from "../components/RoomSettingsModal";
import { roomsService } from "../services/roomsService";
import { messagesService } from "../services/messagesService";
import {
  connectSocket,
  disconnectSocket,
  sendMessage,
  onNewMessage,
} from "../services/websocketService";

import type { Message } from "../types/chat";
import type { User } from "../types/user";
import { useAuth } from "../context/useAuth";

const RoomChat: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [members, setMembers] = useState<User[]>([]);
  const [isOwner, setIsOwner] = useState(false);
  const { token, user, isReady } = useAuth();

  useEffect(() => {
    if (!isReady || !token || !roomId) return;

    // 1️⃣ Récupérer messages existants
    messagesService.getMessages(roomId).then((msgs) => setMessages(msgs));

    // 2️⃣ Connexion WS
    connectSocket(token, roomId);
    onNewMessage((msg) => {
      if (msg.room.id === roomId) setMessages((prev) => [...prev, msg]);
    });

    // 3️⃣ Récupérer room + membres
    roomsService.getRoom(roomId).then((room) => {
      setMembers(room.members);
      setIsOwner(room.ownerId === user?.id);
    });

    return () => disconnectSocket();
  }, [isReady, token, roomId, user?.id]);

  const handleSendMessage = (content: string) => {
    if (!roomId) return;
    sendMessage({ roomId, content });
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
            settings
          />
        }
      />
      <RoomSettingsModal
        key={members.map((m) => m.id).join("-")}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onAddMember={async (username) => {
          await roomsService.addMember(roomId!, username);
          const roomData = await roomsService.getRoom(roomId!);
          setMembers(roomData.members);
        }}
        onDeleteRoom={async () => {
          await roomsService.deleteRoom(roomId!);
        }}
        members={members}
        isOwner={isOwner}
        onRemoveMember={async (userId) => {
          await roomsService.removeMember(roomId!, userId);
          setMembers((prev) => prev.filter((m) => m.id !== userId));
        }}
        currentUserId={user?.id ?? ""}
      />
    </>
  );
};

export default RoomChat;
