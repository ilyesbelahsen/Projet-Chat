// src/messages/messages.controller.ts
import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessageType } from './message.entity';
import { CurrentUser } from '../auth-client/current-user.decorator';
import { AuthUser } from '../auth-client/auth-user.type';
import { RemoteAuthGuard } from '../auth/guards/remote-auth.guard';

@Controller('messages')
@UseGuards(RemoteAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get(':roomId')
  async getRoomMessages(@Param('roomId') roomId: string, @CurrentUser() user: AuthUser) {
    return this.messagesService.getRoomMessages(roomId, user.id);
  }

  @Post(':roomId')
  async postMessage(
    @Param('roomId') roomId: string,
    @CurrentUser() user: AuthUser,
    @Body()
    body: {
      content?: string | null;
      type?: MessageType;
      fileUrl?: string | null;
    },
  ) {
    return this.messagesService.createMessage(
      roomId,
      user.id,
      body.content ?? null,
      body.type ?? MessageType.TEXT,
      body.fileUrl ?? null,
      user.username ?? null,
    );
  }
}
