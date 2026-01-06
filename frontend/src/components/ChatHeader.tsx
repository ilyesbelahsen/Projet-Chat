import { MessageCircle, Settings } from "lucide-react";

interface ChatHeaderProps {
  title: string;
  onOpenSettings?: () => void;
}

const ChatHeader = ({ title, onOpenSettings }: ChatHeaderProps) => {
  return (
    <div className="h-16 bg-white shadow flex items-center justify-between px-6">
      <div className="flex items-center">
        <MessageCircle className="text-blue-600 mr-3" />
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>

      <button
        onClick={onOpenSettings}
        className="p-2 rounded hover:bg-gray-200 transition"
        title="Paramètres de la room"
      >
        <Settings className="w-5 h-5 text-gray-600" />
      </button>
    </div>
  );
};

export default ChatHeader;
