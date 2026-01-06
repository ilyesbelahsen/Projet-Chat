import { useState } from "react";
import type { Message } from "../types/chat";
import ChatLayout from "../components/ChatLayout";

const ChatGeneral = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Bienvenue sur le chat général 👋",
      author: { id: "system", username: "System" },
      created_at: new Date().toISOString(),
    },
  ]);

  const handleSendMessage = (content: string) => {
    const newMessage: Message = {
      id: crypto.randomUUID(),
      content,
      author: { id: "me", username: "Moi" },
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMessage]);
  };

  return (
    <ChatLayout
      title="Chat Général"
      messages={messages}
      onSendMessage={handleSendMessage}
    />
  );
};

export default ChatGeneral;
