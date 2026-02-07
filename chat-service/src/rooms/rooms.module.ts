import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RoomsController } from './rooms.controller';
import { RoomsService } from './rooms.service';

import { Room } from './room.entity';
import { RoomMembersModule } from '../room_members/room_members.module';
import { AuthModule } from '../auth/auth.module';
import { AuthClientModule } from '../auth-client/auth-client.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Room]),
    RoomMembersModule,
    AuthModule,
    AuthClientModule
  ],
  controllers: [RoomsController],
  providers: [RoomsService],
  exports: [RoomsService],
})
export class RoomsModule {}
