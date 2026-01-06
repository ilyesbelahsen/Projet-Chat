import { Module } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { RoomsController } from './rooms.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Room } from './room.entity';
import { UsersModule } from '../users/users.module';
import { RoomMember } from 'src/room_members/room-member.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Room, RoomMember]), UsersModule],
  providers: [RoomsService],
  controllers: [RoomsController],
})
export class RoomsModule {}
