import { Module } from '@nestjs/common';
import { RoomMembersService } from './room_members.service';
import { RoomMembersController } from './room_members.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomMember } from './room-member.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RoomMember])],
  providers: [RoomMembersService],
  controllers: [RoomMembersController],
  exports: [RoomMembersService],
})
export class RoomMembersModule {}
