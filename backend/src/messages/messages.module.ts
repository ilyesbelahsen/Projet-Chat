import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './message.entity';
import { Room } from 'src/rooms/room.entity';
import { RoomMember } from 'src/room_members/room-member.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Message, Room, RoomMember])],
  providers: [MessagesService],
  controllers: [MessagesController],
  exports: [MessagesService],
})
export class MessagesModule {}
