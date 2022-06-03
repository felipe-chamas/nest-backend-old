import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { ObjectID, Repository } from 'typeorm';
import { Nft } from '../../../common/entities';
import {
  mockCreateNft,
  mockUpdateNft,
  mockNft,
} from '../../../test/mocks/nft.mock';
import { NftService } from './nft.service';

export type MockType<T> = {
  [P in keyof T]?: jest.Mock<Nft>;
};

export const repositoryMockFactory: () => MockType<Repository<Nft>> = jest.fn(
  () => ({
    findOne: jest.fn((entity) => entity),
    find: jest.fn().mockReturnValue([mockCreateNft, mockCreateNft]),
    create: jest.fn().mockReturnValue(mockCreateNft),
    save: jest.fn().mockReturnValue(mockCreateNft),
  })
);

describe('NftService', () => {
  let service: Partial<NftService>;
  let neftRepo: MockType<Repository<Nft>>;

  beforeEach(async () => {
    service = {
      create: jest.fn().mockReturnValue(mockCreateNft),
      findAll: jest.fn().mockReturnValue([mockCreateNft, mockCreateNft]),
      findOne: jest.fn().mockReturnValue(mockCreateNft),
      update: jest.fn().mockReturnValue(mockUpdateNft),
      remove: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: NftService, useValue: service },
        {
          provide: getRepositoryToken(Nft),
          useFactory: repositoryMockFactory,
        },
      ],
    }).compile();

    service = module.get<NftService>(NftService);
    neftRepo = module.get(getRepositoryToken(Nft));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create an nft', async () => {
    const nft = neftRepo.create(mockCreateNft);
    await neftRepo.save(nft);

    const result = await service.create(mockCreateNft);
    expect(result).toEqual({ ...mockCreateNft, ...result });
  });

  it('should find an nft', async () => {
    const nft = neftRepo.create(mockCreateNft);
    await neftRepo.save(nft);

    const id = nft.id as unknown as ObjectID;
    const result = await service.findOne({ id });
    expect(result).toEqual({ ...mockCreateNft, ...result });
  });

  it('should find all nfts', async () => {
    const nfts = await neftRepo.find();
    const result = await service.findAll();
    expect(result).toEqual(nfts);
  });

  it('should update an nft', async () => {
    const nft = neftRepo.create(mockCreateNft);
    await neftRepo.save(nft);

    const nftId = nft.id as unknown as string;
    const result = await service.update(
      nftId as unknown as ObjectID,
      mockUpdateNft
    );
    expect(result).toEqual({ ...mockUpdateNft, ...result });
  });

  it('should delete an nft', async () => {
    const nft = mockNft;
    const id = nft.id as unknown as string;

    const result = await service.remove(id as unknown as ObjectID);

    expect(result).toBeUndefined();
  });
});
