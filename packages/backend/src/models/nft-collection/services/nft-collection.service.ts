import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { CreateNftCollectionDto } from '../dto/create-nft-collection.dto';
import { UpdateNftCollectionDto } from '../dto/update-nft-collection.dto';
import { NftCollection } from '../../../common/entities/nft-collection.entity';
import { Pagination } from 'common/decorators';

import { recoveryAgent } from 'common/utils';
import { AssetType } from 'caip';
import { ObjectId } from 'mongodb';

@Injectable()
export class NftCollectionService {
  constructor(
    @InjectRepository(NftCollection)
    private readonly nftCollectionRepo: MongoRepository<NftCollection>,
  ) {}

  async create(createNftCollectionDto: CreateNftCollectionDto) {
    const newNftCollection = this.nftCollectionRepo.create(
      createNftCollectionDto,
    );
    await this.nftCollectionRepo.save(newNftCollection);
    return newNftCollection;
  }

  async findAll({ query, ...match }: Pagination & Partial<NftCollection>) {
    const [nftCollections] = await this.nftCollectionRepo
      .aggregate<NftCollection[]>([
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

    return nftCollections;
  }

  async findById(id: string) {
    const [nftCollection] = await this.nftCollectionRepo
      .aggregate<NftCollection>([
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

    if (!nftCollection)
      throw new NotFoundException(`NFT with id ${id} not found`);

    return nftCollection;
  }

  async findByAssetType(assetType: AssetType) {
    const [nftCollection] = await this.nftCollectionRepo
      .aggregate<NftCollection>([
        {
          $match: {
            accountIds: {
              $elemMatch: assetType.toJSON(),
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
    return nftCollection;
  }

  async update(id: string, updateNftCollectionDto: UpdateNftCollectionDto) {
    const nftCollection = await this.findById(id);
    Object.assign(nftCollection, updateNftCollectionDto);
    return await this.nftCollectionRepo.save(nftCollection);
  }

  async remove(id: string) {
    const nftCollection = await this.findById(id);
    return this.nftCollectionRepo.softRemove(nftCollection);
  }

  async recover(id?: string) {
    return await recoveryAgent(this.nftCollectionRepo, id);
  }
}
