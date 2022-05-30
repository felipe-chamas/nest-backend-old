import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import {
  FindConditions,
  FindManyOptions,
  getMongoRepository,
  ObjectID,
  Repository,
} from 'typeorm';

import { CreateNftDto } from '../dto/create-nft.dto';
import { UpdateNftDto } from '../dto/update-nft.dto';

import { User, Nft } from 'common/entities';
import { Pagination } from 'common/decorators';

@Injectable()
export class NftService {
  constructor(
    @InjectRepository(Nft)
    private readonly nftRepo: Repository<Nft>
  ) {}

  async create(createNftDto: CreateNftDto) {
    const nft = this.nftRepo.create(createNftDto);
    await this.nftRepo.save(nft);
    return nft;
  }

  async findAll(options?: FindManyOptions<Nft> | Pagination) {
    const nft = await this.nftRepo.find(options);
    return nft;
  }

  async findOne(conditions: FindConditions<Nft>) {
    let nft: Nft;
    if (conditions?.id) nft = await this.nftRepo.findOne(String(conditions.id));
    else nft = await this.nftRepo.findOne(conditions);

    if (!nft) throw new NotFoundException(`Nft not found`);

    const user = await getMongoRepository(User).findOne(nft.userId);

    return { ...nft, user };
  }

  async update(id: ObjectID, updateNftDto: UpdateNftDto) {
    const nft = await this.nftRepo.findOne(id);

    if (!nft) throw new NotFoundException(`Nft with id ${id} not found`);

    const newNft = { ...nft, ...updateNftDto };
    return await this.nftRepo.save(newNft);
  }

  async remove(id: ObjectID) {
    const nft = await this.nftRepo.findOne(id);
    if (!nft) throw new NotFoundException(`Nft with id ${id} not found`);

    return await this.nftRepo.remove(nft);
  }
}
