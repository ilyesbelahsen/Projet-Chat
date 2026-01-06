import type { Message } from "../types/chat";
import MessageItem from "./MessageItem";

interface MessageListProps {
  messages: Message[];
}

const MessageList = ({ messages }: MessageListProps) => {
  return (
    <>
      {messages.map((msg) => (
        <MessageItem key={msg.id} message={msg} />
      ))}
    </>
  );
};

export default MessageList;
