import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { AssetType } from 'caip'
import { SoftDeleteModel } from 'mongoose-delete'

import { NftUnboxingDocument, NftUnboxingDto } from '@common/schemas/nft-unboxing.schema'

@Injectable()
export class NftUnboxingService {
  constructor(
    @InjectModel(NftUnboxingDto.name)
    private nftUnboxingModel: SoftDeleteModel<NftUnboxingDocument>
  ) {}

  async findByAssetType(assetType: AssetType) {
    const [nftUnboxing] = await this.nftUnboxingModel?.find({ assetType: assetType.toJSON() })
    return nftUnboxing
  }
}
