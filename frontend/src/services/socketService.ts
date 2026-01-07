import { io, type Socket } from "socket.io-client";
import type { Message } from "../types/chat";

const SOCKET_URL = "http://localhost:3000";

let socket: Socket | null = null;

export const connectSocket = (token: string): Socket => {
  if (socket?.connected) return socket;

  socket = io(SOCKET_URL, {
    transports: ["websocket"],
    auth: { token }, // ✅ handshake JWT
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const joinRoom = (roomId: string) => {
  socket?.emit("joinRoom", { roomId });
};

export const leaveRoom = (roomId: string) => {
  socket?.emit("leaveRoom", { roomId });
};

export const sendMessage = (data: { roomId: string; content: string }) => {
  socket?.emit("sendMessage", data); // ✅ plus de userId
};

export const onNewMessage = (callback: (msg: Message) => void) => {
  if (!socket) return () => {};
  socket.off("newMessage"); // reset
  socket.on("newMessage", (msg: unknown) => callback(msg as Message));
  return () => socket?.off("newMessage");
};

