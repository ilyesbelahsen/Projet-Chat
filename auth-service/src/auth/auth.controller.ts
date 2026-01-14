import {
  Body,
  Controller,
  Post,
  Headers,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto, LoginDto } from './signup.dto';
import { IntrospectDto } from './dto/introspect.dto';
import { InternalApiKeyGuard } from './guards/internal-api-key.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  refresh(@Body('refreshToken') refreshToken: string) {
    if (!refreshToken) throw new BadRequestException('refreshToken is required');
    return this.authService.refresh(refreshToken);
  }

  @Post('logout')
  logout(@Body('refreshToken') refreshToken: string) {
    if (!refreshToken) throw new BadRequestException('refreshToken is required');
    return this.authService.logout(refreshToken);
  }

  @Post('forgot-password')
  forgotPassword(@Body('email') email: string) {
    if (!email) throw new BadRequestException('email is required');
    return this.authService.requestPasswordReset(email);
  }

  @Post('reset-password')
  resetPassword(@Body('token') token: string, @Body('newPassword') newPassword: string) {
    if (!token) throw new BadRequestException('token is required');
    if (!newPassword) throw new BadRequestException('newPassword is required');
    return this.authService.resetPassword(token, newPassword);
  }


  @UseGuards(InternalApiKeyGuard)
  @Post('introspect')
  async introspect(
      @Body() dto: IntrospectDto,
      @Headers('authorization') authorization?: string,
  ) {
    const tokenFromHeader =
        authorization?.startsWith('Bearer ') ? authorization.slice(7) : undefined;

    const token = dto?.token ?? tokenFromHeader;
    if (!token) throw new BadRequestException('token is required');

    return this.authService.introspectAccessToken(token);
  }
}
