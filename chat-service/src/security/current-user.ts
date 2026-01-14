import { UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

export type JwtUserPayload = {
  id?: string;
  sub?: string;
  userId?: string;
  username?: string;
};

function isUuidLike(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export function getUserFromRequest(req: Request): { userId: string; username?: string } {
  const u = req.user as JwtUserPayload | undefined;

  const rawId = u?.userId ?? u?.id ?? u?.sub;
  if (!rawId || !isUuidLike(rawId)) {
    throw new UnauthorizedException('Invalid user id in JWT payload (expected UUID)');
  }

  return { userId: rawId, username: u?.username };
}

export function getUserIdFromRequest(req: Request): string {
  return getUserFromRequest(req).userId;
}
