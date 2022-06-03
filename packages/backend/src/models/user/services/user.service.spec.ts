import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { Nft, User } from '../../../common/entities';
import {
  mockCreateUser,
  mockUpdateUser,
  mockUser,
} from '../../../test/mocks/user.mock';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserService } from './user.service';

export type MockType<T> = {
  [P in keyof T]?: jest.Mock<Nft>;
};

export const repositoryMockFactory: () => MockType<Repository<User>> = jest.fn(
  () => ({
    findOne: jest.fn((entity) => entity),
    find: jest.fn().mockReturnValue([mockUser, mockUser]),
    create: jest.fn().mockReturnValue(mockUser),
    save: jest.fn().mockReturnValue(mockUser),
  })
);

describe('UserService', () => {
  let user;
  let service: Partial<UserService>;
  let userRepo: Repository<User>;

  beforeEach(async () => {
    service = {
      create: jest.fn().mockReturnValue(mockUser),
      findAll: jest.fn().mockReturnValue([mockUser, mockUser]),
      findOne: jest.fn().mockReturnValue(mockUser),
      update: jest.fn().mockReturnValue(mockUser),
      remove: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: UserService,
          useValue: service,
        },
        {
          provide: getRepositoryToken(User),
          useFactory: repositoryMockFactory,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepo = module.get(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('it should create an user', async () => {
    user = userRepo.create(mockCreateUser);
    await userRepo.save(user);

    const result = await service.create(user);
    expect(result.id).toEqual(user.id);
  });

  it('should fetch all users', async () => {
    const users = await userRepo.find();
    const result = await service.findAll();
    expect(result).toEqual(users);
  });

  it('should fetch a user', async () => {
    user = userRepo.create(mockCreateUser);
    await userRepo.save(user);
    const result = await service.findOne({ id: user.id });
    expect(result.id).toBeTruthy();
  });

  it('should update a user', async () => {
    user = userRepo.create(mockCreateUser);
    await userRepo.save(user);

    const result = await service.update(
      user.id,
      mockUpdateUser as UpdateUserDto
    );

    expect(result.name).toEqual(mockUpdateUser.name);
  });

  it('should remove a user', async () => {
    user = mockUser;

    const result = await service.remove(user.id);

    expect(result).toBeUndefined();
  });
});
