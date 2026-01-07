import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { Room } from '../rooms/room.entity';
import { Message } from '../messages/message.entity';
import { RoomMember } from 'src/room_members/room-member.entity';
import { RefreshTokenEntity } from 'src/auth/refresh-token.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'chat_user',
      password: 'password',
      database: 'chat_app',
      entities: [User, Room, RoomMember, Message, RefreshTokenEntity],
      synchronize: true, // seulement en dev pour créer les tables automatiquement
      logging: true,
    }),
  ],
})
export class DatabaseModule {}
