import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message, MessageType } from './message.entity';
import { Room } from '../rooms/room.entity';
import { RoomMember } from '../room_members/room-member.entity';

@Injectable()
export class MessagesService {
  constructor(
      @InjectRepository(Message) private readonly msgRepo: Repository<Message>,
      @InjectRepository(Room) private readonly roomRepo: Repository<Room>,
      @InjectRepository(RoomMember) private readonly rmRepo: Repository<RoomMember>,
  ) {}

  private toInt(value: any, fieldName: string): number {
    const n = Number(value);
    if (!Number.isFinite(n)) throw new BadRequestException(`${fieldName} must be a number`);
    return n;
  }

  private assertUuid(userId: any, fieldName = 'userId'): string {
    if (typeof userId !== 'string') throw new BadRequestException(`${fieldName} must be a string UUID`);
    const ok = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userId);
    if (!ok) throw new BadRequestException(`${fieldName} must be a UUID`);
    return userId;
  }

  private async assertMember(roomId: number, userId: string) {
    const m = await this.rmRepo.findOne({ where: { roomId, userId } });
    if (!m) throw new ForbiddenException('Not a member of this room');
  }

  // =========================================================
  // ✅ ALIAS pour matcher tes controllers (corrige tes erreurs)
  // =========================================================

  // MessagesController appelle getMessages(roomId, userId)
  async getMessages(roomIdRaw: any, userId: string) {
    return this.getRoomMessages(roomIdRaw, userId);
  }

  // MessagesController appelle postMessage({ roomId, content, ... })
  async postMessage(dto: {
    roomId: any;
    userId?: string;
    content?: string | null;
    type?: MessageType;
    fileUrl?: string | null;
    usernameSnapshot?: string | null;
  }) {
    if (!dto) throw new BadRequestException('body is required');
    if (!dto.userId) throw new BadRequestException('userId is required');

    return this.createMessage(
        dto.roomId,
        dto.userId,
        dto.content ?? null,
        dto.type ?? MessageType.TEXT,
        dto.fileUrl ?? null,
        dto.usernameSnapshot ?? null,
    );
  }

  // =========================================================
  // ✅ TES MÉTHODES EXISTANTES
  // =========================================================

  async getRoomMessages(roomIdRaw: any, userId: string) {
    const roomId = this.toInt(roomIdRaw, 'roomId');
    userId = this.assertUuid(userId);

    await this.assertMember(roomId, userId);

    return this.msgRepo.find({
      where: { roomId },
      order: { createdAt: 'ASC' },
    });
  }

  async createMessage(
      roomIdRaw: any,
      userId: string,
      content: string | null,
      type: MessageType = MessageType.TEXT,
      fileUrl: string | null = null,
      usernameSnapshot: string | null = null,
  ) {
    const roomId = this.toInt(roomIdRaw, 'roomId');
    userId = this.assertUuid(userId);

    if (type === MessageType.TEXT) {
      const c = (content ?? '').trim();
      if (!c) throw new BadRequestException('content is required');
      content = c;
    }

    const room = await this.roomRepo.findOne({ where: { id: roomId } });
    if (!room) throw new NotFoundException('Room not found');

    await this.assertMember(roomId, userId);

    const msg = this.msgRepo.create({
      roomId,
      userId,
      usernameSnapshot,
      type,
      content: content ?? null,
      fileUrl,
    });

    return this.msgRepo.save(msg);
  }
}
