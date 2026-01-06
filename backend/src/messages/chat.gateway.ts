import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessagesService } from './messages.service';
import { User } from '../users/user.entity';

@WebSocketGateway({ cors: true })
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly messagesService: MessagesService) {}

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() data: { roomId: string; content: string; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const author: User = { id: data.userId } as User;

      const message = await this.messagesService.sendMessage(
        data.roomId,
        author,
        data.content,
      );

      this.server.to(data.roomId).emit('newMessage', message);
      console.log(`[BACK] Message émis à la room: ${data.roomId}`);
    } catch (err) {
      console.error(`[BACK] Erreur sendMessage:`, err);
      client.emit('error', { message: (err as Error).message });
    }
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(data.roomId);
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(data.roomId);
  }
}
