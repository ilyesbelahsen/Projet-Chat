import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from './room.entity';
import { User } from '../users/user.entity';
import { RoomMember } from 'src/room_members/room-member.entity';

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(Room)
    private roomsRepository: Repository<Room>,
    @InjectRepository(RoomMember)
    private roomMembersRepository: Repository<RoomMember>,
  ) {}

  // Créer une room
  async createRoom(name: string, owner: User): Promise<Room> {
    const room = this.roomsRepository.create({ name, owner });
    const savedRoom = await this.roomsRepository.save(room);

    // Ajouter le propriétaire comme membre
    const member = this.roomMembersRepository.create({
      room: savedRoom,
      user: owner,
      added_by: owner,
    });
    await this.roomMembersRepository.save(member);

    return savedRoom;
  }

  // Ajouter un membre à une room
  async addMember(
    roomId: string,
    user: User,
    addedBy: User,
  ): Promise<RoomMember> {
    const room = await this.roomsRepository.findOne({
      where: { id: roomId },
      relations: ['owner'],
    });
    if (!room) throw new NotFoundException('Room non trouvée');
    if (room.owner.id !== addedBy.id)
      throw new Error('Seul le propriétaire peut ajouter des membres');

    const member = this.roomMembersRepository.create({
      room,
      user,
      added_by: addedBy,
    });
    return this.roomMembersRepository.save(member);
  }

  // Récupérer toutes les rooms d’un utilisateur
  async getUserRooms(userId: string): Promise<Room[]> {
    const ownedRooms = await this.roomsRepository.find({
      where: { owner: { id: userId } },
    });

    const memberRooms = await this.roomMembersRepository.find({
      where: { user: { id: userId } },
      relations: ['room'],
    });

    const memberOnlyRooms = memberRooms.map((rm) => rm.room);

    // Fusionner les rooms en évitant doublons
    const roomsMap = new Map<string, Room>();
    [...ownedRooms, ...memberOnlyRooms].forEach((r) => roomsMap.set(r.id, r));

    return Array.from(roomsMap.values());
  }
}
