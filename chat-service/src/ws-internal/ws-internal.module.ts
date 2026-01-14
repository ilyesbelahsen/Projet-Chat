import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { InternalApiKeyGuard } from '../auth/guards/internal-api-key.guard';
import { AuthClientModule } from '../auth-client/auth-client.module';

import { WsInternalController } from './ws-internal.controller';
import { WsSessionStore } from './ws-session.store';

import { RoomMember } from '../room_members/room-member.entity';
import { Message } from '../messages/message.entity';

@Module({
  imports: [
    ConfigModule,
    AuthClientModule,
    TypeOrmModule.forFeature([RoomMember, Message]),
  ],
  controllers: [WsInternalController],
  providers: [WsSessionStore, InternalApiKeyGuard],
})
export class WsInternalModule {}
