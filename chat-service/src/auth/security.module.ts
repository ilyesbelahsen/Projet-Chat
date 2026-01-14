import { Module } from '@nestjs/common';
import { AuthClientModule } from '../auth-client/auth-client.module';
import { RemoteAuthGuard } from './guards/remote-auth.guard';

@Module({
  imports: [AuthClientModule],
  providers: [RemoteAuthGuard],
  exports: [RemoteAuthGuard],
})
export class SecurityModule {}
