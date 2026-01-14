import {
  Body,
  Controller,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { InternalApiKeyGuard } from '../auth/guards/internal-api-key.guard';
import { AuthClientService } from '../auth-client/auth-client.service';

import { WsSessionStore } from './ws-session.store';
import { RoomMember } from '../room_members/room-member.entity';
import { Message, MessageType } from '../messages/message.entity';

type WsEvent = {
  requestContext: {
    routeKey: '$connect' | '$disconnect' | 'sendMessage' | string;
    connectionId: string;
  };
  headers?: Record<string, string>;
  body?: any;
};

type WsResponse = {
  outbound: Array<{ connectionId: string; data: any }>;
};

function getHeader(headers: Record<string, string> | undefined, key: string) {
  if (!headers) return undefined;
  return headers[key] ?? headers[key.toLowerCase()] ?? headers[key.toUpperCase()];
}

@Controller('internal/ws')
@UseGuards(InternalApiKeyGuard)
export class WsInternalController {
  constructor(
    private readonly sessions: WsSessionStore,
    private readonly authClient: AuthClientService,

    @InjectRepository(RoomMember)
    private readonly roomMemberRepo: Repository<RoomMember>,

    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
  ) {}

  /**
   * Lambda-specific endpoint that accepts user info directly (no session required).
   * Used by AWS API Gateway WebSocket Lambda which manages its own connections via DynamoDB.
   */
  @Post('lambda-send-message')
  async onLambdaSendMessage(@Body() body: {
    userId: string;
    username: string;
    roomId: number;
    content: string;
  }): Promise<{ success: boolean; message?: any; error?: string }> {
    const { userId, username, roomId, content } = body;

    if (!userId || !roomId || typeof content !== 'string' || !content.trim()) {
      return {
        success: false,
        error: 'Payload must contain { userId, roomId, content }',
      };
    }

    // 1) Verify membership
    const isMember = await this.roomMemberRepo.exist({
      where: { roomId, userId },
    });

    if (!isMember) {
      return {
        success: false,
        error: 'You are not a member of this room',
      };
    }

    // 2) Save message to DB
    const msg = this.messageRepo.create({
      roomId,
      userId,
      usernameSnapshot: username ?? null,
      type: MessageType.TEXT,
      content: content.trim(),
      fileUrl: null,
    });

    const saved = await this.messageRepo.save(msg);

    // 3) Return saved message (Lambda will handle broadcasting via API Gateway)
    return {
      success: true,
      message: {
        id: saved.id,
        roomId: saved.roomId,
        userId: saved.userId,
        username: saved.usernameSnapshot,
        content: saved.content,
        createdAt: saved.createdAt,
      },
    };
  }

  @Post('connect')
  async onConnect(@Body() event: WsEvent): Promise<WsResponse> {
    const connectionId = event.requestContext.connectionId;

    const authHeader =
      getHeader(event.headers, 'authorization') ?? getHeader(event.headers, 'Authorization');

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing Authorization Bearer token on connect');
    }

    const token = authHeader.slice('Bearer '.length).trim();
    const introspect = await this.authClient.introspectToken(token);

    if (!introspect.active || !introspect.userId) {
      throw new UnauthorizedException('Invalid token');
    }

    this.sessions.bind(connectionId, {
      userId: introspect.userId,
      email: introspect.email,
      username: introspect.username,
    });

    return {
      outbound: [
        {
          connectionId,
          data: {
            type: 'system',
            event: 'connected',
            connectionId,
            userId: introspect.userId,
          },
        },
      ],
    };
  }

  @Post('disconnect')
  async onDisconnect(@Body() event: WsEvent): Promise<WsResponse> {
    const connectionId = event.requestContext.connectionId;
    this.sessions.unbind(connectionId);
    return { outbound: [] };
  }

  @Post('send-message')
  async onSendMessage(@Body() event: WsEvent): Promise<WsResponse> {
    const connectionId = event.requestContext.connectionId;

    // 0) retrouver le user à partir du connectionId (stocké au connect)
    const user = this.sessions.getUser(connectionId);
    if (!user) {
      return {
        outbound: [
          {
            connectionId,
            data: { type: 'error', code: 'NOT_CONNECTED', message: 'Unknown connectionId' },
          },
        ],
      };
    }

    // payload attendu:
    // { action: "sendMessage", roomId: 1, content: "..." }
    const payload = event.body ?? {};
    const roomIdRaw = payload.roomId;
    const content = payload.content ?? payload.message ?? payload.text;

    const roomId = Number(roomIdRaw);

    if (!Number.isInteger(roomId) || roomId <= 0 || typeof content !== 'string' || !content.trim()) {
      return {
        outbound: [
          {
            connectionId,
            data: {
              type: 'error',
              code: 'BAD_REQUEST',
              message: 'Payload must contain { roomId:number, content:string }',
            },
          },
        ],
      };
    }

    // 1) Vérifier membership
    const isMember = await this.roomMemberRepo.exist({
      where: { roomId, userId: user.userId },
    });

    if (!isMember) {
      return {
        outbound: [
          {
            connectionId,
            data: {
              type: 'error',
              code: 'FORBIDDEN',
              message: 'You are not a member of this room',
            },
          },
        ],
      };
    }

    // 2) Sauvegarder le message en DB (Message entity exacte)
    const msg = this.messageRepo.create({
      roomId,
      userId: user.userId,
      usernameSnapshot: user.username ?? null,
      type: MessageType.TEXT,
      content: content.trim(),
      fileUrl: null,
    });

    const saved = await this.messageRepo.save(msg);

    // 3) récupérer tous les membres du room
    const members = await this.roomMemberRepo.find({ where: { roomId } });
    const memberUserIds = members.map((m) => m.userId);

    // 4) convertir userIds => connectionIds connectés
    const targetConnectionIds = new Set<string>();
    for (const uid of memberUserIds) {
      for (const cid of this.sessions.getConnectionsOfUser(uid)) {
        targetConnectionIds.add(cid);
      }
    }

    // 5) event broadcast
    const messageEvent = {
      type: 'message',
      roomId,
      message: {
        id: saved.id,
        roomId,  // Include roomId in message for frontend filtering
        userId: saved.userId,
        username: saved.usernameSnapshot,
        content: saved.content,
        createdAt: saved.createdAt,
      },
    };

    return {
      outbound: [...targetConnectionIds].map((cid) => ({
        connectionId: cid,
        data: messageEvent,
      })),
    };
  }
}
