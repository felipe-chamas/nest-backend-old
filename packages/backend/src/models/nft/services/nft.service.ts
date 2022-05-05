import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import {
  FindConditions,
  FindOneOptions,
  getMongoRepository,
  ObjectID,
  Repository,
} from 'typeorm';

import { CreateNftDto } from '../dto/create-nft.dto';
import { UpdateNftDto } from '../dto/update-nft.dto';
import { Nft } from '../../../common/entities/nft.entity';
import { User } from 'common/entities';

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

  async findAll() {
    const nft = await this.nftRepo.find();

    return nft;
  }

  async findOneBy(conditions: FindConditions<Nft>) {
    const nft = await this.nftRepo.findOne(conditions);

    if (!nft) throw new NotFoundException(`Nft not found`);

    return nft;
  }

  async findOne(id: ObjectID) {
    const nft = await this.nftRepo.findOne(id);

    if (!nft) throw new NotFoundException(`Nft with id ${id} not found`);

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
