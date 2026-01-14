import type { Message } from "../types/chat";
import Avatar from "./ui/Avatar";

interface MessageItemProps {
  message: Message;
}

const MessageItem = ({ message }: MessageItemProps) => {
  return (
    <div className="flex gap-3 mb-4">
      <Avatar name={message.author.username} />
      <div>
        <div className="flex items-center gap-2">
          <span className="font-semibold">{message.author.username}</span>
          <span className="text-xs text-gray-400">
            {new Date(message.createdAt).toLocaleTimeString()}
          </span>
        </div>
        <p className="text-gray-700">{message.content}</p>
      </div>
    </div>
  );
};

export default MessageItem;
