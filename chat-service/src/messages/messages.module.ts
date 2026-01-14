import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';

import { Message } from './message.entity';
import { Room } from '../rooms/room.entity';
import { RoomMember } from '../room_members/room-member.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message, Room, RoomMember]),
  ],
  controllers: [MessagesController],
  providers: [MessagesService],
  exports: [MessagesService],
})
export class MessagesModule {}
