import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindConditions, Repository } from 'typeorm';
import { CreateNftCollectionDto } from '../dto/create-nft-collection.dto';
import { UpdateNftCollectionDto } from '../dto/update-nft-collection.dto';
import { NftCollection } from '../../../common/entities/nft-collection.entity';

@Injectable()
export class NftCollectionService {
  constructor(
    @InjectRepository(NftCollection)
    private readonly nftCollectionRepo: Repository<NftCollection>
  ) {}

  async create(createNftCollectionDto: CreateNftCollectionDto) {
    const newNftCollection = this.nftCollectionRepo.create(
      createNftCollectionDto
    );
    await this.nftCollectionRepo.save(newNftCollection);
    return newNftCollection;
  }

  async findAll() {
    return await this.nftCollectionRepo.find();
  }

  async findOneBy(conditions: FindConditions<NftCollection>) {
    const collection = await this.nftCollectionRepo.findOne(conditions);
    if (!collection)
      throw new NotFoundException(
        `NftCollection with conditions ${JSON.stringify(conditions)} not found`
      );

    return collection;
  }

  async findOne(id: string) {
    const collection = await this.nftCollectionRepo.findOne(id);
    if (!collection)
      throw new NotFoundException(
        `NftCollection with id ${JSON.stringify(id)} not found`
      );

    return collection;
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

    return this.nftCollectionRepo.remove(nftCollection);
  }
}
