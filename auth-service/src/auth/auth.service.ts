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
import { PasswordResetTokenEntity } from './password-reset.entity';
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
  constructor(
      private readonly usersService: UsersService,
      private readonly jwtService: JwtService,
      @InjectRepository(RefreshTokenEntity)
      private readonly refreshRepo: Repository<RefreshTokenEntity>,
      @InjectRepository(PasswordResetTokenEntity)
      private readonly resetRepo: Repository<PasswordResetTokenEntity>,
      private readonly emailService: EmailService,
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

  /**
   * Access token = JWT "court"
   * On inclut id (et aussi sub pour standard JWT) sans casser ton existant.
   */
  private signAccessToken(user: { id: string; username: string }) {
    return this.jwtService.sign({
      id: user.id,
      sub: user.id, // ✅ standard JWT
      username: user.username,
    });
  }

  // SIGNUP
  async signup(dto: SignupDto): Promise<{
    user: { id: string; username: string; email: string };
    token: string;
    refreshToken: string;
  }> {
    const existingEmail = await this.usersService.findByEmail(dto.email);
    if (existingEmail) throw new BadRequestException('Email déjà utilisé');

    const existingUsername = await this.usersService.findByUsername(dto.username);
    if (existingUsername) throw new BadRequestException('Nom d\'utilisateur déjà utilisé');

    const user = await this.usersService.create({
      username: dto.username,
      email: dto.email,
      password: dto.password,
    });

    const token = this.signAccessToken({
      id: user.id,
      username: user.username,
    });
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
    refreshToken: string;
  }> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Utilisateur non trouvé');

    const isMatch = await bcrypt.compare(dto.password, user.password_hash);
    if (!isMatch) throw new UnauthorizedException('Mot de passe incorrect');

    const token = this.signAccessToken({
      id: user.id,
      username: user.username,
    });

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

    if (!row || row.revokedAt)
      throw new UnauthorizedException('Refresh invalide');
    if (row.expiresAt.getTime() < Date.now())
      throw new UnauthorizedException('Refresh expiré');

    // rotation : révoquer l’ancien
    row.revokedAt = new Date();
    await this.refreshRepo.save(row);

    const user = await this.usersService.findById(row.userId);
    if (!user) throw new UnauthorizedException('User introuvable');

    const token = this.signAccessToken({
      id: user.id,
      username: user.username,
    });
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

  async requestPasswordReset(email: string) {
    // Toujours répondre OK même si email inexistant (anti-enumération)
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // En mode dev, on retourne quand même ok: true sans lien
      return { ok: true };
    }

    const raw = randomBytes(48).toString('hex');
    const tokenHash = this.hash(raw);

    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1h

    await this.resetRepo.save({
      userId: user.id,
      tokenHash,
      expiresAt,
      usedAt: null,
    });

    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:5000';
    const link = `${frontendUrl}/reset-password?token=${raw}`;

    // Envoyer l'email via AWS SES (ou log en fallback)
    await this.emailService.sendPasswordResetEmail(email, link);

    // En mode DEV/LAB, retourner le lien pour affichage dans la console du navigateur
    const isDevMode = process.env.DEV_MODE === 'true';
    if (isDevMode) {
      return { ok: true, resetLink: link };
    }

    return { ok: true };
  }

  async resetPassword(token: string, newPassword: string) {
    const tokenHash = this.hash(token);

    const row = await this.resetRepo.findOne({ where: { tokenHash } });
    if (!row) throw new UnauthorizedException('Token invalide');
    if (row.usedAt) throw new UnauthorizedException('Token déjà utilisé');
    if (row.expiresAt.getTime() < Date.now())
      throw new UnauthorizedException('Token expiré');

    const user = await this.usersService.findById(row.userId);
    if (!user) throw new UnauthorizedException('Utilisateur introuvable');

    await this.usersService.updatePassword(user.id, newPassword);

    row.usedAt = new Date();
    await this.resetRepo.save(row);

    return { ok: true };
  }

  /**
   * ✅ ETAPE 8 — Introspection / Vérification de token
   * Retourne toujours { active: false } si token invalide/expiré.
   * Ne throw pas (format "introspect").
   */
  async introspectAccessToken(token: string): Promise<{
    active: boolean;
    user?: { id: string; username: string; email: string };
    payload?: any;
  }> {
    try {
      // Vérifie signature + exp automatiquement
      const payload = await this.jwtService.verifyAsync(token);

      // Compat: accepte id ou sub
      const userId = payload?.id ?? payload?.sub;
      if (!userId || typeof userId !== 'string') {
        return { active: false };
      }

      // Optionnel mais propre: confirmer que le user existe encore
      const user = await this.usersService.findById(userId);
      if (!user) return { active: false };

      return {
        active: true,
        user: { id: user.id, username: user.username, email: user.email },
        payload,
      };
    } catch {
      return { active: false };
    }
  }
}
