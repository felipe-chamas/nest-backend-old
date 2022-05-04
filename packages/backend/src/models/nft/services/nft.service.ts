import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import {
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

  // async findOne(idOrNft: string | FindOneOptions<Nft>) {
  //   let nft: Nft;

  //   switch (true) {
  //     case typeof idOrNft === 'string': {
  //       nft = await this.nftRepo.findOne(idOrNft as string);
  //       break;
  //     }
  //     case typeof idOrNft === 'object': {
  //       nft = await this.nftRepo.findOne(idOrNft as FindOneOptions<Nft>);
  //       break;
  //     }
  //   }
  //   if (!nft)
  //     throw new NotFoundException(`Nft ${JSON.stringify(idOrNft)} not found`);

  //   return nft;
  // }

  // async update(idOrNft: string | Nft, updateNftDto: UpdateNftDto) {
  //   let nft: Nft;

  //   switch (true) {
  //     case typeof idOrNft === 'string': {
  //       nft = await this.nftRepo.findOne(idOrNft as string);
  //       if (!nft)
  //         throw new NotFoundException(`Nft with id ${idOrNft} not found`);
  //       break;
  //     }
  //     case typeof idOrNft === 'object': {
  //       nft = idOrNft as Nft;
  //       break;
  //     }
  //   }

  //   const newNft = { ...nft, ...updateNftDto };
  //   return await this.nftRepo.save(newNft);
  // }

  async find(options?: FindOneOptions<Nft>) {
    const nft = await this.nftRepo.findOne(options);

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
