import { NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import {
  createConnection,
  getConnection,
  getRepository,
  Repository,
} from 'typeorm';
import {
  mockCreateUser,
  mockUpdateUser,
  mockUser,
} from '../../test/mocks/user.mock';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UserService } from './user.service';

const dbConnName = 'default';
const config = new ConfigService();

describe('UserService', () => {
  let user;
  let service: Partial<UserService>;
  let userRepo: Repository<User>;

  beforeEach(async () => {
    await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    const connection = await createConnection({
      type: 'mongodb',
      url: config.get<string>('database.url'),
      entities: [User],
      useNewUrlParser: true,
      logging: true,
      useUnifiedTopology: true,
      name: dbConnName,
    });

    userRepo = getRepository(User, dbConnName);
    service = new UserService(userRepo);

    return connection;
  });

  afterEach(async () => {
    await getConnection(dbConnName).close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('it should create an user', async () => {
    user = userRepo.create(mockCreateUser);
    await userRepo.save(user);

    const result = await service.create(user);
    expect(result).toEqual({ user });
  });

  it('should fetch all users', async () => {
    const users = await userRepo.find();
    const result = await service.findAll();
    expect(result).toEqual(users);
  });

  it('should fetch a user', async () => {
    user = userRepo.create(mockCreateUser);
    await userRepo.save(user);
    const userFound = await userRepo.findOne(user.id);
    const result = await service.findOne(user.id);
    expect(result).toEqual(userFound);
  });

  it('should fail to fetch a user', async () => {
    expect(await userRepo.findOne(mockUser.id)).toBeUndefined();
    const userId = mockUser.id as unknown as string;
    expect(await service.findOne(userId)).toBeUndefined();
  });

  it('should throw an error when trying to fetch a user', async () => {
    const userId = mockUser.id as unknown as string;
    const user = await service.findOne(userId);
    const error = () => {
      throw new NotFoundException(`User with id ${userId} not found`);
    };
    if (!user) expect(error).toThrow();
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
    user = userRepo.create(mockCreateUser);
    await userRepo.save(user);

    const result = await service.remove(user.id);

    expect(result.id).toBeUndefined();
  });
});
