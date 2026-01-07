import { Controller, Post, Body, Req, Res, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, SignupDto } from './signup.dto';
import type { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  private setRefreshCookie(res: Response, refreshToken: string) {
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/auth/refresh',
      maxAge: 14 * 24 * 60 * 60 * 1000,
    });
  }

  @Post('signup')
  async signup(@Body() dto: SignupDto, @Res({ passthrough: true }) res: Response) {
    const out = await this.authService.signup(dto); // doit renvoyer refreshToken
    this.setRefreshCookie(res, out.refreshToken);
    return { user: out.user, token: out.token };
  }

  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const out = await this.authService.login(dto); // doit renvoyer refreshToken
    this.setRefreshCookie(res, out.refreshToken);
    return { user: out.user, token: out.token };
  }

  @Post('refresh')
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const raw = (req as any).cookies?.refresh_token;
    if (!raw) throw new UnauthorizedException('No refresh token');

    const out = await this.authService.refresh(raw);
    this.setRefreshCookie(res, out.refreshToken);
    return { user: out.user, token: out.token };
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const raw = (req as any).cookies?.refresh_token;
    if (raw) await this.authService.logout(raw);

    res.clearCookie('refresh_token', { path: '/auth/refresh' });
    return { ok: true };
  }
}
