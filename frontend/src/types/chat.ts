// frontend/src/types/chat.ts
export type MessageType = "TEXT" | "FILE";

export interface ChatMessageDTO {
  id: number;
  roomId: number;
  userId: string;
  usernameSnapshot: string | null;
  type: MessageType;
  content: string | null;
  fileUrl: string | null;
  createdAt: string; // ISO string
}

// Alias for components - maps backend DTO to frontend-friendly format
export interface Message {
  id: number;
  roomId: number;
  userId: string;
  content: string | null;
  createdAt: string;
  author: {
    id: string;
    username: string;
  };
}

// Helper to convert ChatMessageDTO to Message
export function toMessage(dto: ChatMessageDTO): Message {
  return {
    id: dto.id,
    roomId: dto.roomId,
    userId: dto.userId,
    content: dto.content,
    createdAt: dto.createdAt,
    author: {
      id: dto.userId,
      username: dto.usernameSnapshot ?? "Unknown",
    },
  };
}
