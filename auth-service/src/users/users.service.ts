import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return await this.usersRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return await this.usersRepository.findOne({ where: { id } });
  }

  async findAll(): Promise<User[]> {
    return await this.usersRepository.find();
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { username } });
  }

  async create(dto: CreateUserDto): Promise<User> {
    const hashedPassword = bcrypt.hashSync(dto.password, 10);
    const user = this.usersRepository.create({
      username: dto.username,
      email: dto.email,
      password_hash: hashedPassword,
    });
    return await this.usersRepository.save(user);
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Utilisateur non trouvé');

    // Vérifier unicité du username (si modifié)
    if (dto.username && dto.username !== user.username) {
      const existingUsername = await this.usersRepository.findOne({
        where: { username: dto.username, id: Not(id) }
      });
      if (existingUsername) {
        throw new BadRequestException('Ce nom d\'utilisateur est déjà utilisé');
      }
      user.username = dto.username;
    }

    // Vérifier unicité de l'email (si modifié)
    if (dto.email && dto.email !== user.email) {
      const existingEmail = await this.usersRepository.findOne({
        where: { email: dto.email, id: Not(id) }
      });
      if (existingEmail) {
        throw new BadRequestException('Cet email est déjà utilisé par un autre compte');
      }
      user.email = dto.email;
    }

    // Changement de mot de passe
    if (dto.password) {
      // Vérifier que l'ancien mot de passe est fourni
      if (!dto.currentPassword) {
        throw new BadRequestException('L\'ancien mot de passe est requis pour en définir un nouveau');
      }

      // Vérifier que l'ancien mot de passe est correct
      const isOldPasswordValid = await bcrypt.compare(dto.currentPassword, user.password_hash);
      if (!isOldPasswordValid) {
        throw new BadRequestException('L\'ancien mot de passe est incorrect');
      }

      user.password_hash = bcrypt.hashSync(dto.password, 10);
    }

    return await this.usersRepository.save(user);
  }

  async delete(id: string): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Utilisateur non trouvé');
    await this.usersRepository.remove(user);
  }

  async updatePassword(userId: string, newPassword: string) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    const salt = await bcrypt.genSalt(10);
    user.password_hash = await bcrypt.hash(newPassword, salt);

    await this.usersRepository.save(user);
    return { ok: true };
  }
}
