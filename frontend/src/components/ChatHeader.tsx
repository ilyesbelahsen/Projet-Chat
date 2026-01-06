import { MessageCircle } from "lucide-react";

interface ChatHeaderProps {
  title: string;
}

const ChatHeader = ({ title }: ChatHeaderProps) => {
  return (
    <div className="h-16 bg-white shadow flex items-center px-6">
      <MessageCircle className="text-blue-600 mr-3" />
      <h2 className="text-lg font-semibold">{title}</h2>
    </div>
  );
};

export default ChatHeader;
