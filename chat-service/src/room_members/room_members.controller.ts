import {Controller, UseGuards} from '@nestjs/common';
import { RemoteAuthGuard } from '../auth/guards/remote-auth.guard';


@UseGuards(RemoteAuthGuard)
@Controller('room-members')
export class RoomMembersController {}
