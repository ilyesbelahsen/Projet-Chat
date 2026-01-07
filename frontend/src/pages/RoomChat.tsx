import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ChatLayout from "../components/ChatLayout";
import ChatHeader from "../components/ChatHeader";
import RoomSettingsModal from "../components/RoomSettingsModal";
import { roomsService } from "../services/roomsService";
import { messagesService } from "../services/messagesService";
import type { Message } from "../types/chat";
import type { User } from "../types/user";
import {
  connectSocket,
  disconnectSocket,
  joinRoom,
  leaveRoom,
  sendMessage,
  onNewMessage,
} from "../services/socketService";
import { useAuth } from "../context/useAuth";

const RoomChat: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [members, setMembers] = useState<User[]>([]);
  const [isOwner, setIsOwner] = useState(false);
  const { token, user, isReady } = useAuth();

  useEffect(() => {
    if (!roomId) return;
    if (!isReady || !token || !user?.id) return;

    const fetchRoomData = async () => {
      try {
        const msgs = await messagesService.getMessages(roomId);
        setMessages(msgs);

        const roomData = await roomsService.getRoom(roomId);
        setMembers(roomData.members);
        setIsOwner(roomData.ownerId === user.id);

        const socketInstance = connectSocket(token);

        const subscribe = () => {
          joinRoom(roomId);
          onNewMessage((msg: Message) => {
            setMessages((prev) =>
                prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]
            );
          });
        };

        if (socketInstance.connected) {
          subscribe();
        } else {
          socketInstance.on("connect", subscribe);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchRoomData();

    return () => {
      leaveRoom(roomId);
      disconnectSocket();
    };
  }, [roomId, isReady, user?.id, token]);

  const handleSendMessage = (content: string) => {
    if (!roomId || !user?.id) return;
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
