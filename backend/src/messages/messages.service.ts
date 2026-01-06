import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message, MessageType } from './message.entity';
import { Room } from '../rooms/room.entity';
import { User } from '../users/user.entity';
import { RoomMember } from '../room_members/room-member.entity';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
    @InjectRepository(Room)
    private roomsRepository: Repository<Room>,
    @InjectRepository(RoomMember)
    private roomMembersRepository: Repository<RoomMember>,
  ) {}

  // Récupérer tous les messages d'une room
  async getRoomMessages(roomId: string, user: User): Promise<Message[]> {
    // Vérifier que l'utilisateur est membre ou owner
    const room = await this.roomsRepository.findOne({
      where: { id: roomId },
      relations: ['owner'],
    });
    if (!room) throw new NotFoundException('Room non trouvée');

    const isMember =
      room.owner.id === user.id ||
      (await this.roomMembersRepository.count({
        where: { room: { id: roomId }, user: { id: user.id } },
      })) > 0;

    if (!isMember)
      throw new ForbiddenException("Vous n'êtes pas membre de cette room");

    return this.messagesRepository.find({
      where: { room: { id: roomId } },
      relations: ['author'],
      order: { created_at: 'ASC' },
    });
  }

  // Envoyer un message
  async sendMessage(
    roomId: string,
    author: User,
    content: string,
    type: MessageType = MessageType.TEXT,
    fileUrl?: string,
  ): Promise<Message> {
    if (!content && !fileUrl) {
      throw new Error('Le contenu ou le fichier doit être fourni');
    }

    const room = await this.roomsRepository.findOne({
      where: { id: roomId },
      relations: ['owner'],
    });
    if (!room) throw new NotFoundException('Room non trouvée');

    const isMember =
      room.owner.id === author.id ||
      (await this.roomMembersRepository.count({
        where: { room: { id: roomId }, user: { id: author.id } },
      })) > 0;

    if (!isMember)
      throw new ForbiddenException("Vous n'êtes pas membre de cette room");

    const message = this.messagesRepository.create({
      room,
      author,
      content,
      type,
      file_url: fileUrl,
    });

    return this.messagesRepository.save(message);
  }
}
