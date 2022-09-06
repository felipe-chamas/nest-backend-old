import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { AssetType } from 'caip'
import { ObjectId } from 'mongodb'
import { MongoRepository } from 'typeorm'

import { Pagination } from '@common/decorators/pagination.decorators'
import { CreateNftCollectionDto } from '@common/dto/create-nft-collection.dto'
import { NftCollectionDto } from '@common/dto/entities/nft-collection.dto'
import { UpdateNftCollectionDto } from '@common/dto/update-nft-collection.dto'
import { recoveryAgent } from '@common/utils'

import type { NftCollectionFacet } from '@common/types/nft-collection'

@Injectable()
export class NftCollectionService {
  constructor(
    @InjectRepository(NftCollectionDto)
    private readonly nftCollectionRepo: MongoRepository<NftCollectionDto>
  ) {}

  async create(createNftCollectionDto: CreateNftCollectionDto) {
    const newNftCollection = this.nftCollectionRepo.create(createNftCollectionDto)
    await this.nftCollectionRepo.save(newNftCollection)
    return newNftCollection
  }

  async findAll({ query, ...match }: Pagination & Partial<NftCollectionDto>) {
    const [nftCollections] = await this.nftCollectionRepo
      .aggregate<NftCollectionFacet>([
        {
          $match: match
        },
        {
          $addFields: {
            id: '$_id'
          }
        },
        {
          $facet: {
            metadata: [{ $count: 'total' }],
            data: query
          }
        },
        {
          $project: {
            data: 1,
            total: { $arrayElemAt: ['$metadata.total', 0] }
          }
        }
      ])
      .toArray()

    return nftCollections
  }

  async findById(id: string) {
    const [nftCollection] = await this.nftCollectionRepo
      .aggregate<NftCollectionDto>([
        {
          $match: {
            _id: new ObjectId(id)
          }
        },
        {
          $addFields: {
            id: '$_id'
          }
        }
      ])
      .toArray()

    if (!nftCollection) throw new NotFoundException(`NFT with id ${id} not found`)

    return nftCollection
  }

  async findByAssetType(assetType: AssetType) {
    const [nftCollection] = await this.nftCollectionRepo
      .aggregate<NftCollectionDto>([
        {
          $match: {
            accountIds: {
              $elemMatch: assetType.toJSON()
            }
          }
        },
        {
          $addFields: {
            id: '$_id'
          }
        }
      ])
      .toArray()
    return nftCollection
  }

  async findAddressesByChainId(networkNamespace: string, networkReference: string) {
    const collections = await this.findAll({
      query: []
    })

    const collectionsAddresses = collections.data
      .map((collection) =>
        collection.assetTypes
          .filter(
            (type) =>
              type.chainId.namespace === networkNamespace &&
              type.chainId.reference === networkReference
          )
          .map((type) => type.assetName.reference)
      )
      .flat()

    return collectionsAddresses
  }

  async update(id: string, updateNftCollectionDto: UpdateNftCollectionDto) {
    const nftCollection = await this.findById(id)
    Object.assign(nftCollection, updateNftCollectionDto)
    return await this.nftCollectionRepo.save(nftCollection)
  }

  async remove(id: string) {
    const nftCollection = await this.findById(id)
    return this.nftCollectionRepo.softRemove(nftCollection)
  }

  async recover(id?: string) {
    return await recoveryAgent(this.nftCollectionRepo, id)
  }
}
