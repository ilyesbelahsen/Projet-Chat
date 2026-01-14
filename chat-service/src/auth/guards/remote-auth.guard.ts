import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthClientService } from '../../auth-client/auth-client.service';

@Injectable()
export class RemoteAuthGuard implements CanActivate {
    constructor(private readonly authClient: AuthClientService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest<Request>();

        const authHeader = req.headers['authorization'];
        if (!authHeader || Array.isArray(authHeader)) {
            throw new UnauthorizedException('Missing Authorization header');
        }

        const [type, token] = authHeader.split(' ');
        if (type !== 'Bearer' || !token) {
            throw new UnauthorizedException('Invalid Authorization format');
        }

        let result: any;
        try {
            result = await this.authClient.introspectToken(token);
        } catch {
            throw new UnauthorizedException('Auth service unavailable');
        }

        if (!result?.active || !result.userId) {
            throw new UnauthorizedException('Token not active');
        }

        (req as any).user = {
            id: result.userId,
            email: result.email ?? null,
            username: result.username ?? null,
            exp: result.exp ?? null,
        };

        return true;
    }
}
