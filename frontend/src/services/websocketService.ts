/* eslint-disable @typescript-eslint/no-explicit-any */
let ws: WebSocket | null = null;
const messageCallbacks: ((msg: any) => void)[] = [];

/**
 * Connecte le client au WS d’une room spécifique
 */
export const connectSocket = (token: string, roomId: string) => {
  if (ws && ws.readyState === WebSocket.OPEN) return ws;

  ws = new WebSocket(
    `${(window as any).__ENV__?.WS_ENDPOINT}?token=${token}&roomId=${roomId}`
  );

  ws.onopen = () => console.log("Connected to WS API Gateway");
  ws.onclose = () => console.log("Disconnected from WS");
  ws.onerror = (err) => console.error("WS error:", err);

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.action === "newMessage") {
      messageCallbacks.forEach((cb) => cb(data.message));
    }
  };

  return ws;
};

export const onNewMessage = (callback: (msg: any) => void) => {
  messageCallbacks.push(callback);
};

export const disconnectSocket = () => {
  if (ws) ws.close();
  ws = null;
};

export const sendMessage = (data: { roomId: string; content: string }) => {
  ws?.send(JSON.stringify({ action: "sendMessage", ...data }));
};
