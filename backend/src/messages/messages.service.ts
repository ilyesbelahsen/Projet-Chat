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

  async getRoomMessages(roomId: string, user: User): Promise<Message[]> {
    const room = await this.roomsRepository.findOne({
      where: { id: roomId },
      relations: ['owner'],
    });
    if (!room) throw new NotFoundException('Room non trouvée');

    if (room.owner !== null) {
      const isMember =
        room.owner.id === user.id ||
        (await this.roomMembersRepository.count({
          where: { room: { id: roomId }, user: { id: user.id } },
        })) > 0;
      if (!isMember)
        throw new ForbiddenException("Vous n'êtes pas membre de cette room");
    }

    return this.messagesRepository.find({
      where: { room: { id: roomId } },
      relations: ['author'],
      order: { created_at: 'ASC' },
    });
  }

  async sendMessage(
    roomId: string,
    author: User,
    content: string,
    type: MessageType = MessageType.TEXT,
    fileUrl?: string,
  ): Promise<Message> {
    if (!content && !fileUrl)
      throw new Error('Le contenu ou le fichier doit être fourni');

    const room = await this.roomsRepository.findOne({
      where: { id: roomId },
      relations: ['owner'],
    });
    if (!room) throw new NotFoundException('Room non trouvée');

    if (room.owner !== null) {
      const isMember =
        room.owner.id === author.id ||
        (await this.roomMembersRepository.count({
          where: { room: { id: roomId }, user: { id: author.id } },
        })) > 0;
      if (!isMember)
        throw new ForbiddenException("Vous n'êtes pas membre de cette room");
    }

    const message = this.messagesRepository.create({
      room,
      author,
      content,
      type,
      file_url: fileUrl,
    });

    const saved = await this.messagesRepository.save(message);

    const messageWithAuthor = await this.messagesRepository.findOne({
      where: { id: saved.id },
      relations: ['author', 'room'],
    });

    if (!messageWithAuthor)
      throw new NotFoundException('Message introuvable après sauvegarde');

    return messageWithAuthor;
  }

  async getMessageById(messageId: string): Promise<Message> {
    const msg = await this.messagesRepository.findOne({
      where: { id: messageId },
      relations: ['author', 'room'],
    });

    if (!msg) throw new NotFoundException('Message introuvable');

    return msg;
  }
}
