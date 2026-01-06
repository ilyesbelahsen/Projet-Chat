import { MessageCircle, Settings, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ChatHeaderProps {
  title: string;
  onOpenSettings?: () => void;
  settings?: boolean;
}

const ChatHeader = ({ title, onOpenSettings, settings }: ChatHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="h-16 bg-white shadow flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        {/* Flèche retour */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-gray-700 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Icône + titre */}
        <MessageCircle className="text-blue-600" />
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>

      {/* Bouton settings */}
      <button
        onClick={onOpenSettings}
        className="p-2 rounded hover:bg-gray-200 transition"
        title="Paramètres de la room"
      >
        {settings && <Settings className="w-5 h-5 text-gray-600" />}
      </button>
    </div>
  );
};

export default ChatHeader;
