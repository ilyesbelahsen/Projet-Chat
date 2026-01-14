// frontend/src/services/websocketService.ts
/* eslint-disable @typescript-eslint/no-explicit-any */

// Note: Window.__ENV__ is declared in api.ts

let ws: WebSocket | null = null;
let currentRoomId: string | null = null;

const messageCallbacks: Array<(msg: any) => void> = [];
const rawEventCallbacks: Array<(evt: any) => void> = [];

const pending: string[] = [];

function getWsEndpoint(): string | null {
  const base = window.__ENV__?.WS_ENDPOINT;
  if (!base) {
    console.error("WS_ENDPOINT undefined. Vérifie que /env.js est chargé AVANT ton bundle (index.html).");
    return null;
  }
  return base;
}

function buildWsUrl(base: string, token: string, roomId: string) {
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}token=${encodeURIComponent(token)}&roomId=${encodeURIComponent(roomId)}`;
}

/**
 * Connecte le client au WS pour une room
 * - si déjà connecté à la même room => réutilise
 * - si room différente => ferme l’ancienne et reconnecte
 */
export const connectSocket = (token: string, roomId: string) => {
  const base = getWsEndpoint();
  if (!base) return null;

  // reuse si même room et socket ok
  if (ws && currentRoomId === roomId && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
    return ws;
  }

  // sinon on ferme proprement l’ancienne
  disconnectSocket();

  const url = buildWsUrl(base, token, roomId);
  currentRoomId = roomId;

  ws = new WebSocket(url);

  ws.onopen = () => {
    console.log("Connected to WS:", url);
    // flush queue
    while (pending.length > 0 && ws?.readyState === WebSocket.OPEN) {
      ws.send(pending.shift()!);
    }
  };

  ws.onclose = () => {
    console.log("Disconnected from WS");
    ws = null;
    currentRoomId = null;
  };

  ws.onerror = (err) => {
    console.error("WS error:", err);
  };

  ws.onmessage = (event) => {
    let data: any = event.data;
    try {
      data = JSON.parse(event.data);
    } catch {
      // si jamais le backend envoie du texte brut
    }

    // callbacks raw (debug / futur)
    rawEventCallbacks.forEach((cb) => cb(data));

    /**
     * On accepte plusieurs formats pour éviter de bloquer :
     * - { action: "newMessage", message: {...} }
     * - { type: "newMessage", message: {...} }
     * - { type: "message", ... } etc.
     */
    const isNewMessage =
      data?.action === "newMessage" ||
      data?.type === "newMessage" ||
      data?.type === "message";

    if (isNewMessage) {
      const msg = data.message ?? data;
      messageCallbacks.forEach((cb) => cb(msg));
    }
  };

  return ws;
};

export const onNewMessage = (callback: (msg: any) => void) => {
  messageCallbacks.push(callback);
  // Return unsubscribe function
  return () => {
    const idx = messageCallbacks.indexOf(callback);
    if (idx !== -1) messageCallbacks.splice(idx, 1);
  };
};

export const onWsEvent = (callback: (evt: any) => void) => {
  rawEventCallbacks.push(callback);
  // Return unsubscribe function
  return () => {
    const idx = rawEventCallbacks.indexOf(callback);
    if (idx !== -1) rawEventCallbacks.splice(idx, 1);
  };
};

export const disconnectSocket = () => {
  if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
    ws.close();
  }
  ws = null;
  currentRoomId = null;
};

/**
 * Envoie un message via WS.
 * Tant que ton backend ne broadcast pas encore, tu peux faire de l’optimistic UI côté React.
 */
export const sendMessage = (data: { roomId: number | string; content: string }) => {
  const payload = JSON.stringify({
    action: "sendMessage",
    roomId: String(data.roomId),
    content: data.content,
  });

  if (!ws || ws.readyState !== WebSocket.OPEN) {
    // on queue si pas encore OPEN
    pending.push(payload);
    return;
  }

  ws.send(payload);
};
