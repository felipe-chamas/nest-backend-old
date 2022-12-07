import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { DeleteResult, UpdateResult } from 'mongodb'
import { SoftDeleteModel } from 'mongoose-delete'

import { BridgeDocument, BridgeDto } from '@common/schemas/bridge.schema'

@Injectable()
export class BridgeService {
  constructor(
    @InjectModel(BridgeDto.name)
    private bridgeModel: SoftDeleteModel<BridgeDocument>
  ) {}

  async create(createBridgeDto: Partial<BridgeDto>) {
    const newBridge = new this.bridgeModel(createBridgeDto)
    await newBridge.save()
    return newBridge
  }

  async findOne({ txSource }: Partial<BridgeDto>) {
    const bridge = await this.bridgeModel.findOne({ txSource }).exec()
    return bridge
  }

  async update(id: string, update: Partial<BridgeDto>) {
    const bridge = await this.bridgeModel.findByIdAndUpdate(id, update).exec()
    return bridge
  }

  async remove(id: string): Promise<DeleteResult> {
    return await this.bridgeModel.deleteById(id).exec()
  }

  async recover(id?: string): Promise<UpdateResult> {
    return await this.bridgeModel.restore({ _id: id }).exec()
  }
}
