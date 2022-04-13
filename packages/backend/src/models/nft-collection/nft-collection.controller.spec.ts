import { Test, TestingModule } from '@nestjs/testing';
import { NftCollectionController } from './nft-collection.controller';
import { NftCollectionService } from './nft-collection.service';

import {
  mockCreateNftCollection,
  mockNftCollection,
} from '../../test/mocks/nft-collection.mock';
import { NftCollection } from './entities/nft-collection.entity';
import { CreateNftCollectionDto } from './dto/create-nft-collection.dto';

describe('NftCollectionController', () => {
  let controller: NftCollectionController;
  let service: Partial<NftCollectionService>;

  beforeEach(async () => {
    service = {
      create: (createNftCollectionDto: CreateNftCollectionDto) =>
        Promise.resolve({
          ...mockNftCollection,
          ...createNftCollectionDto,
        }),
      findAll: () => Promise.resolve([mockNftCollection as NftCollection]),
      findOne: (id: string) =>
        Promise.resolve({
          collection: { name: mockNftCollection.name, id } as NftCollection,
          nfts: mockNftCollection.nfts,
        }),
      update: (_: string, updatedNftCollection: Partial<NftCollection>) =>
        Promise.resolve({
          ...mockNftCollection,
          ...updatedNftCollection,
        }),
      remove: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NftCollectionController],
      providers: [
        {
          provide: NftCollectionService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<NftCollectionController>(NftCollectionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create and nftCollection', async () => {
    const result = await controller.create(mockCreateNftCollection);

    expect(result).toEqual({ ...mockCreateNftCollection, ...result });
  });

  it('should fetch all nftCollections', async () => {
    const result = await controller.findAll();
    expect(result).toEqual([mockNftCollection]);
  });

  it('should fetch a nftCollection', async () => {
    const result = await controller.findOne(mockNftCollection.id);
    expect(result.collection.name).toEqual(mockNftCollection.name);
  });

  it('should update a nftCollection', async () => {
    const result = await controller.update(mockNftCollection.id, {
      name: mockNftCollection.name,
    });

    expect(result.name).toEqual(mockNftCollection.name);
  });

  it('should delete a nftCollection', async () => {
    await controller.remove(mockNftCollection.id);
    expect(service.remove).toHaveBeenCalledWith(mockNftCollection.id);
  });
});
