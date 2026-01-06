import { useState } from "react";
import { Send } from "lucide-react";

interface MessageInputProps {
  onSend: (content: string) => void;
}

const MessageInput = ({ onSend }: MessageInputProps) => {
  const [value, setValue] = useState("");

  const handleSend = () => {
    if (!value.trim()) return;
    onSend(value);
    setValue("");
  };

  return (
    <div className="bg-white px-6 py-4 border-t flex gap-3">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Écrire un message..."
        className="flex-1 rounded-lg border px-4 py-2 focus:ring focus:ring-blue-300 outline-none"
      />
      <button
        onClick={handleSend}
        className="bg-blue-600 text-white px-4 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
      >
        <Send size={18} />
        Envoyer
      </button>
    </div>
  );
};

export default MessageInput;
