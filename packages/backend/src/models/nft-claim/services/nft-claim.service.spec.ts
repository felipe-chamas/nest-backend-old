import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import {
  createConnection,
  getConnection,
  getRepository,
  Repository,
} from 'typeorm';
import {
  mockCreateNftClaim,
  mockUpdateNftClaim,
} from '../../../test/mocks/nft-claim.mock';
import { NftClaim } from '../../../common/entities/nft-claim.entity';
import { NftClaimService } from './nft-claim.service';

const dbConnName = 'default';
const config = new ConfigService();

describe('NftClaimService', () => {
  let service: Partial<NftClaimService>;
  let nftClaimRepo: Repository<NftClaim>;

  beforeEach(async () => {
    await Test.createTestingModule({
      providers: [
        { provide: getRepositoryToken(NftClaim), useClass: Repository },
      ],
    }).compile();

    const connection = await createConnection({
      type: 'mongodb',
      url: config.get<string>('database.url'),
      entities: [NftClaim],
      useNewUrlParser: true,
      logging: true,
      useUnifiedTopology: true,
      name: dbConnName,
    });

    nftClaimRepo = getRepository(NftClaim, dbConnName);
    service = new NftClaimService(nftClaimRepo);

    return connection;
  });

  afterEach(async () => {
    await getConnection(dbConnName).close();
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
    const nftClaim = nftClaimRepo.create(mockCreateNftClaim);
    await nftClaimRepo.save(nftClaim);
    const id = nftClaim.id as unknown as string;

    const result = await service.remove(id);
    expect(result.id).toBeUndefined();
  });
});
