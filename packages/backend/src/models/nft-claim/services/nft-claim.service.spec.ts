import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import {
  mockCreateNftClaim,
  mockNftClaim,
  mockUpdateNftClaim,
} from '../../../test/mocks/nft-claim.mock';
import { NftClaim } from '../../../common/entities/nft-claim.entity';
import { NftClaimService } from './nft-claim.service';

export type MockType<T> = {
  [P in keyof T]?: jest.Mock<NftClaim>;
};

export const repositoryMockFactory: () => MockType<Repository<NftClaim>> =
  jest.fn(() => ({
    findOne: jest.fn((entity) => entity),
    find: jest.fn().mockReturnValue([mockNftClaim, mockNftClaim]),
    create: jest.fn().mockReturnValue(mockNftClaim),
    save: jest.fn().mockReturnValue(mockNftClaim),
  }));

describe('NftClaimService', () => {
  let service: Partial<NftClaimService>;
  let nftClaimRepo: Repository<NftClaim>;

  beforeEach(async () => {
    service = {
      create: jest.fn().mockReturnValue(mockNftClaim),
      findAll: jest.fn().mockReturnValue([mockNftClaim, mockNftClaim]),
      findOne: jest.fn().mockReturnValue(mockNftClaim),
      update: jest.fn().mockReturnValue(mockNftClaim),
      remove: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: NftClaimService,
          useValue: service,
        },
        {
          provide: getRepositoryToken(NftClaim),
          useFactory: repositoryMockFactory,
        },
      ],
    }).compile();

    service = module.get<NftClaimService>(NftClaimService);
    nftClaimRepo = module.get(getRepositoryToken(NftClaim));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create an nft claim', async () => {
    const nftClaim = nftClaimRepo.create(mockCreateNftClaim);
    await nftClaimRepo.save(nftClaim);

    const result = await service.create(mockCreateNftClaim);
    expect(result).toEqual({ ...mockCreateNftClaim, ...result });
  });

  it('should find an nft claim', async () => {
    const nftClaim = nftClaimRepo.create(mockCreateNftClaim);
    await nftClaimRepo.save(nftClaim);

    const id = nftClaim.id as unknown as string;
    const result = await service.findOne(id);
    expect(result).toEqual({ ...mockCreateNftClaim, ...result });
  });

  it('should find all nft claims', async () => {
    const nftClaims = await nftClaimRepo.find();
    const result = await service.findAll();
    expect(result).toEqual(nftClaims);
  });

  it('should update an nft claim', async () => {
    const nftClaim = nftClaimRepo.create(mockCreateNftClaim);
    await nftClaimRepo.save(nftClaim);

    const nftClaimId = nftClaim.id as unknown as string;
    const result = await service.update(nftClaimId, mockUpdateNftClaim);
    expect(result).toEqual({ ...mockCreateNftClaim, ...result });
  });

  it('should delete an nft claim', async () => {
    const nftClaim = mockNftClaim;
    const id = nftClaim.id as unknown as string;

    const result = await service.remove(id);
    expect(result).toBeUndefined();
  });
});
