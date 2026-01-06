import { io, type Socket } from "socket.io-client";
import type { Message } from "../types/chat";

const SOCKET_URL = "http://localhost:3000";

let socket: Socket | null = null;

/**
 * Connecte la socket et retourne l'instance.
 */
export const connectSocket = (userId: string): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ["websocket"],
      query: { userId },
    });
    console.log("[FRONT] Socket connecté");
  }
  return socket;
};

/**
 * Déconnecte la socket
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log("[FRONT] Socket déconnecté");
  }
};

/**
 * Rejoindre une room
 */
export const joinRoom = (roomId: string) => {
  if (!socket) return;
  socket.emit("joinRoom", { roomId });
};

/**
 * Quitter une room
 */
export const leaveRoom = (roomId: string) => {
  if (!socket) return;
  socket.emit("leaveRoom", { roomId });
};

/**
 * Envoyer un message
 */
export const sendMessage = (data: {
  roomId: string;
  content: string;
  userId: string;
}) => {
  if (!socket) return;
  socket.emit("sendMessage", data);
};

/**
 * Écouter les nouveaux messages
 */
export const onNewMessage = (callback: (msg: Message) => void) => {
  if (!socket) return;
  socket.on("newMessage", (msg: unknown) => {
    callback(msg as Message);
  });
};
