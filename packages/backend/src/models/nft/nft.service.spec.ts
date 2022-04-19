import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import {
  createConnection,
  getConnection,
  getRepository,
  Repository,
} from 'typeorm';
import { mockCreateNft, mockUpdateNft } from '../../test/mocks/nft.mock';
import { NftCollection } from '../nft-collection/entities/nft-collection.entity';
import { User } from '../user/entities/user.entity';
import { Nft } from './entities/nft.entity';
import { NftService } from './nft.service';

const dbConnName = 'default';
const config = new ConfigService();

describe('NftService', () => {
  let service: Partial<NftService>;
  let neftRepo: Repository<Nft>;

  beforeEach(async () => {
    await Test.createTestingModule({
      providers: [
        { provide: getRepositoryToken(Nft), useClass: Repository },
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(NftCollection),
          useClass: Repository,
        },
      ],
    }).compile();

    const connection = await createConnection({
      type: 'mongodb',
      url: config.get<string>('database.url'),
      entities: [Nft, User, NftCollection],
      useNewUrlParser: true,
      logging: true,
      useUnifiedTopology: true,
      name: dbConnName,
    });

    neftRepo = getRepository(Nft, dbConnName);
    service = new NftService(neftRepo);

    return connection;
  });

  afterEach(async () => {
    await getConnection(dbConnName).close();
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

    const id = nft.id as unknown as string;
    const result = await service.findOne(id);
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
    const result = await service.update(nftId, mockUpdateNft);
    expect(result).toEqual({ ...mockCreateNft, ...result });
  });

  it('should delete an nft', async () => {
    const nft = neftRepo.create(mockCreateNft);
    await neftRepo.save(nft);
    const id = nft.id as unknown as string;

    const result = await service.remove(id);
    expect(result.id).toBeUndefined();
  });
});
