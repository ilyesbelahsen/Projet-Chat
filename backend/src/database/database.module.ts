import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { Room } from '../rooms/room.entity';
import { Message } from '../messages/message.entity';
import { RoomMember } from 'src/room_members/room-member.entity';
import { RefreshTokenEntity } from 'src/auth/refresh-token.entity';
import { PasswordResetTokenEntity } from 'src/auth/password-reset.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 3306,
      username: process.env.DB_USER || 'chat_user',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'chat_app',
      entities: [
        User,
        Room,
        RoomMember,
        Message,
        RefreshTokenEntity,
        PasswordResetTokenEntity,
      ],
      synchronize: true, // seulement en dev pour créer les tables automatiquement
      logging: true,
    }),
  ],
})
export class DatabaseModule {}
