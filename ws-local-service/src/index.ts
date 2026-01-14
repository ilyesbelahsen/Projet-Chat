import 'dotenv/config';
import { WebSocketServer, WebSocket } from 'ws';
import { randomUUID } from 'crypto';

const PORT = Number(process.env.PORT ?? 4001);
const CHAT_SERVICE_INTERNAL = process.env.CHAT_SERVICE_INTERNAL ?? 'http://chat-service:5000';
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY ?? '';

if (!INTERNAL_API_KEY) {
  console.warn('[ws-local-service] WARNING: INTERNAL_API_KEY is empty. Internal calls will be rejected.');
}

type OutboundItem = { connectionId: string; data: any };
type WsInternalResponse = { outbound: OutboundItem[] };

type ClientInfo = {
  ws: WebSocket;
  connectionId: string;
  token?: string;
};

const clients = new Map<string, ClientInfo>(); // connectionId -> client

function safeJsonParse(str: string) {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

async function callChatService(path: string, body: any, extraHeaders?: Record<string, string>) {
  const url = `${CHAT_SERVICE_INTERNAL}${path}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-internal-api-key': INTERNAL_API_KEY,
      ...(extraHeaders ?? {}),
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    // ignore
  }

  if (!res.ok) {
    const msg = json?.message ?? text ?? `HTTP ${res.status}`;
    throw new Error(`[chat-service] ${path} failed: ${res.status} ${msg}`);
  }

  return json as WsInternalResponse;
}

function deliverOutbound(outbound: OutboundItem[]) {
  for (const item of outbound) {
    const client = clients.get(item.connectionId);
    if (!client) continue;
    if (client.ws.readyState !== WebSocket.OPEN) continue;

    client.ws.send(JSON.stringify(item.data));
  }
}

const wss = new WebSocketServer({ port: PORT });

wss.on('listening', () => {
  console.log(`[ws-local-service] listening on port ${PORT}`);
  console.log(`[ws-local-service] chat-service internal: ${CHAT_SERVICE_INTERNAL}`);
});

wss.on('connection', async (ws, req) => {
  const connectionId = randomUUID();

  // token attendu: ws://localhost:4001?token=XXXXX
  const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);
  const token = url.searchParams.get('token') ?? undefined;

  clients.set(connectionId, { ws, connectionId, token });

  // 1) CONNECT -> appelle chat-service
  try {
    const connectEvent = {
      requestContext: { routeKey: '$connect', connectionId },
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: null,
    };

    const resp = await callChatService('/internal/ws/connect', connectEvent, token
      ? { Authorization: `Bearer ${token}` }
      : undefined
    );

    deliverOutbound(resp.outbound ?? []);
  } catch (e: any) {
    console.error('[ws-local-service] connect failed:', e?.message ?? e);
    ws.close(1008, 'Unauthorized');
    clients.delete(connectionId);
    return;
  }

  ws.on('message', async (raw) => {
    const text = raw.toString();
    const payload = safeJsonParse(text);

    if (!payload) {
      ws.send(JSON.stringify({ type: 'error', code: 'BAD_JSON' }));
      return;
    }

    // On attend: { action:"sendMessage", roomId:1, content:"..." }
    if (payload.action !== 'sendMessage') {
      ws.send(JSON.stringify({ type: 'error', code: 'UNKNOWN_ACTION', action: payload.action }));
      return;
    }

    try {
      const event = {
        requestContext: { routeKey: 'sendMessage', connectionId },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: payload,
      };

      const resp = await callChatService('/internal/ws/send-message', event);
      deliverOutbound(resp.outbound ?? []);
    } catch (e: any) {
      console.error('[ws-local-service] send-message failed:', e?.message ?? e);
      ws.send(JSON.stringify({ type: 'error', code: 'INTERNAL_CALL_FAILED', message: e?.message ?? String(e) }));
    }
  });

  ws.on('close', async () => {
    clients.delete(connectionId);

    try {
      const disconnectEvent = {
        requestContext: { routeKey: '$disconnect', connectionId },
        headers: {},
        body: null,
      };
      const resp = await callChatService('/internal/ws/disconnect', disconnectEvent);
      deliverOutbound(resp.outbound ?? []);
    } catch (e: any) {
      console.error('[ws-local-service] disconnect failed:', e?.message ?? e);
    }
  });
});
