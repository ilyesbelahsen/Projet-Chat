import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class InternalApiKeyGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request & { headers: any }>();

    const expected = this.config.get<string>('INTERNAL_API_KEY');

    const provided =
      req.headers['x-internal-api-key'] ??
      req.headers['X-Internal-Api-Key'];

    if (!expected || !provided || provided !== expected) {
      throw new UnauthorizedException('Invalid internal api key');
    }
    return true;
  }
}
