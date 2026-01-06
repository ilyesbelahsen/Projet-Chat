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

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  // SIGNUP
  async signup(
    dto: SignupDto,
  ): Promise<{ user: Partial<User>; token: string }> {
    const existingUser = await this.usersService.findByEmail(dto.email);
    if (existingUser) throw new BadRequestException('Email déjà utilisé');

    const user = await this.usersService.create({
      username: dto.username,
      email: dto.email,
      password: dto.password,
    });

    const token = this.jwtService.sign({
      id: user.id,
      username: user.username,
    });

    return {
      user: { id: user.id, username: user.username, email: user.email },
      token,
    };
  }

  // LOGIN
  async login(dto: LoginDto): Promise<{ user: Partial<User>; token: string }> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Utilisateur non trouvé');

    const isMatch = bcrypt.compareSync(dto.password, user.password_hash);
    if (!isMatch) throw new UnauthorizedException('Mot de passe incorrect');

    const token = this.jwtService.sign({
      id: user.id,
      username: user.username,
    });

    return {
      user: { id: user.id, username: user.username, email: user.email },
      token,
    };
  }

  // VALIDATE USER
  async validateUser(userId: string): Promise<User | null> {
    return await this.usersService.findById(userId);
  }
}
