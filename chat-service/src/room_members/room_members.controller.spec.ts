import { Test, TestingModule } from '@nestjs/testing';
import { RoomMembersController } from './room_members.controller';

describe('RoomMembersController', () => {
  let controller: RoomMembersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoomMembersController],
    }).compile();

    controller = module.get<RoomMembersController>(RoomMembersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
