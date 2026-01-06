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

const RoomChat: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [members, setMembers] = useState<User[]>([]);
  const [isOwner, setIsOwner] = useState(false);
  const [currentUserId, setCurrentUserId] = useState("");

  useEffect(() => {
    if (!roomId) return;

    const fetchRoomData = async () => {
      try {
        const msgs = await messagesService.getMessages(roomId);
        setMessages(msgs);

        const roomData = await roomsService.getRoom(roomId);
        setMembers(roomData.members);

        const userId = localStorage.getItem("user")
          ? JSON.parse(localStorage.getItem("user")!).id
          : "";
        setCurrentUserId(userId);
        setIsOwner(roomData.ownerId === userId);

        const socketInstance = connectSocket(userId);
        socketInstance.on("connect", () => {
          joinRoom(roomId);
          onNewMessage((msg: Message) => {
            setMessages((prev) =>
              prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]
            );
          });
        });
      } catch (err) {
        console.error(err);
      }
    };

    fetchRoomData();

    return () => {
      if (roomId) leaveRoom(roomId);
      disconnectSocket();
    };
  }, [roomId]);

  const handleSendMessage = (content: string) => {
    if (!roomId) return;
    sendMessage({ roomId, content, userId: currentUserId });
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
        currentUserId={currentUserId}
      />
    </>
  );
};

export default RoomChat;
