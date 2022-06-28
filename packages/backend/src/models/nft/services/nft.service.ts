import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { MongoRepository } from 'typeorm';

import { CreateNftDto } from '../dto/create-nft.dto';
import { UpdateNftDto } from '../dto/update-nft.dto';

import { Nft } from 'common/entities';
import { Pagination } from 'common/decorators';
import { recoveryAgent } from 'common/utils';
import { AssetId } from 'caip';
import { ObjectId } from 'mongodb';

@Injectable()
export class NftService {
  constructor(
    @InjectRepository(Nft)
    private readonly nftRepo: MongoRepository<Nft>,
  ) {}

  async create(createNftDto: CreateNftDto) {
    const nft = this.nftRepo.create(createNftDto);
    await this.nftRepo.save(nft);
    return nft;
  }

  async findAll({ query, ...match }: Pagination & Partial<Nft>) {
    const [nfts] = await this.nftRepo
      .aggregate<Nft[]>([
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

    return nfts;
  }

  async findById(id: string) {
    const [nft] = await this.nftRepo
      .aggregate<Nft>([
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

    if (!nft) throw new NotFoundException(`NFT with id ${id} not found`);

    return nft;
  }

  async findByAssetId(assetId: AssetId) {
    const [nft] = await this.nftRepo
      .aggregate<Nft>([
        {
          $match: {
            accountIds: {
              $elemMatch: assetId.toJSON(),
            },
          },
        },
        {
          $addFields: {
            id: '$_id',
          },
        },
      ])
      .toArray();
    return nft;
  }

  async update(id: string, updateNftDto: UpdateNftDto) {
    const nft = await this.findById(id);
    const newNft = { ...nft, ...updateNftDto };
    return await this.nftRepo.save(newNft);
  }

  async remove(id: string) {
    const nft = await this.findById(id);
    return await this.nftRepo.softRemove(nft);
  }

  async recover(id?: string) {
    return await recoveryAgent(this.nftRepo, id);
  }
}
