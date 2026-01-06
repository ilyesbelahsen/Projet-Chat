import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from './room.entity';
import { User } from '../users/user.entity';
import { RoomMember } from '../room_members/room-member.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class RoomsService implements OnModuleInit {
  constructor(
    @InjectRepository(Room)
    private readonly roomsRepository: Repository<Room>,

    @InjectRepository(RoomMember)
    private readonly roomMembersRepository: Repository<RoomMember>,

    private readonly usersService: UsersService,
  ) {}

  // Création automatique de la room générale
  async onModuleInit() {
    const generalRoom = await this.roomsRepository.findOne({
      where: { name: 'Chat Général' },
    });

    if (!generalRoom) {
      console.log('Création de la room générale...');
      const room = this.roomsRepository.create({
        name: 'Chat Général',
        owner: null, // accessible à tous
      });
      await this.roomsRepository.save(room);
    }
  }

  // 🔹 Récupérer la room générale + ses membres
  async getGeneralRoom(): Promise<Room> {
    const room = await this.roomsRepository.findOne({
      where: { name: 'Chat Général' },
    });
    if (!room) throw new NotFoundException('Room générale introuvable');
    return room;
  }
  // Créer une room classique
  async createRoom(name: string, owner: User): Promise<Room> {
    if (!name || !name.trim()) {
      throw new BadRequestException('Le nom de la room ne peut pas être vide');
    }

    const existingRoom = await this.roomsRepository.findOne({
      where: { name: name.trim(), owner: { id: owner.id } },
    });

    if (existingRoom) {
      throw new ConflictException('Vous avez déjà une room avec ce nom');
    }

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

  // Ajouter un membre
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

    // Vérifier si le user peut ajouter un membre
    if (room.owner && room.owner.id !== addedBy.id)
      throw new ForbiddenException(
        'Seul le propriétaire peut ajouter des membres',
      );

    const user = await this.usersService.findByUsername(username);
    if (!user) throw new NotFoundException('Utilisateur non trouvé');

    const existingMember = await this.roomMembersRepository.findOne({
      where: { room: { id: roomId }, user: { id: user.id } },
    });
    if (existingMember)
      throw new ConflictException('Utilisateur déjà membre de cette room');

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

    if (room.owner && room.owner.id !== removedBy.id)
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

    if (room.owner && room.owner.id !== user.id)
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

  // Récupérer les détails d'une room
  async getRoom(
    roomId: string,
  ): Promise<{ ownerId: string | null; members: User[] }> {
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
      ownerId: room.owner ? room.owner.id : null,
      members: members.map((m) => m.user),
    };
  }
}
