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

  async findOne(idOrConditions: string | FindConditions<NftCollection>) {
    let collection: NftCollection;

    switch (true) {
      case typeof idOrConditions === 'string': {
        collection = await this.nftCollectionRepo.findOne(
          idOrConditions as string
        );
        break;
      }
      case typeof idOrConditions === 'object': {
        collection = await this.nftCollectionRepo.findOne(
          idOrConditions as FindConditions<NftCollection>
        );
        break;
      }
    }

    if (!collection)
      throw new NotFoundException(
        `NftCollection with idOrConditions ${JSON.stringify(
          idOrConditions
        )} not found`
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
