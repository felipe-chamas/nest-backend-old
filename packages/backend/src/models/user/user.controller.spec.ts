import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';

import { mockUser } from '../../test/mocks/user.mock';

describe('UserController', () => {
  let controller: UserController;
  let service: Partial<UserService>;

  beforeEach(async () => {
    service = {
      create: (createUserDto: CreateUserDto) =>
        Promise.resolve({ user: { ...mockUser, ...createUserDto } as User }),
      findAll: () => Promise.resolve([mockUser as User]),
      findOne: (id: string) => Promise.resolve({ ...mockUser, id } as User),
      update: (_: string, updatedUser: Partial<UpdateUserDto>) =>
        Promise.resolve({
          ...mockUser,
          ...updatedUser,
        } as User),
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

  it('should create and user', async () => {
    const result = await controller.create({
      name: 'John Doe',
      email: 'john@gmail.com',
    });

    expect(result).toEqual({ user: mockUser as User });
  });

  it('should fetch all users', async () => {
    const result = await controller.findAll();
    expect(result).toEqual([mockUser]);
  });

  it('should fetch a user', async () => {
    const result = await controller.findOne('123');
    expect(result).toEqual({ ...mockUser, id: '123' });
  });

  it('should update a user', async () => {
    const result = await controller.update('123', {
      name: 'Miagi',
    } as UpdateUserDto);
    expect(result).toEqual({ ...mockUser, name: 'Miagi' });
  });

  it('should delete a user', async () => {
    await controller.remove('123');
    expect(service.remove).toHaveBeenCalledWith('123');
  });
});
