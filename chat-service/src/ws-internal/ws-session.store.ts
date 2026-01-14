import { Injectable } from '@nestjs/common';

export type WsUser = {
  userId: string;
  email?: string;
  username?: string;
};

@Injectable()
export class WsSessionStore {
  private readonly connToUser = new Map<string, WsUser>();
  private readonly userToConns = new Map<string, Set<string>>();

  bind(connectionId: string, user: WsUser) {
    this.connToUser.set(connectionId, user);

    const set = this.userToConns.get(user.userId) ?? new Set<string>();
    set.add(connectionId);
    this.userToConns.set(user.userId, set);
  }

  unbind(connectionId: string) {
    const user = this.connToUser.get(connectionId);
    if (!user) return;

    this.connToUser.delete(connectionId);

    const set = this.userToConns.get(user.userId);
    if (!set) return;

    set.delete(connectionId);
    if (set.size === 0) this.userToConns.delete(user.userId);
  }

  getUser(connectionId: string): WsUser | undefined {
    return this.connToUser.get(connectionId);
  }

  getConnectionsOfUser(userId: string): string[] {
    return [...(this.userToConns.get(userId) ?? new Set<string>())];
  }
}
