import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import type { Message } from "../types/chat";

interface ChatLayoutProps {
  title: string;
  messages: Message[];
  onSendMessage: (content: string) => void;
  header?: React.ReactNode; // <-- ajouté
  settings?: boolean;
}

const ChatLayout = ({
  title,
  messages,
  onSendMessage,
  header,
  settings,
}: ChatLayoutProps) => {
  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Si on fournit un header custom, on l'utilise, sinon header par défaut */}
      {header || <ChatHeader settings={settings} title={title} />}

      <div className="flex-1 overflow-y-auto px-6 py-4">
        <MessageList messages={messages} />
      </div>

      <MessageInput onSend={onSendMessage} />
    </div>
  );
};

export default ChatLayout;
