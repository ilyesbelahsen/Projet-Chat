import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';
import { User } from '../users/user.entity';

@Controller('rooms')
@UseGuards(JwtAuthGuard)
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Get('general')
  async getGeneralRoom() {
    return this.roomsService.getGeneralRoom();
  }

  @Get('my-rooms')
  async getMyRooms(@Req() req: Request) {
    const user = req.user as User;
    return this.roomsService.getUserRooms(user.id);
  }

  @Post('create')
  async createRoom(@Body('name') name: string, @Req() req: Request) {
    const user = req.user as User;
    return this.roomsService.createRoom(name, user);
  }

  @Post(':id/add-member')
  async addMember(
    @Param('id') roomId: string,
    @Body('username') username: string,
    @Req() req: Request,
  ) {
    const addedBy = req.user as User;
    return this.roomsService.addMember(roomId, username, addedBy);
  }

  @Delete(':id')
  async deleteRoom(@Param('id') roomId: string, @Req() req: Request) {
    const user = req.user as User;
    return this.roomsService.deleteRoom(roomId, user);
  }

  // 🔹 Récupérer les détails d’une room (owner + membres)
  @Get(':id')
  async getRoom(@Param('id') roomId: string) {
    return this.roomsService.getRoom(roomId);
  }

  // 🔹 Supprimer un membre
  @Delete(':id/members/:userId')
  async removeMember(
    @Param('id') roomId: string,
    @Param('userId') userId: string,
    @Req() req: Request,
  ) {
    const user = req.user as User;
    return this.roomsService.removeMember(roomId, userId, user);
  }
}
