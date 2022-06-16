import { Test, TestingModule } from '@nestjs/testing';
import { ObjectID } from 'typeorm';
import {
  mockNft,
  mockCreateNft,
  mockCreateNftResponse,
} from '../../../test/mocks/nft.mock';
import { CreateNftDto } from '../dto/create-nft.dto';
import { UpdateNftDto } from '../dto/update-nft.dto';
import { NftController } from '../controllers/nft.controller';
import { NftService } from '../services/nft.service';
import { mockUser } from '../../../test/mocks/user.mock';
import { Nft } from '../../../common/entities';
import { NftCollectionService } from 'models/nft-collection';
import { Request } from 'express';

describe('NftController', () => {
  let controller: NftController;
  let service: Partial<NftService>;
  const nftCollectionService = NftCollectionService.prototype;

  beforeEach(async () => {
    service = {
      create: (createNftDto: CreateNftDto) =>
        Promise.resolve({
          ...mockCreateNftResponse,
          ...createNftDto,
        } as unknown as Nft),
      findAll: () => Promise.resolve([]),
      findOne: jest.fn().mockImplementation(async () => {
        return {
          ...mockNft,
          user: mockUser,
        };
      }),
      update: (_: ObjectID, updatedNft: UpdateNftDto) =>
        Promise.resolve({
          ...mockNft,
          ...updatedNft,
        } as unknown as Nft),
      remove: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NftController],
      providers: [
        {
          provide: NftService,
          useValue: service,
        },
        {
          provide: NftCollectionService,
          useValue: nftCollectionService,
        },
      ],
    }).compile();

    controller = module.get<NftController>(NftController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a nft', async () => {
    const result = await controller.create(mockCreateNft);
    expect(result.id).toBe(mockCreateNftResponse.id);
  });

  it('should fetch all nfts', async () => {
    const query = {} as unknown as Request;
    const result = await controller.findAll(query, {
      skip: 0,
      take: 10,
      sort: [],
      search: [],
    });
    expect(result).toEqual([]);
  });

  it('should fetch a nft', async () => {
    const result = await controller.findOne('123' as unknown as ObjectID);
    expect(result.metadata).toBe(mockNft.metadata);
  });

  it('should update a nft', async () => {
    const result = await controller.update(
      mockCreateNftResponse.id as unknown as ObjectID,
      {
        userId: '123' as unknown as ObjectID,
      } as UpdateNftDto,
    );

    expect(result).toEqual({
      ...mockNft,
      userId: '123',
    });
  });

  it('should delete a nft', async () => {
    await controller.remove('123' as unknown as ObjectID);
    expect(service.remove).toHaveBeenCalledWith('123');
  });
});
