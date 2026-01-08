import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { UnauthorizedException } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { MessagesService } from './messages.service';
import { User } from '../users/user.entity';

type JwtPayload = { id: string; username: string; iat?: number; exp?: number };

@WebSocketGateway({
  cors: {
    origin: process.env.WEB_ORIGIN ?? 'http://localhost:5000',
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly messagesService: MessagesService,
    private readonly jwtService: JwtService,
  ) {}

  handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token as string | undefined;
      if (!token) throw new UnauthorizedException('Missing token');

      const payload = this.jwtService.verify<JwtPayload>(token, {
        secret: process.env.JWT_SECRET || 'supersecretkey',
      });

      if (!payload?.id)
        throw new UnauthorizedException('Invalid token payload');

      // On attache l’identité au socket (source de vérité)
      client.data.userId = payload.id;
      client.data.username = payload.username;

      // (optionnel) log
      // console.log(`[WS] Connected userId=${payload.id}`);
    } catch (e) {
      // Refus net : pas d’utilisateur => pas de socket
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    // console.log(`[WS] Disconnected userId=${client.data.userId}`);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() client: Socket,
  ) {
    if (!client.data.userId) throw new UnauthorizedException();
    client.join(data.roomId);
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() client: Socket,
  ) {
    if (!client.data.userId) throw new UnauthorizedException();
    client.leave(data.roomId);
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() data: { roomId: string; content: string }, // ✅ plus de userId !
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const userId = client.data.userId as string | undefined;
      if (!userId) throw new UnauthorizedException('Not authenticated');

      const author: User = { id: userId } as User;

      const message = await this.messagesService.sendMessage(
        data.roomId,
        author,
        data.content,
      );

      this.server.to(data.roomId).emit('newMessage', message);
    } catch (err) {
      client.emit('error', { message: (err as Error).message });
    }
  }
}
