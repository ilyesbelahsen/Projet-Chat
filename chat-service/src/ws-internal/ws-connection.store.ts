import { Injectable } from '@nestjs/common';

type ConnInfo = {
  connectedAt: number;
};

@Injectable()
export class WsConnectionStore {
  private readonly connections = new Map<string, ConnInfo>();

  add(connectionId: string) {
    this.connections.set(connectionId, { connectedAt: Date.now() });
  }

  remove(connectionId: string) {
    this.connections.delete(connectionId);
  }

  has(connectionId: string) {
    return this.connections.has(connectionId);
  }

  // Pour tests / debug
  listConnectionIds(): string[] {
    return [...this.connections.keys()];
  }
}
