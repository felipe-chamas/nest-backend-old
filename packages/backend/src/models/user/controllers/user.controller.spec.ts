import { Test, TestingModule } from '@nestjs/testing';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserController } from './user.controller';
import { UserService } from '../services/user.service';

import { mockUser } from '../../../test/mocks/user.mock';
import { ObjectID } from 'typeorm';
import { User } from '../../../common/entities';

describe('UserController', () => {
  let controller: UserController;
  let service: Partial<UserService>;

  beforeEach(async () => {
    service = {
      findAll: () => Promise.resolve([mockUser as User]),
      findOne: jest.fn().mockImplementation(async (id) => {
        return { ...mockUser, id: id as unknown as ObjectID } as User;
      }),
      update: jest.fn().mockImplementation(async () => {
        return {
          ...mockUser,
        } as unknown as User;
      }),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
