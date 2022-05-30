import { Test, TestingModule } from '@nestjs/testing';
import { ObjectID } from 'typeorm';
import {
  mockNftClaim,
  mockCreateNftClaim,
  mockCreateNftClaimResponse,
} from '../../../test/mocks/nft-claim.mock';
import { CreateNftClaimDto } from '../dto/create-nft-claim.dto';
import { UpdateNftClaimDto } from '../dto/update-nft-claim.dto';
import { NftClaim } from '../../../common/entities/nft-claim.entity';
import { NftClaimController } from './nft-claim.controller';
import { NftClaimService } from '../services/nft-claim.service';

describe('NftClaimController', () => {
  let controller: NftClaimController;
  let service: Partial<NftClaimService>;

  beforeEach(async () => {
    service = {
      create: (createNftClaimDto: CreateNftClaimDto) =>
        Promise.resolve({
          ...mockCreateNftClaimResponse,
          ...createNftClaimDto,
        } as unknown as NftClaim),
      findAll: () => Promise.resolve([]),
      findOne: (id: string) =>
        Promise.resolve({
          ...mockCreateNftClaim,
          id: id as unknown as ObjectID,
        } as NftClaim),
      update: (_: string, updatedNftClaim: Partial<UpdateNftClaimDto>) =>
        Promise.resolve({
          ...mockNftClaim,
          ...updatedNftClaim,
        } as unknown as NftClaim),
      remove: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NftClaimController],
      providers: [
        {
          provide: NftClaimService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<NftClaimController>(NftClaimController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a nft claim', async () => {
    const result = await controller.create(mockCreateNftClaim);
    expect(result).toEqual({
      ...mockCreateNftClaim,
      ...mockCreateNftClaimResponse,
    });
  });

  it('should fetch all nft claims', async () => {
    const result = await controller.findAll({
      skip: 0,
      take: 10,
      sort: [],
      search: [],
    });
    expect(result).toEqual([]);
  });

  it('should fetch a nft claim', async () => {
    const result = await controller.findOne(mockCreateNftClaimResponse.id);
    expect(result).toEqual({
      ...mockCreateNftClaim,
      ...mockCreateNftClaimResponse,
    });
  });

  it('should update a nft claim', async () => {
    const result = await controller.update(mockCreateNftClaimResponse.id, {
      merkleRoot: '0x1',
    } as UpdateNftClaimDto);

    expect(result).toEqual({
      ...mockNftClaim,
      merkleRoot: '0x1',
    });
  });

  it('should delete a nft claim', async () => {
    await controller.remove('123');
    expect(service.remove).toHaveBeenCalledWith('123');
  });
});
