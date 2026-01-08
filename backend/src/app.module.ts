import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { RoomsModule } from './rooms/rooms.module';
import { MessagesModule } from './messages/messages.module';
import { RoomMembersModule } from './room_members/room_members.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    HealthModule,
    DatabaseModule, // Configure TypeORM et la DB
    UsersModule, // Module pour gérer les users
    RoomsModule, // Module pour gérer les rooms
    RoomMembersModule, // Module pour gérer les membres des rooms
    MessagesModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
