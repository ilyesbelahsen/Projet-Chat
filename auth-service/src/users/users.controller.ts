import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Récupérer tous les utilisateurs
  @Get()
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  // Rechercher un utilisateur par username
  @Get('by-username/:username')
  async findByUsername(@Param('username') username: string): Promise<{ id: string; username: string }> {
    const user = await this.usersService.findByUsername(username);
    if (!user) throw new NotFoundException('Utilisateur non trouvé');
    return { id: user.id, username: user.username };
  }

  // Récupérer un utilisateur par ID
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User> {
    const user = await this.usersService.findById(id);
    if (!user) throw new NotFoundException('Utilisateur non trouvé');
    return user;
  }

  // Créer un utilisateur
  @Post()
  async create(@Body() dto: CreateUserDto): Promise<User> {
    return this.usersService.create(dto);
  }

  // Mettre à jour un utilisateur
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.update(id, dto);
  }

  // Supprimer un utilisateur
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    await this.usersService.delete(id);
    return { message: 'Utilisateur supprimé' };
  }
}
