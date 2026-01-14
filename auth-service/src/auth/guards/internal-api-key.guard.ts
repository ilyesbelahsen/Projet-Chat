import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class InternalApiKeyGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const expected = process.env.INTERNAL_API_KEY;
        if (!expected) return true;
        const req = context.switchToHttp().getRequest<Request>();
        const provided = req.header('x-internal-api-key');

        if (!provided || provided !== expected) {
            throw new UnauthorizedException('Invalid internal api key');
        }

        return true;
    }
}
