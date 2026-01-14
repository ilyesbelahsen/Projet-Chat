import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { RoomMember } from '../room_members/room-member.entity';
import { Message } from '../messages/message.entity';

@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ type: 'varchar', length: 36 })
  ownerUserId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  ownerUsernameSnapshot: string | null;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => RoomMember, (m) => m.room)
  members: RoomMember[];

  @OneToMany(() => Message, (m) => m.room)
  messages: Message[];
}
