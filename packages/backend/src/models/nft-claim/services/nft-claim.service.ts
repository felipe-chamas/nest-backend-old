import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Pagination } from 'common/decorators';
import { NftClaim } from 'common/entities';
import { recoveryAgent } from 'common/utils';
import { ObjectId } from 'mongodb';
import { MongoRepository } from 'typeorm';
import { CreateNftClaimDto } from '../dto/create-nft-claim.dto';
import { UpdateNftClaimDto } from '../dto/update-nft-claim.dto';

@Injectable()
export class NftClaimService {
  constructor(
    @InjectRepository(NftClaim)
    private readonly nftClaimRepo: MongoRepository<NftClaim>,
  ) {}

  async create(createNftClaimDto: CreateNftClaimDto) {
    const nftClaim = this.nftClaimRepo.create(createNftClaimDto);
    await this.nftClaimRepo.save(nftClaim);
    return nftClaim;
  }

  async findAll({ query, ...match }: Pagination & Partial<NftClaim>) {
    const [nftClaims] = await this.nftClaimRepo
      .aggregate<NftClaim[]>([
        {
          $match: match,
        },
        {
          $addFields: {
            id: '$_id',
          },
        },
        {
          $facet: {
            metadata: [{ $count: 'total' }],
            data: query,
          },
        },
        {
          $project: {
            data: 1,
            total: { $arrayElemAt: ['$metadata.total', 0] },
          },
        },
      ])
      .toArray();

    return nftClaims;
  }

  async findById(id: string) {
    const [nftClaim] = await this.nftClaimRepo
      .aggregate<NftClaim>([
        {
          $match: {
            _id: new ObjectId(id),
          },
        },
        {
          $addFields: {
            id: '$_id',
          },
        },
      ])
      .toArray();

    if (!nftClaim)
      throw new NotFoundException(`NFTClaim with id ${id} not found`);

    return nftClaim;
  }

  async findOne(conditions: Partial<NftClaim>) {
    const [nftClaim] = await this.nftClaimRepo
      .aggregate<NftClaim>([
        {
          $match: {
            ...conditions,
          },
        },
        {
          $addFields: {
            id: '$_id',
          },
        },
      ])
      .toArray();

    if (!nftClaim)
      throw new NotFoundException(
        `NftClaim ${JSON.stringify(conditions)} not found`,
      );

    return nftClaim;
  }

  async update(id: string, updateNftClaimDto: UpdateNftClaimDto) {
    const nftClaim = await this.findById(id);
    const newNftClaim = { ...nftClaim, ...updateNftClaimDto };
    return await this.nftClaimRepo.save(newNftClaim);
  }

  async remove(id: string) {
    const nftClaim = await this.findById(id);
    return await this.nftClaimRepo.softRemove(nftClaim);
  }

  async recover(id?: string) {
    return await recoveryAgent(this.nftClaimRepo, id);
  }
}
