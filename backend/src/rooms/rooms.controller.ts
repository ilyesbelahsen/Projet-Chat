import {
  Controller,
  Get,
  Post,
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
    @Body('userId') userId: string,
    @Req() req: Request,
  ) {
    const addedBy = req.user as User;
    const user = { id: userId } as User; // simple placeholder, récupérer correctement depuis UserService si nécessaire
    return this.roomsService.addMember(roomId, user, addedBy);
  }
}
