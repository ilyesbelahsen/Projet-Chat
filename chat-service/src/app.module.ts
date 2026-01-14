import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { DatabaseModule } from './database/database.module';
import { SecurityModule } from './security/security.module';
import { RoomsModule } from './rooms/rooms.module';
import { MessagesModule } from './messages/messages.module';
import { RoomMembersModule } from './room_members/room_members.module';
import { HealthModule } from './health/health.module';
import { WsInternalModule } from './ws-internal/ws-internal.module';
import { AuthClientModule } from './auth-client/auth-client.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthClientModule,
    DatabaseModule,
    SecurityModule,
    RoomMembersModule,
    RoomsModule,
    MessagesModule,
    HealthModule,
    WsInternalModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
