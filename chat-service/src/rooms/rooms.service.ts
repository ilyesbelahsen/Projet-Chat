import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Room } from './room.entity';
import { RoomMember } from "../room_members/room-member.entity";

type CurrentUser = { id: string; username?: string | null };

@Injectable()
export class RoomsService {
  constructor(
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

  private assertRoomName(name: any): string {
    if (typeof name !== 'string') throw new BadRequestException('name must be a string');
    const n = name.trim();
    if (!n) throw new BadRequestException('name is required');
    if (n.length > 50) throw new BadRequestException('name too long (max 50)');
    return n;
  }

  private async ensureMember(roomId: number, user: CurrentUser) {
    const userId = this.assertUuid(user.id, 'user.id');

    const exists = await this.rmRepo.findOne({ where: { roomId, userId } });
    if (exists) return;

    await this.rmRepo.save(
        this.rmRepo.create({
          roomId,
          userId,
          usernameSnapshot: user.username ?? null,
        }),
    );
  }

  private async assertMember(roomId: number, userId: string) {
    const m = await this.rmRepo.findOne({ where: { roomId, userId } });
    if (!m) throw new ForbiddenException('Not a member of this room');
  }

  // =========================================================
  // ✅ ALIAS pour matcher tes controllers (corrige tes erreurs)
  // =========================================================

  // Les controllers appellent getOrCreateGeneralRoom(user)
  async getOrCreateGeneralRoom(user: CurrentUser) {
    const room = await this.getGeneralRoom(); // crée si absent
    if (user?.id) {
      await this.ensureMember(room.id, user); // auto-join au "general"
    }
    return room;
  }

  // Les controllers appellent getMyRooms(userId)
  async getMyRooms(userId: string) {
    return this.getUserRooms(userId);
  }

  // Les controllers appellent getRoomById(roomId, userId)
  async getRoomById(roomIdRaw: any, requesterUserId: string) {
    const roomId = this.toInt(roomIdRaw, 'roomId');
    requesterUserId = this.assertUuid(requesterUserId, 'requesterUserId');

    const room = await this.roomRepo.findOne({ where: { id: roomId } });
    if (!room) throw new NotFoundException('Room not found');

    // Sécurité: on force l'appartenance (sauf pour "general" où on peut auto-join ailleurs via getOrCreateGeneralRoom)
    await this.assertMember(roomId, requesterUserId);

    const members = await this.rmRepo.find({ where: { roomId } });
    return {
      room,
      members: members.map((m) => ({
        userId: m.userId,
        usernameSnapshot: m.usernameSnapshot,
        joinedAt: m.joinedAt,
      })),
    };
  }

  // Les controllers appellent createRoom({ ownerUserId, name, ownerUsername })
  async createRoom(
      ownerUserIdOrDto: string | { ownerUserId: string; name: string; ownerUsername?: string | null },
      name?: string,
      ownerUsername?: string | null,
  ) {
    let ownerUserId: string;
    let roomName: string;
    let username: string | null | undefined;

    if (typeof ownerUserIdOrDto === 'string') {
      ownerUserId = ownerUserIdOrDto;
      roomName = this.assertRoomName(name);
      username = ownerUsername ?? null;
    } else {
      ownerUserId = ownerUserIdOrDto.ownerUserId;
      roomName = this.assertRoomName(ownerUserIdOrDto.name);
      username = ownerUserIdOrDto.ownerUsername ?? null;
    }

    ownerUserId = this.assertUuid(ownerUserId);

    // Vérifier si une room avec ce nom existe déjà
    const existingRoom = await this.roomRepo.findOne({ where: { name: roomName } });
    if (existingRoom) {
      throw new BadRequestException(`Une room avec le nom "${roomName}" existe déjà`);
    }

    const room = await this.roomRepo.save(
        this.roomRepo.create({
          ownerUserId,
          ownerUsernameSnapshot: username ?? null,
          name: roomName,
        }),
    );

    await this.rmRepo.save(
        this.rmRepo.create({
          roomId: room.id,
          userId: ownerUserId,
          usernameSnapshot: username ?? null,
        }),
    );

    return room;
  }

  // =========================================================
  // ✅ TES MÉTHODES EXISTANTES (inchangées ou quasi)
  // =========================================================

  // ====== GENERAL ROOM ======
  async getGeneralRoom(_user?: any) {
    let room = await this.roomRepo.findOne({ where: { name: 'general' } });

    if (!room) {
      room = await this.roomRepo.save(
          this.roomRepo.create({
            name: 'general',
            ownerUserId: '00000000-0000-0000-0000-000000000000',
            ownerUsernameSnapshot: 'system',
          }),
      );
    }

    return room;
  }

  // ====== MES ROOMS ======
  async getUserRooms(userId: string) {
    userId = this.assertUuid(userId);

    const memberships = await this.rmRepo.find({ where: { userId } });
    const roomIds = memberships.map((m) => m.roomId);
    if (roomIds.length === 0) return [];

    return this.roomRepo.find({ where: { id: In(roomIds) } });
  }

  // ====== ADD MEMBER ======
  async addMember(roomIdRaw: any, newUserIdRaw: any, requesterUserId: string, username?: string | null) {
    const roomId = this.toInt(roomIdRaw, 'roomId');
    const newUserId = this.assertUuid(newUserIdRaw, 'userId');
    requesterUserId = this.assertUuid(requesterUserId, 'requesterUserId');

    const room = await this.roomRepo.findOne({ where: { id: roomId } });
    if (!room) throw new NotFoundException('Room not found');

    if (room.ownerUserId !== requesterUserId) {
      throw new ForbiddenException('Only owner can add members');
    }

    const exists = await this.rmRepo.findOne({ where: { roomId, userId: newUserId } });
    if (exists) return { ok: true };

    await this.rmRepo.save(this.rmRepo.create({ roomId, userId: newUserId, usernameSnapshot: username ?? null }));
    return { ok: true };
  }

  // ====== GET ROOM DETAILS (sans contrôle membership ici) ======
  async getRoom(roomIdRaw: any) {
    const roomId = this.toInt(roomIdRaw, 'roomId');

    const room = await this.roomRepo.findOne({ where: { id: roomId } });
    if (!room) throw new NotFoundException('Room not found');

    const members = await this.rmRepo.find({ where: { roomId } });

    return {
      room,
      members: members.map((m) => ({
        userId: m.userId,
        usernameSnapshot: m.usernameSnapshot,
        joinedAt: m.joinedAt,
      })),
    };
  }

  // ====== REMOVE MEMBER ======
  async removeMember(roomIdRaw: any, userIdToRemoveRaw: any, requesterUserId: string) {
    const roomId = this.toInt(roomIdRaw, 'roomId');
    const userIdToRemove = this.assertUuid(userIdToRemoveRaw, 'userId');
    requesterUserId = this.assertUuid(requesterUserId, 'requesterUserId');

    const room = await this.roomRepo.findOne({ where: { id: roomId } });
    if (!room) throw new NotFoundException('Room not found');

    const isOwner = room.ownerUserId === requesterUserId;
    const isSelf = requesterUserId === userIdToRemove;

    if (!isOwner && !isSelf) {
      throw new ForbiddenException('Not allowed to remove this member');
    }

    await this.rmRepo.delete({ roomId, userId: userIdToRemove });
    return { ok: true };
  }

  // ====== DELETE ROOM ======
  async deleteRoom(roomIdRaw: any, requesterUserId: string) {
    const roomId = this.toInt(roomIdRaw, 'roomId');
    requesterUserId = this.assertUuid(requesterUserId, 'requesterUserId');

    const room = await this.roomRepo.findOne({ where: { id: roomId } });
    if (!room) throw new NotFoundException('Room not found');

    if (room.ownerUserId !== requesterUserId) {
      throw new ForbiddenException('Only owner can delete the room');
    }

    await this.roomRepo.delete({ id: roomId });
    return { ok: true };
  }
}
