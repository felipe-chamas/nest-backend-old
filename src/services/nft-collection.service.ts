import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { AssetType, ChainId } from 'caip'
import { DeleteResult, UpdateResult } from 'mongodb'
import { SoftDeleteModel } from 'mongoose-delete'

import { Pagination } from '@common/decorators/pagination.decorators'
import { CreateNftCollectionDto } from '@common/dto/create-nft-collection.dto'
import { UpdateNftCollectionDto } from '@common/dto/update-nft-collection.dto'
import { NftCollectionDocument, NftCollectionDto } from '@common/schemas/nft-collection.schema'

@Injectable()
export class NftCollectionService {
  constructor(
    @InjectModel(NftCollectionDto.name)
    private nftCollectionModel: SoftDeleteModel<NftCollectionDocument>
  ) {}

  async create(createNftCollectionDto: CreateNftCollectionDto) {
    const newNftCollection = new this.nftCollectionModel(createNftCollectionDto)
    await newNftCollection.save()
    return newNftCollection
  }

  async findAll({ skip, limit, sort, ...match }: Pagination & Partial<NftCollectionDto>) {
    const data = await this.nftCollectionModel.find(match).sort(sort).skip(skip).limit(limit).exec()
    const total = await this.nftCollectionModel.find(match).count()
    return { data, total }
  }

  async findById(id: string) {
    const nftCollection = await this.nftCollectionModel.findById(id).exec()
    return nftCollection
  }

  async findByAssetType(assetType: AssetType) {
    const [nftCollection] = await this.nftCollectionModel
      .find()
      .elemMatch('assetTypes', assetType.toJSON())
      .exec()
    return nftCollection
  }

  async findAddressesByChainId(chainId: ChainId) {
    const nftCollections = await this.nftCollectionModel
      .find()
      .elemMatch('assetTypes', { chainId: chainId.toJSON() })
      .exec()
    return nftCollections
      .map((collection) =>
        collection.assetTypes
          .filter(
            (assetType) =>
              assetType.chainId.reference === chainId.reference &&
              assetType.chainId.namespace === chainId.namespace
          )
          .map((assetType) => assetType.assetName.reference)
      )
      .flat()
  }

  async update(id: string, update: UpdateNftCollectionDto) {
    const nftCollection = await this.nftCollectionModel.findByIdAndUpdate(id, update).exec()
    return nftCollection
  }

  async remove(id: string): Promise<DeleteResult> {
    return await this.nftCollectionModel.deleteById(id).exec()
  }

  async recover(id?: string): Promise<UpdateResult> {
    return await this.nftCollectionModel.restore({ _id: id }).exec()
  }
}
