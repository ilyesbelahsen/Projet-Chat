import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

    if (dto.username) user.username = dto.username;
    if (dto.email) user.email = dto.email;
    if (dto.password) user.password_hash = bcrypt.hashSync(dto.password, 10);

    return await this.usersRepository.save(user);
  }

  async delete(id: string): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Utilisateur non trouvé');
    await this.usersRepository.remove(user);
  }
}
