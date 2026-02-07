import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import type { StringValue } from 'ms';

import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

import { RefreshTokenEntity } from './refresh-token.entity';
import { PasswordResetTokenEntity } from './password-reset.entity';
import { InternalApiKeyGuard } from './guards/internal-api-key.guard';

function parseExpiresIn(value: string | undefined): number | StringValue {
  if (!value) return '15m';

  if (/^\d+$/.test(value)) return Number(value);

  if (!/^\d+(ms|s|m|h|d|w|y)$/.test(value)) {
    return '15m';
  }

  return value as StringValue;
}

const expiresIn = parseExpiresIn(process.env.JWT_EXPIRES_IN);

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([RefreshTokenEntity, PasswordResetTokenEntity]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, InternalApiKeyGuard],
  exports: [AuthService],
})
export class AuthModule {}
