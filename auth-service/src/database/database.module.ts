import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'db',
      port: Number(process.env.DB_PORT ?? 3306),

      username: process.env.DB_USER || process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD || process.env.DB_PASS,
      database: process.env.DB_NAME,

      entities: [join(__dirname, '..', '**', '*.entity{.ts,.js}')],

      synchronize: (process.env.DB_SYNC ?? 'false') === 'true',
      logging: true,
    }),
  ],
})
export class DatabaseModule {}
