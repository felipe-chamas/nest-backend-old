import { Test, TestingModule } from '@nestjs/testing';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserController } from './user.controller';
import { UserService } from '../services/user.service';

import { mockUser, mockAdmin } from '../../../test/mocks/user.mock';
import { ObjectID } from 'typeorm';
import { User } from '../../../common/entities';
import { Role } from 'common/enums/role.enum';
import { SessionData } from 'express-session';

describe('UserController', () => {
  let controller: UserController;
  let service: Partial<UserService>;

  beforeEach(async () => {
    service = {
      findAll: () => Promise.resolve([mockUser as User]),
      findOne: jest.fn().mockImplementation(async (id) => {
        return { ...mockUser, id: id as unknown as ObjectID } as User;
      }),
      update: (_: ObjectID, updatedUser: Partial<UpdateUserDto>) =>
        Promise.resolve({
          ...updatedUser,
        } as unknown as User),
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

  it('should fetch an user', async () => {
    const result = await controller.findOne(mockUser.id);

    expect(result).toMatchObject({
      email: mockUser.email,
      name: mockUser.name,
    });
  });

  describe('Update', () => {
    it('should update an user', async () => {
      const updatedUser = {
        email: 'testEmail@test.com',
        roles: [Role.USER_ADMIN],
      } as UpdateUserDto;

      const result = await controller.update(mockUser.id, updatedUser, {
        user: mockAdmin,
      } as unknown as SessionData);

      expect(result).toMatchObject(updatedUser);
    });

    it('should not update roles when logged in user is not ROLES_ADMIN', async () => {
      const result = await controller.update(
        mockUser.id,
        {
          email: 'testEmail@test.com',
          roles: [Role.USER_ADMIN],
        } as UpdateUserDto,
        { user: mockUser } as unknown as SessionData,
      );

      expect(result).toMatchObject({ roles: [] });
    });
  });

  it('should delete an user', () => {
    controller.remove(mockUser.id);
    expect(service.remove).toHaveBeenCalledWith(mockUser.id);
  });
});
