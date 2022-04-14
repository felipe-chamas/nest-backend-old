import { Test, TestingModule } from '@nestjs/testing';
import { ObjectID } from 'typeorm';
import {
  mockNft,
  mockCreateNft,
  mockCreateNftResponse,
} from '../../test/mocks/nft.mock';
import { CreateNftDto } from './dto/create-nft.dto';
import { UpdateNftDto } from './dto/update-nft.dto';
import { Nft } from './entities/nft.entity';
import { NftController } from './nft.controller';
import { NftService } from './nft.service';

describe('NftController', () => {
  let controller: NftController;
  let service: Partial<NftService>;

  beforeEach(async () => {
    service = {
      create: (createNftDto: CreateNftDto) =>
        Promise.resolve({
          ...mockCreateNftResponse,
          ...createNftDto,
        } as unknown as Nft),
      findAll: () => Promise.resolve([]),
      findOne: (id: string) =>
        Promise.resolve({
          ...mockCreateNft,
          id: id as unknown as ObjectID,
        } as Nft),
      update: (_: string, updatedNft: Partial<UpdateNftDto>) =>
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
      ],
    }).compile();

    controller = module.get<NftController>(NftController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a nft', async () => {
    const result = await controller.create(mockCreateNft);
    expect(result).toEqual({
      ...mockCreateNft,
      ...mockCreateNftResponse,
    });
  });

  it('should fetch all nfts', async () => {
    const result = await controller.findAll();
    expect(result).toEqual([]);
  });

  it('should fetch a nft', async () => {
    const result = await controller.findOne(mockCreateNftResponse.id);
    expect(result).toEqual({
      ...mockCreateNft,
      ...mockCreateNftResponse,
    });
  });

  it('should update a nft', async () => {
    const result = await controller.update(mockCreateNftResponse.id, {
      userId: '123',
    } as UpdateNftDto);

    expect(result).toEqual({
      ...mockNft,
      userId: '123',
    });
  });

  it('should delete a nft', async () => {
    await controller.remove('123');
    expect(service.remove).toHaveBeenCalledWith('123');
  });
});
