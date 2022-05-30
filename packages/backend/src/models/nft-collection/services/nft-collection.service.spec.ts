import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { getConnection, getRepository, Repository } from 'typeorm';
import { mockCreateNftCollection } from '../../../test/mocks/nft-collection.mock';
import { NftCollectionService } from './nft-collection.service';
import { ConfigService } from '@nestjs/config';
import { createConnection } from 'typeorm';
import { Nft, NftCollection, User } from '../../../common/entities';

const dbConnName = 'default';
const config = new ConfigService();
describe('NftCollectionService', () => {
  let nftCollection;
  let service: NftCollectionService;
  let nftCollectionRepo: Repository<NftCollection>;

  beforeEach(async () => {
    await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(NftCollection),
          useClass: Repository,
        },
      ],
    }).compile();

    const connection = await createConnection({
      type: 'mongodb',
      url: config.get<string>('database.url'),
      entities: [NftCollection, Nft, User],
      useNewUrlParser: true,
      logging: true,
      useUnifiedTopology: true,
      name: dbConnName,
    });

    nftCollectionRepo = getRepository(NftCollection, dbConnName);
    service = new NftCollectionService(nftCollectionRepo);

    return connection;
  });

  afterEach(async () => {
    await getConnection(dbConnName).close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create an nftCollection', async () => {
    nftCollection = nftCollectionRepo.create(mockCreateNftCollection);
    await nftCollectionRepo.save(nftCollection);

    const result = await service.create(mockCreateNftCollection);
    expect(result).toEqual({ ...mockCreateNftCollection, ...result });
  });

  it('should fetch all nftCollections', async () => {
    const nftCollections = await nftCollectionRepo.find();
    const result = await service.findAll();
    expect(result).toEqual(nftCollections);
  });

  it('should fetch a nftCollection', async () => {
    nftCollection = nftCollectionRepo.create(mockCreateNftCollection);
    await nftCollectionRepo.save(nftCollection);

    const result = await service.findOne({ id: nftCollection.id });
    expect(result.id).toEqual(nftCollection.id);
  });

  it('should update a nftCollection', async () => {
    nftCollection = nftCollectionRepo.create(mockCreateNftCollection);
    await nftCollectionRepo.save(nftCollection);

    const result = await service.update(nftCollection.id, nftCollection);
    expect(result).toEqual({ ...nftCollection, ...result });
  });

  it('should remove a nftCollection', async () => {
    nftCollection = nftCollectionRepo.create(mockCreateNftCollection);
    await nftCollectionRepo.save(nftCollection);

    const result = await service.remove(nftCollection.id);
    expect(result.id).toBeUndefined();
  });
});
