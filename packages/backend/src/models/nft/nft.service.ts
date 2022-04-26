import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

  async findOne(id: string) {
    return await this.nftRepo.findOne(id);
  }

  async update(id: string, updateNftDto: UpdateNftDto) {
    const nft = await this.nftRepo.findOne(id);
    if (!nft) throw new NotFoundException(`Nft with id ${id} not found`);

    Object.assign(nft, updateNftDto);
    return await this.nftRepo.save(nft);
  }

  async remove(id: string) {
    const nft = await this.nftRepo.findOne(id);
    if (!nft) throw new NotFoundException(`Nft with id ${id} not found`);

    return await this.nftRepo.remove(nft);
  }
}
