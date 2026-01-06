import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from './room.entity';
import { User } from '../users/user.entity';
import { RoomMember } from 'src/room_members/room-member.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(Room)
    private roomsRepository: Repository<Room>,
    @InjectRepository(RoomMember)
    private roomMembersRepository: Repository<RoomMember>,
    private readonly usersService: UsersService,
  ) {}

  // Créer une room
  async createRoom(name: string, owner: User): Promise<Room> {
    // Vérifier que le nom n'est pas vide
    if (!name || !name.trim()) {
      throw new BadRequestException('Le nom de la room ne peut pas être vide');
    }

    // Vérifier que le nom n'existe pas déjà pour ce propriétaire
    const existingRoom = await this.roomsRepository.findOne({
      where: { name: name.trim(), owner: { id: owner.id } },
    });

    if (existingRoom) {
      throw new ConflictException('Vous avez déjà une room avec ce nom');
    }

    // Création de la room
    const room = this.roomsRepository.create({ name: name.trim(), owner });
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
    username: string,
    addedBy: User,
  ): Promise<RoomMember> {
    const room = await this.roomsRepository.findOne({
      where: { id: roomId },
      relations: ['owner'],
    });
    if (!room) throw new NotFoundException('Room non trouvée');
    if (room.owner.id !== addedBy.id)
      throw new ForbiddenException(
        'Seul le propriétaire peut ajouter des membres',
      );

    const user = await this.usersService.findByUsername(username);
    if (!user) throw new NotFoundException('Utilisateur non trouvé');

    const member = this.roomMembersRepository.create({
      room,
      user,
      added_by: addedBy,
    });

    return this.roomMembersRepository.save(member);
  }

  // Supprimer un membre
  async removeMember(
    roomId: string,
    userId: string,
    removedBy: User,
  ): Promise<void> {
    const room = await this.roomsRepository.findOne({
      where: { id: roomId },
      relations: ['owner'],
    });
    if (!room) throw new NotFoundException('Room non trouvée');
    if (room.owner.id !== removedBy.id)
      throw new ForbiddenException(
        'Seul le propriétaire peut supprimer des membres',
      );

    const member = await this.roomMembersRepository.findOne({
      where: { room: { id: roomId }, user: { id: userId } },
    });
    if (!member) throw new NotFoundException('Membre non trouvé');

    await this.roomMembersRepository.remove(member);
  }

  // Supprimer une room
  async deleteRoom(roomId: string, user: User): Promise<void> {
    const room = await this.roomsRepository.findOne({
      where: { id: roomId },
      relations: ['owner'],
    });
    if (!room) throw new NotFoundException('Room non trouvée');
    if (room.owner.id !== user.id)
      throw new ForbiddenException(
        'Seul le propriétaire peut supprimer cette room',
      );

    await this.roomMembersRepository.delete({ room: { id: roomId } });
    await this.roomsRepository.remove(room);
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

    const roomsMap = new Map<string, Room>();
    [...ownedRooms, ...memberOnlyRooms].forEach((r) => roomsMap.set(r.id, r));

    return Array.from(roomsMap.values());
  }

  // 🔹 Récupérer les détails d'une room
  async getRoom(roomId: string): Promise<{ ownerId: string; members: User[] }> {
    const room = await this.roomsRepository.findOne({
      where: { id: roomId },
      relations: ['owner'],
    });
    if (!room) throw new NotFoundException('Room non trouvée');

    const members = await this.roomMembersRepository.find({
      where: { room: { id: roomId } },
      relations: ['user'],
    });

    return {
      ownerId: room.owner.id,
      members: members.map((m) => m.user),
    };
  }
}
