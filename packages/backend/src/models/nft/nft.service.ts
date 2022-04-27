import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindConditions, Repository } from 'typeorm';
import { CreateNftDto } from './dto/create-nft.dto';
import { UpdateNftDto } from './dto/update-nft.dto';
import { Nft } from './entities/nft.entity';

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
    return await this.nftRepo.find();
  }

  async findOne(idOrNft: string | FindConditions<Nft>) {
    let nft: Nft;

    switch (true) {
      case typeof idOrNft === 'string': {
        nft = await this.nftRepo.findOne(idOrNft as string);
        break;
      }
      case typeof idOrNft === 'object': {
        nft = await this.nftRepo.findOne(idOrNft as FindConditions<Nft>);
        break;
      }
    }
    if (!nft)
      throw new NotFoundException(`Nft ${JSON.stringify(idOrNft)} not found`);

    return nft;
  }

  async update(idOrNft: string | Nft, updateNftDto: UpdateNftDto) {
    let nft: Nft;

    switch (true) {
      case typeof idOrNft === 'string': {
        nft = await this.nftRepo.findOne(idOrNft as string);
        if (!nft)
          throw new NotFoundException(`Nft with id ${idOrNft} not found`);
        break;
      }
      case typeof idOrNft === 'object': {
        nft = idOrNft as Nft;
        break;
      }
    }

    const newNft = { ...nft, ...updateNftDto };
    await this.nftRepo.save(newNft);
    return newNft;
  }

  async remove(id: string) {
    const nft = await this.nftRepo.findOne(id);
    if (!nft) throw new NotFoundException(`Nft with id ${id} not found`);

    return await this.nftRepo.remove(nft);
  }
}
