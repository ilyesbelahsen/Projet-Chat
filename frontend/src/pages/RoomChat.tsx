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
import { toMessage } from "../types/chat";
import type { RoomMemberDTO } from "../types/room";
import { useAuth } from "../context/useAuth";

// Map RoomMemberDTO to the shape expected by RoomSettingsModal
interface MemberUser {
  id: string;
  username: string;
}

function toMemberUser(dto: RoomMemberDTO): MemberUser {
  return {
    id: dto.userId,
    username: dto.usernameSnapshot ?? "Unknown",
  };
}

const RoomChat: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [members, setMembers] = useState<MemberUser[]>([]);
  const [isOwner, setIsOwner] = useState(false);
  const { token, user, isReady } = useAuth();

  useEffect(() => {
    if (!isReady || !token || !roomId) return;

    // 1️⃣ Récupérer messages existants
    messagesService.getMessages(roomId).then((msgs) => setMessages(msgs.map(toMessage)));

    // 2️⃣ Connexion WS
    connectSocket(token, roomId);

    // 3️⃣ S'abonner aux nouveaux messages
    const unsubscribe = onNewMessage((msg) => {
      if (String(msg.roomId) === roomId) {
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

    // 4️⃣ Récupérer room + membres
    roomsService.getRoom(roomId).then((data) => {
      setMembers(data.members.map(toMemberUser));
      setIsOwner(data.room.ownerUserId === user?.id);
    });

    return () => {
      unsubscribe();
      disconnectSocket();
    };
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
          setMembers(roomData.members.map(toMemberUser));
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
