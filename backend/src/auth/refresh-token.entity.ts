import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn } from 'typeorm';

@Entity('refresh_tokens')
export class RefreshTokenEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Index()
    @Column()
    userId: string;

    @Index()
    @Column({ type: 'varchar', length: 64 })
    tokenHash: string;

    @Column({ type: 'datetime' })
    expiresAt: Date;

    @Column({ type: 'datetime', nullable: true })
    revokedAt: Date | null;

    @CreateDateColumn()
    createdAt: Date;
}
