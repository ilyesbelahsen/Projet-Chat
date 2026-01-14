import { Global, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthClientService } from './auth-client.service';

@Global()
@Module({
    imports: [
        ConfigModule,
        HttpModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                baseURL: config.get<string>('AUTH_SERVICE_URL') ?? 'http://auth-service:5000',
                timeout: 5000,
            }),
        }),
    ],
    providers: [AuthClientService],
    exports: [AuthClientService],
})
export class AuthClientModule {}
