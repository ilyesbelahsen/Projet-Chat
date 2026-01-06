import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';
import { User } from '../users/user.entity';
import { MessageType } from './message.entity';

@Controller('rooms/:roomId/messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get()
  async getMessages(@Param('roomId') roomId: string, @Req() req: Request) {
    const user = req.user as User;
    return this.messagesService.getRoomMessages(roomId, user);
  }

  @Post()
  async sendMessage(
    @Param('roomId') roomId: string,
    @Req() req: Request,
    @Body('content') content: string,
    @Body('type') type?: MessageType,
    @Body('fileUrl') fileUrl?: string,
  ) {
    const author = req.user as User;
    return this.messagesService.sendMessage(
      roomId,
      author,
      content,
      type,
      fileUrl,
    );
  }
}
