import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindConditions, FindManyOptions, ObjectID, Repository } from 'typeorm';
import { CreateNftCollectionDto } from '../dto/create-nft-collection.dto';
import { UpdateNftCollectionDto } from '../dto/update-nft-collection.dto';
import { NftCollection } from '../../../common/entities/nft-collection.entity';
import { Pagination } from 'common/decorators';

import { recoveryAgent } from 'common/utils';
import { AssetType } from 'caip';

@Injectable()
export class NftCollectionService {
  constructor(
    @InjectRepository(NftCollection)
    private readonly nftCollectionRepo: Repository<NftCollection>,
  ) {}

  async create(createNftCollectionDto: CreateNftCollectionDto) {
    const newNftCollection = this.nftCollectionRepo.create(
      createNftCollectionDto,
    );
    await this.nftCollectionRepo.save(newNftCollection);
    return newNftCollection;
  }

  async findAll(options?: FindManyOptions<NftCollection> | Pagination) {
    return await this.nftCollectionRepo.find(options);
  }

  async findOne(conditions: FindConditions<NftCollection>) {
    let nftCollection: NftCollection;
    if (conditions?.id)
      nftCollection = await this.nftCollectionRepo.findOne(
        String(conditions.id),
      );
    else nftCollection = await this.nftCollectionRepo.findOne(conditions);

    if (!nftCollection) throw new NotFoundException(`Nft with not found`);

    return nftCollection;
  }

  async findByAssetType(assetType: AssetType) {
    const nftCollection = await this.nftCollectionRepo.findOne({
      where: {
        assetTypes: { $elemMatch: assetType.toJSON() },
      },
    });
    return nftCollection;
  }

  async update(id: string, updateNftCollectionDto: UpdateNftCollectionDto) {
    const nftCollection = await this.nftCollectionRepo.findOne(id);
    if (!nftCollection)
      throw new NotFoundException(`Nft with id ${id} not found`);

    Object.assign(nftCollection, updateNftCollectionDto);
    return await this.nftCollectionRepo.save(nftCollection);
  }

  async remove(id: string) {
    const nftCollection = await this.nftCollectionRepo.findOne(id);
    if (!nftCollection)
      throw new NotFoundException(`Nft with id ${id} not found`);

    return this.nftCollectionRepo.softRemove(nftCollection);
  }

  async recover(id?: ObjectID) {
    return await recoveryAgent(this.nftCollectionRepo, id);
  }
}
