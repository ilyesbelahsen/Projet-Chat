import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { RoomsModule } from './rooms/rooms.module';
import { MessagesModule } from './messages/messages.module';
import { RoomMembersModule } from './room_members/room_members.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    DatabaseModule, // Configure TypeORM et la DB
    UsersModule, // Module pour gérer les users
    RoomsModule, // Module pour gérer les rooms
    RoomMembersModule, // Module pour gérer les membres des rooms
    MessagesModule, // Module pour gérer les messages
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
