import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Room } from '../rooms/room.entity';
import { User } from '../users/user.entity';

export enum MessageType {
  TEXT = 'text',
  FILE = 'file',
}

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Room, { nullable: true })
  @JoinColumn({ name: 'room_id' })
  room: Room | null;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'author_id' })
  author: User;

  @Column('text')
  content: string;

  @Column({ type: 'enum', enum: MessageType, default: MessageType.TEXT })
  type: MessageType;

  @Column({ nullable: true })
  file_url: string;

  @CreateDateColumn()
  created_at: Date;
}
