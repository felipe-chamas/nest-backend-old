import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import {
  createConnection,
  getConnection,
  getRepository,
  Repository,
} from 'typeorm';
import { Nft, NftCollection, User } from '../../../common/entities';
import { mockCreateUser, mockUpdateUser } from '../../../test/mocks/user.mock';
import { UpdateUserDto } from '../dto/update-user.dto';
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
      entities: [User, Nft, NftCollection],
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
    expect(result.id).toEqual(user.id);
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
