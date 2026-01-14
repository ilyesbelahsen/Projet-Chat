// src/rooms/rooms.controller.ts
import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CurrentUser } from '../auth-client/current-user.decorator';
import { AuthUser } from '../auth-client/auth-user.type';
import { RemoteAuthGuard } from '../auth/guards/remote-auth.guard';
import { AuthClientService } from '../auth-client/auth-client.service';

@Controller('rooms')
@UseGuards(RemoteAuthGuard)
export class RoomsController {
  constructor(
    private readonly roomsService: RoomsService,
    private readonly authClient: AuthClientService,
  ) {}

  @Get('general')
  async getGeneralRoom(@CurrentUser() user: AuthUser) {
    // Auto-join the user to the general room
    return this.roomsService.getOrCreateGeneralRoom(user);
  }

  @Get('my-rooms')
  async getMyRooms(@CurrentUser() user: AuthUser) {
    return this.roomsService.getUserRooms(user.id);
  }

  @Post('create')
  async createRoom(
    @CurrentUser() user: AuthUser,
    @Body() body: { name: string },
  ) {
    return this.roomsService.createRoom(user.id, body.name, user.username ?? null);
  }

  @Post(':id/add-member')
  async addMember(
    @Param('id') roomId: string,
    @CurrentUser() user: AuthUser,
    @Body() body: { username: string },
  ) {
    // Look up the user by username via auth-service
    const targetUser = await this.authClient.findUserByUsername(body.username);
    return this.roomsService.addMember(roomId, targetUser.id, user.id, targetUser.username);
  }

  @Get(':id')
  async getRoom(@Param('id') roomId: string) {
    return this.roomsService.getRoom(roomId);
  }

  @Delete(':id/members/:userId')
  async removeMember(
    @Param('id') roomId: string,
    @Param('userId') userIdToRemove: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.roomsService.removeMember(roomId, userIdToRemove, user.id);
  }

  @Delete(':id')
  async deleteRoom(@Param('id') roomId: string, @CurrentUser() user: AuthUser) {
    return this.roomsService.deleteRoom(roomId, user.id);
  }
}
