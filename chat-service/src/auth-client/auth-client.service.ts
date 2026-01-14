import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

export type IntrospectResult = {
    active: boolean;
    userId?: string;
    email?: string;
    username?: string;
    exp?: number;
};

export type UserLookupResult = {
    id: string;
    username: string;
};

@Injectable()
export class AuthClientService {
    constructor(
      private readonly http: HttpService,
      private readonly config: ConfigService,
    ) {}

    async introspectToken(accessToken: string): Promise<IntrospectResult> {
        const internalKey = this.config.get<string>('INTERNAL_API_KEY');

        try {
            const res = await firstValueFrom(
              this.http.post(
                '/auth/introspect',
                {},
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'x-internal-api-key': internalKey,
                    },
                },
              ),
            );

            const data = res.data;

            // Map auth-service response to IntrospectResult format
            // auth-service returns: { active: true, user: { id, username, email } }
            // We need: { active: boolean, userId?: string, username?: string, email?: string }
            return {
                active: data.active,
                userId: data.user?.id,
                username: data.user?.username,
                email: data.user?.email,
                exp: data.payload?.exp,
            };
        } catch (err) {
            throw new UnauthorizedException('Invalid or expired token');
        }
    }

    async findUserByUsername(username: string): Promise<UserLookupResult> {
        try {
            const res = await firstValueFrom(
              this.http.get(`/users/by-username/${encodeURIComponent(username)}`),
            );
            return res.data;
        } catch (err: any) {
            if (err?.response?.status === 404) {
                throw new NotFoundException(`User "${username}" not found`);
            }
            throw err;
        }
    }
}
