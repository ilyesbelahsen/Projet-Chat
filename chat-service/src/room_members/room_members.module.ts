import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomMember } from './room-member.entity';
import { RoomMembersService } from './room_members.service';
import { RoomMembersController } from './room_members.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RoomMember]),
    AuthModule,
  ],
  providers: [RoomMembersService],
  controllers: [RoomMembersController],
  exports: [TypeOrmModule],
})
export class RoomMembersModule {}
