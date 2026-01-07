import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/user.entity';
import { LoginDto, SignupDto } from './signup.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshTokenEntity } from './refresh-token.entity';
import { randomBytes, createHash } from 'crypto';


@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @InjectRepository(RefreshTokenEntity)
    private readonly refreshRepo: Repository<RefreshTokenEntity>,
  ) {}

  private hash(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private async createRefreshToken(userId: string) {
    const raw = randomBytes(48).toString('hex');
    const tokenHash = this.hash(raw);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 14); // 14 jours

    await this.refreshRepo.save({
      userId,
      tokenHash,
      expiresAt,
      revokedAt: null,
    });

    return raw;
  }

  private signAccessToken(user: { id: string; username: string }) {
    return this.jwtService.sign({
      id: user.id,
      username: user.username,
    });
  }

  // SIGNUP
  async signup(
    dto: SignupDto,
  ): Promise<{ user: { id: string; username: string; email: string }; token: string; refreshToken: string }> {
    const existingUser = await this.usersService.findByEmail(dto.email);
    if (existingUser) throw new BadRequestException('Email déjà utilisé');

    const user = await this.usersService.create({
      username: dto.username,
      email: dto.email,
      password: dto.password,
    });

    const token = this.signAccessToken({ id: user.id, username: user.username });
    const refreshToken = await this.createRefreshToken(user.id);

    return {
      user: { id: user.id, username: user.username, email: user.email },
      token,
      refreshToken,
    };
  }

  // LOGIN
  async login(dto: LoginDto): Promise<{
    user: { id: string; username: string; email: string };
    token: string;
    refreshToken: string
  }> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Utilisateur non trouvé');

    const isMatch = await bcrypt.compare(dto.password, user.password_hash);
    if (!isMatch) throw new UnauthorizedException('Mot de passe incorrect');

    const token = this.signAccessToken({ id: user.id, username: user.username });

    const refreshToken = await this.createRefreshToken(user.id);


    return {
      user: { id: user.id, username: user.username, email: user.email },
      token,
      refreshToken,
    };
  }

  // VALIDATE USER
  async validateUser(userId: string): Promise<User | null> {
    return await this.usersService.findById(userId);
  }

  async refresh(raw: string) {
    const tokenHash = this.hash(raw);
    const row = await this.refreshRepo.findOne({ where: { tokenHash } });

    if (!row || row.revokedAt) throw new UnauthorizedException('Refresh invalide');
    if (row.expiresAt.getTime() < Date.now()) throw new UnauthorizedException('Refresh expiré');

    // rotation : révoquer l’ancien
    row.revokedAt = new Date();
    await this.refreshRepo.save(row);

    const user = await this.usersService.findById(row.userId);
    if (!user) throw new UnauthorizedException('User introuvable');

    const token = this.signAccessToken({ id: user.id, username: user.username });
    const refreshToken = await this.createRefreshToken(user.id);

    return {
      user: { id: user.id, username: user.username, email: user.email },
      token,
      refreshToken,
    };
  }

  async logout(raw: string) {
    const tokenHash = this.hash(raw);
    const row = await this.refreshRepo.findOne({ where: { tokenHash } });
    if (row && !row.revokedAt) {
      row.revokedAt = new Date();
      await this.refreshRepo.save(row);
    }
    return { ok: true };
  }


}
