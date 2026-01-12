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
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
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
