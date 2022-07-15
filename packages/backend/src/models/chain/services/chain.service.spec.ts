import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { MongoRepository } from 'typeorm';
import { Chain } from '../../../common/entities';
import {
  mockCreateChain,
  mockUpdateChain,
  mockChain,
} from '../../../test/mocks/chain.mock';
import { UpdateChainDto } from '../dto/update-chain.dto';
import { ChainService } from './chain.service';

export type MockType<T> = {
  [P in keyof T]?: jest.Mock<Chain>;
};

export const repositoryMockFactory: () => MockType<MongoRepository<Chain>> =
  jest.fn(() => ({
    findOne: jest.fn((entity) => entity),
    find: jest.fn().mockReturnValue([mockChain, mockChain]),
    create: jest.fn().mockReturnValue(mockChain),
    save: jest.fn().mockReturnValue(mockChain),
  }));

describe('ChainService', () => {
  let chain;
  let service: Partial<ChainService>;
  let chainRepo: MongoRepository<Chain>;

  beforeEach(async () => {
    service = {
      create: jest.fn().mockReturnValue(mockChain),
      findAll: jest.fn().mockReturnValue([mockChain, mockChain]),
      findById: jest.fn().mockReturnValue(mockChain),
      update: jest.fn().mockReturnValue(mockUpdateChain),
      remove: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: ChainService,
          useValue: service,
        },
        {
          provide: getRepositoryToken(Chain),
          useFactory: repositoryMockFactory,
        },
      ],
    }).compile();

    service = module.get<ChainService>(ChainService);
    chainRepo = module.get(getRepositoryToken(Chain));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('it should create a chain', async () => {
    chain = chainRepo.create(mockCreateChain);
    await chainRepo.save(chain);

    const result = await service.create(chain);
    expect(result.id).toEqual(chain.id);
  });

  it('should fetch all chains', async () => {
    const chains = await chainRepo.find();
    const result = await service.findAll({ query: [] });
    expect(result).toEqual(chains);
  });

  it('should fetch a chain', async () => {
    chain = chainRepo.create(mockCreateChain);
    await chainRepo.save(chain);
    const result = await service.findById(chain.id);
    expect(result.id).toBeTruthy();
  });

  it('should update a chain', async () => {
    chain = chainRepo.create(mockCreateChain);
    await chainRepo.save(chain);

    const result = await service.update(
      chain.id,
      mockUpdateChain as UpdateChainDto,
    );

    expect(result.block).toEqual(mockUpdateChain.block);
  });

  it('should remove a chain', async () => {
    chain = mockChain;

    const result = await service.remove(chain.id);

    expect(result).toBeUndefined();
  });
});
