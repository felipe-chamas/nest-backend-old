import { Injectable, NotFoundException } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { ChainId } from 'caip';
import { ChainIdDto } from 'common/types';
import { Pagination } from 'common/decorators';
import { Chain } from 'common/entities';
import { recoveryAgent } from 'common/utils';

import { MongoRepository } from 'typeorm';

import { CreateChainDto } from '../dto/create-chain.dto';

import { UpdateChainDto } from '../dto/update-chain.dto';
import { ObjectId } from 'mongodb';

@Injectable()
export class ChainService {
  constructor(
    @InjectRepository(Chain) private readonly chainRepo: MongoRepository<Chain>,
  ) {}

  async create(createChainDto: CreateChainDto) {
    const chainData = {
      ...createChainDto,
      chainId: new ChainId(createChainDto.chainId).toJSON() as ChainIdDto,
    };
    const chain = this.chainRepo.create(chainData);
    await this.chainRepo.save(chain);
    return chain;
  }

  async findAll({ query, ...match }: Pagination & Partial<Chain>) {
    const [chains] = await this.chainRepo
      .aggregate<Chain[]>([
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

    return chains;
  }

  async findById(id: string) {
    const [chain] = await this.chainRepo
      .aggregate<Chain>([
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

    if (!chain) throw new NotFoundException(`Chain with id ${id} not found`);

    return chain;
  }

  async findByChainId(chainId: ChainId) {
    const [chain] = await this.chainRepo
      .aggregate<Chain>([
        {
          $match: {
            chainId: chainId.toJSON(),
          },
        },
        {
          $addFields: {
            id: '$_id',
          },
        },
      ])
      .toArray();
    return chain;
  }

  async update(id: string, updatedChain: UpdateChainDto) {
    const chain = await this.findById(id);
    Object.assign(chain, updatedChain);
    return await this.chainRepo.save(chain);
  }

  async remove(id: string) {
    const chain = await this.findById(id);
    return this.chainRepo.softRemove(chain);
  }

  async recover(id?: string) {
    return await recoveryAgent(this.chainRepo, id);
  }
}
